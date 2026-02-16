export async function GET(request) {
  const url = new URL(request.url);
  // Alles nach /api/audio/ ist der Audio-Pfad
  const audioPath = url.pathname.replace(/^\/api\/audio\/?/, '');

  const targetUrl = 'https://cdnt-preview.dzcdn.net/' + audioPath;

  try {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return new Response(null, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Audio proxy failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
