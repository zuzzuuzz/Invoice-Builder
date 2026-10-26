module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Dynamic resolution for any Redis/KV URL & Token injected by Vercel / Upstash integrations
  const envEntries = Object.entries(process.env);
  const findVar = (patterns) => {
    for (const p of patterns) {
      if (process.env[p]) return process.env[p];
    }
    const found = envEntries.find(([k]) => patterns.some((p) => k.includes(p)));
    return found ? found[1] : null;
  };

  const kvUrl = findVar([
    'UPSTASH_REDIS_REST_URL',
    'KV_REST_API_URL',
    'STORAGE_REST_API_URL',
    'STORAGE_URL',
    '_REST_API_URL'
  ]);

  const kvToken = findVar([
    'UPSTASH_REDIS_REST_TOKEN',
    'KV_REST_API_TOKEN',
    'STORAGE_REST_API_TOKEN',
    'STORAGE_TOKEN',
    '_REST_API_TOKEN'
  ]);

  // Fallback if cloud storage credentials are not yet configured
  if (!kvUrl || !kvToken) {
    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        data: null,
        configured: false,
        message: 'No cloud database connected yet. Using browser local storage.'
      });
    }
    if (req.method === 'POST') {
      return res.status(200).json({
        ok: true,
        savedAt: new Date().toISOString(),
        configured: false
      });
    }
  }

  const STORAGE_KEY = 'velourcare_invoice_store';

  // GET: Fetch synced invoices, clients, catalog, and settings from cloud database
  if (req.method === 'GET') {
    try {
      const response = await fetch(kvUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['GET', STORAGE_KEY])
      });

      const result = await response.json();
      let data = null;
      if (result && result.result) {
        data = typeof result.result === 'string' ? JSON.parse(result.result) : result.result;
      }

      return res.status(200).json({
        ok: true,
        data: data,
        configured: true,
        syncedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('[Cloud DB GET Error]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST: Save updated state to cloud database
  if (req.method === 'POST') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        payload = JSON.parse(payload);
      }

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ ok: false, error: 'Invalid JSON payload' });
      }

      const response = await fetch(kvUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(['SET', STORAGE_KEY, JSON.stringify(payload)])
      });

      const result = await response.json();

      return res.status(200).json({
        ok: true,
        savedAt: new Date().toISOString(),
        configured: true,
        result: result.result
      });
    } catch (err) {
      console.error('[Cloud DB POST Error]', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
