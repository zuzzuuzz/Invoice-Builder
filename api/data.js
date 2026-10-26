module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      data: null,
      message: 'Running on Vercel'
    });
  }

  if (req.method === 'POST') {
    return res.status(200).json({
      ok: true,
      savedAt: new Date().toISOString()
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
