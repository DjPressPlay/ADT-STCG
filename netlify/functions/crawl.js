// netlify/functions/crawl.js
// Jessica Crawl — clean metadata with robust fallbacks
// Accepts: { links: [...], session? } or { url:"..." }
// Returns: { session, results:[{ url,title,description,image,siteName,author,profile,keywords,rawHTMLLength,enrich?,frameType? }] }

const PLACEHOLDER_IMG = "https://miro.medium.com/v2/resize:fit:786/format:webp/1*l0k-78eTSOaUPijHdWIhkQ.png";

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") return resText(204, "");
    if (event.httpMethod !== "POST") return resText(405, "Method Not Allowed");

    const body = safeJSON(event.body);
    if (!body) return resJSON(400, { error: "Invalid JSON body" });

    let links = [];
    if (Array.isArray(body.links) && body.links.length) links = body.links;
    else if (typeof body.url === "string" && body.url.trim()) links = [body.url];

    const session = body.session || "";
    if (!links.length) return resJSON(400, { error: "No links provided" });

    const results = [];

    for (let rawUrl of links) {
      let safeUrl = String(rawUrl || "").trim();
      if (!/^https?:\/\//i.test(safeUrl)) safeUrl = "https://" + safeUrl;

      try {
        const o = await tryOEmbed(safeUrl);
        if (o) { results.push(o); continue; }

        const r = await fetch(safeUrl, {
          redirect: "follow",
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Jessica-SPZ/2.0; +https://example.org)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9"
          }
        });

        if (!r.ok) throw new Error(`Fetch ${r.status}`);
        const html = await r.text();
        const host = normalizeHost(safeUrl);

        const title = extractTitle(html) || host;
        const description = extractDescription(html) || "No description available";
        const author = extractAuthor(html);
        const profile = extractProfile(html);
        const keywords = extractKeywords(html);
        const video = bestVideo(html, safeUrl); // ✅ video first
        const image = !video ? absolutize(safeUrl, bestImage(html) || "") : ""; // fallback only if no video
        const siteName = extractSiteName(html) || host;

        // ✅ YouTube-specific metadata
        let ytExtra = {};
        if (/youtube\.com|youtu\.be/i.test(safeUrl)) {
          ytExtra = {
            videoUrl: findMetaContent(html, ["og:video:url"]),
            videoType: findMetaContent(html, ["og:video:type"]),
            videoWidth: findMetaContent(html, ["og:video:width"]),
            videoHeight: findMetaContent(html, ["og:video:height"]),
            duration: findMetaContent(html, ["og:video:duration"]),
            published: findMetaContent(html, ["article:published_time"]),
            channel: findMetaContent(html, ["og:video:tag"])
          };
        }

        const card = {
          url: safeUrl,
          title,
          description,
          image: image || siteFavicon(safeUrl),
          siteName,
          author,
          profile,
          keywords,
          rawHTMLLength: html.length,
          enrich: {
            video,
            canonical: findLinkHref(html, "canonical"),
            icon: extractIcon(html, safeUrl),
            ...ytExtra
          }
        };

        const isVoid = !card.title || !card.description || (!card.image && !card.enrich.video);
        results.push(isVoid ? { ...card, frameType: "void" } : card);
      } catch (err) {
        results.push({ url: safeUrl, error: String(err?.message || err) });
      }
    }

    return resJSON(200, { session, results });
  } catch (err) {
    return resJSON(500, { error: String(err?.message || err) });
  }
};

/* ---------------- helpers ---------------- */
function resText(code, text) {
  return {
    statusCode: code,
    headers: corsHeaders(),
    body: text
  };
}
function resJSON(code, obj) {
  return {
    statusCode: code,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
    body: JSON.stringify(obj)
  };
}
function corsHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}
function safeJSON(s) { try { return JSON.parse(s) } catch { return null } }
function normalizeHost(url) { try { return new URL(url).hostname.replace(/^www\./, "") } catch { return "" } }

