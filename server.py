#!/usr/bin/env python3
"""
Vélourcare Ortho — Enterprise Invoicing & Sync Server
Includes SQLite persistent storage, automated daily backups,
and Cloudflare HTTPS Tunnel for seamless phone and remote access.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import threading
import time
import json
import sqlite3
import hashlib
import secrets
import subprocess
import re
from datetime import datetime

# Windows console encoding safeguard
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
BACKUP_DIR = os.path.join(DATA_DIR, 'backups')
BIN_DIR = os.path.join(BASE_DIR, 'bin')
CLOUDFLARED_BIN = os.path.join(BIN_DIR, 'cloudflared.exe')
DB_PATH = os.path.join(DATA_DIR, 'velourcare.db')
URL_FILE = os.path.join(DATA_DIR, 'public_url.txt')

PREFERRED_PORT = int(os.environ.get('PORT', 8000))
DEFAULT_PIN = "2026"
IS_CLOUD_ENV = bool(os.environ.get('PORT') or os.environ.get('RENDER') or sys.platform != 'win32')

TUNNEL_URL = None
TUNNEL_PROCESS = None
FAILED_ATTEMPTS = {}  # ip -> {"count": int, "locked_until": float}

# Ensure directory tree
os.makedirs(BACKUP_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# Database Management (SQLite)
# ---------------------------------------------------------------------------
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def hash_pin(pin: str, salt: str = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((salt + pin).encode('utf-8')).hexdigest()
    return hashed, salt

def verify_pin(pin: str, hashed: str, salt: str) -> bool:
    expected, _ = hash_pin(pin, salt)
    return hmac_compare(expected, hashed)

def hmac_compare(a: str, b: str) -> bool:
    import hmac
    return hmac.compare_digest(a.encode('utf-8'), b.encode('utf-8'))

def init_db():
    conn = get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS metadata (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                created_at TEXT NOT NULL,
                last_used TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS store_data (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)

        # Initialize Master PIN if not present
        row = conn.execute("SELECT value FROM metadata WHERE key = 'pin_hash'").fetchone()
        if not row:
            hashed, salt = hash_pin(DEFAULT_PIN)
            conn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('pin_hash', ?)", (hashed,))
            conn.execute("INSERT OR REPLACE INTO metadata (key, value) VALUES ('pin_salt', ?)", (salt,))
    conn.close()

def is_valid_token(token: str) -> bool:
    if not token or len(token) < 20:
        return False
    conn = get_db()
    try:
        row = conn.execute("SELECT token FROM sessions WHERE token = ?", (token,)).fetchone()
        if row:
            now = datetime.utcnow().isoformat()
            conn.execute("UPDATE sessions SET last_used = ? WHERE token = ?", (now, token))
            conn.commit()
            return True
        return False
    finally:
        conn.close()

def create_session() -> str:
    token = secrets.token_hex(32)
    now = datetime.utcnow().isoformat()
    conn = get_db()
    with conn:
        conn.execute("INSERT INTO sessions (token, created_at, last_used) VALUES (?, ?, ?)", (token, now, now))
    conn.close()
    return token

def get_store_payload():
    conn = get_db()
    try:
        row = conn.execute("SELECT payload FROM store_data WHERE id = 1").fetchone()
        if row:
            return json.loads(row['payload'])
        return None
    finally:
        conn.close()

def save_store_payload(data: dict):
    payload_str = json.dumps(data, ensure_ascii=False)
    now = datetime.utcnow().isoformat()
    conn = get_db()
    with conn:
        conn.execute("""
            INSERT INTO store_data (id, payload, updated_at) VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at
        """, (payload_str, now))
    conn.close()

    # Trigger disk backup
    save_disk_backup(data)

def save_disk_backup(data: dict):
    try:
        date_str = datetime.now().strftime("%Y-%m-%d")
        backup_file = os.path.join(BACKUP_DIR, f"velourcare-backup-{date_str}.json")
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Backup Error] Could not write backup: {e}")

# ---------------------------------------------------------------------------
# Cloudflare Tunnel Manager
# ---------------------------------------------------------------------------
def ensure_cloudflared():
    if os.path.exists(CLOUDFLARED_BIN):
        return True
    try:
        os.makedirs(BIN_DIR, exist_ok=True)
        print("[Tunnel] cloudflared.exe not found. Downloading Cloudflare tunnel binary...")
        import urllib.request
        url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        urllib.request.urlretrieve(url, CLOUDFLARED_BIN)
        print("[Tunnel] Download complete.")
        return True
    except Exception as e:
        print(f"[Tunnel] Could not auto-download cloudflared: {e}")
        return False

def start_cloudflare_tunnel(local_port):
    global TUNNEL_URL, TUNNEL_PROCESS
    if IS_CLOUD_ENV:
        return
    if not os.path.exists(CLOUDFLARED_BIN):
        if not ensure_cloudflared():
            print("[Tunnel] Running in local-only mode.")
            return

    cmd = [
        CLOUDFLARED_BIN,
        "tunnel",
        "--url", f"http://127.0.0.1:{local_port}",
        "--no-autoupdate"
    ]

    print("[Tunnel] Starting secure Cloudflare HTTPS tunnel...")
    try:
        TUNNEL_PROCESS = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',
            bufsize=1
        )
    except Exception as e:
        print(f"[Tunnel Error] Could not start cloudflared: {e}")
        return

    def watch_tunnel():
        global TUNNEL_URL
        # Cloudflare prints connection info to stderr
        pattern = re.compile(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com')
        for line in TUNNEL_PROCESS.stderr:
            match = pattern.search(line)
            if match and not TUNNEL_URL:
                TUNNEL_URL = match.group(0)
                try:
                    with open(URL_FILE, 'w', encoding='utf-8') as f:
                        f.write(TUNNEL_URL)
                except Exception:
                    pass
                print("\n" + "=" * 64)
                print("  ✦ LIVE PHONE & REMOTE ACCESS URL ✦")
                print("=" * 64)
                print(f"  Public HTTPS : {TUNNEL_URL}")
                print("=" * 64 + "\n")

    threading.Thread(target=watch_tunnel, daemon=True).start()

# ---------------------------------------------------------------------------
# HTTP & REST API Request Handler
# ---------------------------------------------------------------------------
class VelourcareHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def send_json(self, status_code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def get_token(self):
        return self.headers.get('X-Session-Token', '').strip()

    def read_json_body(self):
        content_len = int(self.headers.get('Content-Length', 0))
        if content_len == 0:
            return {}
        raw = self.rfile.read(content_len).decode('utf-8')
        return json.loads(raw)

    def check_rate_limit(self):
        ip = self.client_address[0]
        now = time.time()
        record = FAILED_ATTEMPTS.get(ip)
        if record and record.get('locked_until', 0) > now:
            remaining = int(record['locked_until'] - now)
            return False, f"Too many failed attempts. Try again in {remaining} seconds."
        return True, None

    def record_failed_attempt(self):
        ip = self.client_address[0]
        now = time.time()
        record = FAILED_ATTEMPTS.get(ip, {'count': 0, 'locked_until': 0})
        record['count'] += 1
        if record['count'] >= 5:
            record['locked_until'] = now + 30  # Lock for 30s
            record['count'] = 0
        FAILED_ATTEMPTS[ip] = record

    def clear_failed_attempt(self):
        ip = self.client_address[0]
        if ip in FAILED_ATTEMPTS:
            del FAILED_ATTEMPTS[ip]

    def do_GET(self):
        path = self.path.split('?')[0]

        # Public status / tunnel endpoint
        if path == '/api/tunnel-url':
            self.send_json(200, {"url": TUNNEL_URL, "status": "online" if TUNNEL_URL else "connecting"})
            return

        # Sync data endpoint
        if path == '/api/data':
            data = get_store_payload()
            self.send_json(200, {"ok": True, "data": data})
            return

        # Standard static file handling
        return super().do_GET()

    def do_POST(self):
        path = self.path.split('?')[0]

        # Save synced data
        if path == '/api/data':
            try:
                data = self.read_json_body()
                if not isinstance(data, dict):
                    raise ValueError("Payload must be an object")
                save_store_payload(data)
                self.send_json(200, {"ok": True, "savedAt": datetime.utcnow().isoformat()})
            except Exception as e:
                self.send_json(400, {"error": f"Failed to save data: {e}"})
            return

        self.send_json(404, {"error": "Endpoint not found."})

    def end_headers(self):
        # Dev caching friendly
        if not self.path.startswith('/api/'):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def log_message(self, format, *args):
        # Quiet heartbeat polls
        if '/api/tunnel-url' in self.path or '/api/auth/status' in self.path:
            return
        if self.path in ('/', '/index.html') or 'error' in format.lower() or '/api/' in self.path:
            sys.stdout.write(f"[Server] {self.address_string()} - {format%args}\n")

# ---------------------------------------------------------------------------
# Server Startup
# ---------------------------------------------------------------------------
def find_available_port(start_port=PREFERRED_PORT, max_attempts=20):
    import socket
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    return start_port

def open_browser(url):
    time.sleep(1.0)
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"Browser launch: {e}")

def main():
    os.chdir(BASE_DIR)
    init_db()

    port = find_available_port(PREFERRED_PORT)
    local_url = f"http://localhost:{port}/"

    print("=" * 64)
    print("  ✦ VÉLOURCARE ORTHO — ENTERPRISE INVOICE SERVER ✦")
    print("=" * 64)
    print(f"  Local Access  : {local_url}")
    print(f"  Database      : {DB_PATH}")
    print(f"  Backup Folder : {BACKUP_DIR}")
    print("=" * 64)

    # Launch Cloudflare tunnel for remote/phone access
    start_cloudflare_tunnel(port)

    # Launch local browser (only when running locally on desktop)
    if not IS_CLOUD_ENV:
        threading.Thread(target=open_browser, args=(local_url,), daemon=True).start()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('0.0.0.0', port), VelourcareHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down Vélourcare server...")
            if TUNNEL_PROCESS:
                try:
                    TUNNEL_PROCESS.terminate()
                except Exception:
                    pass
            httpd.shutdown()

if __name__ == '__main__':
    main()
