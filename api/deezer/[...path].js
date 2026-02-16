// Vercel Serverless Function – Proxy für Deezer API
export default async function handler(req, res) {
  const { path } = req.query;
  const deezerPath = Array.isArray(path) ? path.join('/') : (path || '');

  // Query-String weiterleiten
  const url = new URL(`https://api.deezer.com/${deezerPath}`);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (typeof value === 'string') url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Deezer proxy error:', err);
    res.status(500).json({ error: 'Deezer API request failed' });
  }
}