/* ----- field extractors ----- */
function findMetaContent(html, names=[]) {
  for (const n of names) {
    const re = new RegExp(`<meta[^>]+(?:name|property)=[\"']${escapeRe(n)}[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>`, "i");
    const m = re.exec(html);
    if (m) return decode(m[1]);
  }
  return "";
}
function extractTitle(html) {
  return (
    findMetaContent(html, ["og:title", "twitter:title"]) ||
    (html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "").trim()
  );
}
function extractDescription(html) {
  return (
    findMetaContent(html, ["description","og:description","twitter:description"]) ||
    firstMeaningfulText(html)
  );
}
function extractSiteName(html) {
  return (
    findMetaContent(html, ["og:site_name"]) || ""
  );
}
function extractAuthor(html) {
  return findMetaContent(html, ["author"]) || "";
}
function extractProfile(html) {
  const v = findMetaContent(html, ["og:profile:username","twitter:creator","twitter:site"]);
  return v.replace(/^@/, "");
}
function extractKeywords(html) {
  const v = findMetaContent(html, ["keywords"]);
  return v ? v.split(/\s*,\s*/).slice(0, 12) : [];
}
function bestImage(html) {
  const og = findMetaContent(html, ["og:image","twitter:image"]);
  if (og) return og;
  // last resort: apple-touch-icon / icon
  return extractIcon(html) || "";
}
function bestVideo(html, url) {
  const ogv = findMetaContent(html, ["og:video"]);
  if (ogv) return absolutize(url, ogv);
  return "";
}
function extractIcon(html, baseUrl="") {
  const rels = ["apple-touch-icon","icon","shortcut icon"];
  for (const rel of rels) {
    const href = findLinkHref(html, rel);
    if (href) return absolutize(baseUrl, href);
  }
  return "";
}
function siteFavicon(url) {
  try {
    const u = new URL(url);
    return `https://www.google.com/s2/favicons?sz=256&domain=${u.hostname}`;
  } catch { return PLACEHOLDER_IMG; }
}
function findLinkHref(html, relValue) {
  const re = /<link\b[^>]*>/gi;
  let m; 
  while ((m = re.exec(html))) {
    const tag = m[0];
    const rel = (getAttrCI(tag, "rel") || "").toLowerCase();
    if (rel.split(/\s+/).includes(relValue.toLowerCase())) {
      const href = getAttrCI(tag, "href");
      if (href) return href.trim();
    }
  }
  return "";
}
function getAttrCI(tag, attr) {
  const m = new RegExp(`${attr}\\s*=\\s*["']([^"']+)["']`, "i").exec(tag);
  return m ? m[1] : "";
}
function firstMeaningfulText(html) {
  const re = /<(p|h1|h2|h3|article|section)[^>]*>(.*?)<\/\\1>/gis;
  let m;
  while ((m = re.exec(html))) {
    const t = stripTags(m[2]).replace(/\s+/g, " ").trim();
    if (t && !looksLikeBanner(t)) return t;
  }
  return "";
}
function stripTags(s="") { return s.replace(/<[^>]+>/g, "") }
function looksLikeBanner(t="") {
  return /cookie|consent|subscribe|newsletter|sign up|advert|gdpr|tracking/i.test(t);
}
function escapeRe(s="") { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") }
function decode(s="") { try { return decodeURIComponent(s) } catch { return s } }
function absolutize(base, src) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("//")) return "https:" + src;
  try {
    const b = new URL(base);
    if (src.startsWith("/")) return b.origin + src;
    return new URL(src, b.origin + b.pathname).toString();
  } catch { return src }
}

/* ----- oEmbed (fast paths) ----- */
async function tryOEmbed(url) {
  const endpoints = [
    { match: /twitter\.com|x\.com/i, api: "https://publish.twitter.com/oembed?url=" },
    { match: /reddit\.com/i, api: "https://www.reddit.com/oembed?url=" },
    { match: /youtube\.com|youtu\.be/i, api: "https://www.youtube.com/oembed?url=" },
    { match: /tiktok\.com/i, api: "https://www.tiktok.com/oembed?url=" }
  ];
  for (const ep of endpoints) {
    if (ep.match.test(url)) {
      try {
        const r = await fetch(ep.api + encodeURIComponent(url));
        if (!r.ok) throw new Error("oEmbed fail");
        const data = await r.json();
        return {
          url,
          title: data.title || normalizeHost(url),
          description: data.author_name ? `By ${data.author_name}` : "No description available",
          image: data.thumbnail_url || PLACEHOLDER_IMG,
          siteName: data.provider_name || normalizeHost(url),
          author: data.author_name || "",
          profile: "",
          keywords: [],
          rawHTMLLength: 0,
          enrich: {}
        };
      } catch { /* ignore and fall through */ }
    }
  }
  return null;
}
