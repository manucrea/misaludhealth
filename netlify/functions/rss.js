export async function handler(event) {
  const target = event.queryStringParameters?.url;
  if (!target) {
    return { statusCode: 400, body: "Missing ?url=" };
  }
  const allowed = "https://misalud-21041669.hs-sites-na2.com/blog/rss.xml";
  if (target !== allowed) {
    return { statusCode: 403, body: "URL not allowed" };
  }

  try {
    const res = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
    const body = await res.text();

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
      body,
    };
  } catch (e) {
    return { statusCode: 500, body: "Proxy error: " + (e?.message || e) };
  }
}
