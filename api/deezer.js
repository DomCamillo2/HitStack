export default async function handler(req, res) {
  const path = req.query.path || '';

  const targetUrl = new URL('https://api.deezer.com/' + path);
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (typeof value === 'string') targetUrl.searchParams.set(key, value);
  }

  try {
    const response = await fetch(targetUrl.toString());
    const data = await response.text();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(response.status).send(data);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ error: 'Deezer API request failed' });
  }
}
