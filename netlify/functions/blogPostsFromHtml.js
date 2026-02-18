function extractMeta(html) {
  const pick = (re) => {
    const m = html.match(re);
    return m ? m[1].trim() : "";
  };

  // intenta og:description primero, luego meta description
  return (
    pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
    ""
  );
}

function stripHtml(s) {
  return (s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function handler() {
  const rssUrl = "https://misalud-21041669.hs-sites-na2.com/blog/rss.xml";

  try {
    const rssRes = await fetch(rssUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    const rss = await rssRes.text();

    // extrae items básicos del RSS (título y link)
    const items = [...rss.matchAll(/<item>[\s\S]*?<\/item>/g)].map((block) => {
      const title = (block[0].match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
      const link = (block[0].match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim();
      return { title, url: link };
    }).filter(i => i.title && i.url);

    // trae HTML de cada post (limitamos a 20 por seguridad)
    const limited = items.slice(0, 20);

    const posts = [];
    for (const it of limited) {
      try {
        const pageRes = await fetch(it.url, { headers: { "User-Agent": "Mozilla/5.0" } });
        const html = await pageRes.text();
        const excerpt = stripHtml(extractMeta(html)) || "";
        posts.push({ ...it, excerpt });
      } catch {
        posts.push({ ...it, excerpt: "" });
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=600",
      },
      body: JSON.stringify({ posts }),
    };
  } catch (e) {
    return { statusCode: 500, body: "Error: " + (e?.message || e) };
  }
}
