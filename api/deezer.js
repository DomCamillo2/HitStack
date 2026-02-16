export async function GET(request) {
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '';

  const targetUrl = new URL('https://api.deezer.com/' + path);
  // Alle Query-Params außer 'path' weiterleiten
  url.searchParams.forEach((value, key) => {
    if (key !== 'path') targetUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(targetUrl.toString());
    const data = await response.text();

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Deezer API request failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
