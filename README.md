# Vélourcare Ortho — Localhost Invoice Builder

A customized, privacy-first invoice generator and billing management application built specifically for **Vélourcare Ortho** (`velourcareortho.com`). Runs locally on your machine with zero cloud dependencies or subscription fees.

---

## 🌟 Key Features

### 1. Brand Identity & Design System
- **Colors**: Vélourcare Warm Gold (`#b89b69` / `#9a7c4d`), Deep Ink (`#1E252B`), and Cream Linen (`#F7F5EF` / `#FCFBF8`).
- **Typography**: Editorial headings with *Playfair Display* paired with clinical clarity in *Inter*.
- **Branded Emblem**: Bundled with the official Vélourcare Ortho high-resolution logo and favicon.
- **International Medical Standard**: Formatted with clear clinical aligner terminology, doctor/practice billing credentials, and treatment case IDs.

### 2. Multi-Currency & Doctor/Patient Support
- Supports **USD ($)**, **PKR (Rs)**, **SGD (S$)**, **EUR (€)**, **GBP (£)**, **AED**, **SAR**, **CAD**, and **AUD**.
- Built-in exchange rate calculator to convert catalog items into any target currency.
- Caters to both **B2B Doctor & Clinic Accounts** (e.g. OnyxCeph digital setups) and **Direct Patient Invoicing**.

### 3. Integrated Catalog & Staging Packages
Pre-configured with Vélourcare Ortho's official per-case setup tiers:
- **Simple Case Setup** ($50) — Single-arch setup, basic staging, attachments, 1 revision.
- **Moderate Case Setup** ($75) — Dual-arch setup, biomechanical staging, optimized attachments, IPR planning, superimposition report.
- **Complex Case Setup** ($100) — Full-complexity setup, advanced biomechanics, root control, complex attachment strategy, detailed IPR mapping.
- **Additional Revision** ($15).
- **Same-Day Rush Delivery** (+50% surcharge).

### 4. Professional Export & Printing
- **Pixel-perfect PDF**: Click "Download PDF" or press `Ctrl + P` to generate print-ready PDFs formatted for standard **A4** or **US Letter**.
- **Bank Details & Payment QR Code**: Professional payment box with your account title, bank name, account number, IBAN, SWIFT, and payment QR code (supports custom QR upload or auto-generates from your payment link/IBAN).
- **Email Draft**: Click "Email to client" to generate pre-filled email text referencing the invoice number and due date.
- **CSV Data Export**: Export filtered or all-time billing records to `.csv` for bookkeeping in Excel.

### 5. Client Address Book & Billing Workflow
- Track invoice statuses: **Draft**, **Sent / Awaiting Payment**, **Partially Paid**, **Overdue**, **Paid**, and **Void**.
- Record partial or full payments with dates.
- Address book to store doctor practices, contact emails, phone numbers, and default currencies.

---

## 🚀 How to Run on Localhost & Mobile Phone

### Option A: One-Click Windows Batch Script
Double-click `start_server.bat` in this folder:
```cmd
start_server.bat
```
This automatically starts the local sync server and Cloudflare tunnel, then opens `http://localhost:8000` in your default browser.

### Option B: Python Command
Run in PowerShell or Command Prompt:
```powershell
python server.py
```

### 📱 Access From Your Phone
1. Click the **📱 Phone Access** button in the sidebar.
2. Scan the on-screen QR code with your mobile camera or copy the secure live tunnel URL.
3. Any invoice or client created on your phone immediately synchronizes to your computer and SQLite database!

---

## 🔒 Data Protection & Automatic Backups
- **Local SQLite Database**: All billing records, clients, services, and settings are saved to `data/velourcare.db`.
- **Daily Automated Backups**: A dated JSON backup is automatically created every day in `data/backups/`.
- **Manual Backups**: You can also export and restore full backups anytime via **Settings → Backup & data**.
