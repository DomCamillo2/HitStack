// Vercel Serverless Function – Proxy für Deezer Audio CDN
export default async function handler(req, res) {
  const { path } = req.query;
  const audioPath = Array.isArray(path) ? path.join('/') : (path || '');

  const url = `https://cdnt-preview.dzcdn.net/${audioPath}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).end();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);
  } catch (err) {
    console.error('Audio proxy error:', err);
    res.status(500).json({ error: 'Audio proxy request failed' });
  }
}
