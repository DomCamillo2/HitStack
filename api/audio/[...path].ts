// Vercel Serverless Function – Proxy für Deezer Audio CDN
// Leitet Audio-Previews durch, um CORS-Probleme zu vermeiden

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const audioPath = Array.isArray(path) ? path.join('/') : (path || '');

  const url = `https://cdnt-preview.dzcdn.net/${audioPath}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).end();
    }

    // Audio-Header weiterleiten
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');

    const buffer = Buffer.from(await response.arrayBuffer());
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Audio proxy request failed' });
  }
}
