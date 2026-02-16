export default async function handler(req, res) {
  const path = req.query.path || '';
  const targetUrl = 'https://cdnt-preview.dzcdn.net/' + path;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).end();
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(buffer);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Audio proxy failed' });
  }
}
