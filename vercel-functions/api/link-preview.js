// GET /api/link-preview?url=https://example.com
// Fetches the page and pulls out title / description / image (og: tags first,
// falls back to normal <title>/<meta name="description">).
// This runs on Vercel (server side) so it avoids browser CORS restrictions.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AUCianLinkPreview/1.0)' },
      redirect: 'follow',
    });
    const html = await response.text();

    const grab = (patterns) => {
      for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match && match[1]) return decodeHtmlEntities(match[1].trim());
      }
      return null;
    };

    const title = grab([
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
      /<title[^>]*>([^<]+)<\/title>/i,
    ]);

    const description = grab([
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    ]);

    let image = grab([
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    ]);
    if (image && !image.startsWith('http')) {
      image = new URL(image, url).href; // resolve relative image URLs
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({ title, description, image });
  } catch (err) {
    console.error('link-preview error:', err);
    return res.status(200).json({ title: null, description: null, image: null });
  }
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
