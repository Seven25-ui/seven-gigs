// Builds one static HTML page per published post, plus slugs.json, sitemap.xml and robots.txt.
// Runs in GitHub Actions (see .github/workflows/build-posts.yml). No packages needed.
//
// The Supabase URL and anon key are read from app.js, so there is only one place to edit them.
// The anon key is public by design; Row Level Security only lets it read published posts.

import fs from "node:fs";
import path from "node:path";

// ====== CHANGE THIS when you connect a custom domain (no trailing slash) ======
const SITE_URL = "https://seven25-ui.github.io/seven-gigs";
// ===============================================================================
const SITE_NAME = "Seven Gigs";
const AUTHOR = "Gene";
const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "posts");

// ---------- read Supabase settings from app.js ----------
const appJs = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const SUPABASE_URL = (appJs.match(/SUPABASE_URL\s*=\s*"([^"]+)"/) || [])[1];
const SUPABASE_KEY = (appJs.match(/SUPABASE_ANON_KEY\s*=\s*"([^"]+)"/) || [])[1];
if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes("PASTE")) {
  console.error("Could not read the Supabase URL and key from app.js");
  process.exit(1);
}

// ---------- helpers ----------
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });

function slugify(title) {
  const s = String(title || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
  return s || "post";
}

// Same rules as renderContent() in app.js
function renderContent(text) {
  return String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("```")
    .map((part, i) => {
      if (i % 2 === 1) {
        const code = part
          .replace(/^[ \t]*(?:python|powershell|bash|shell|js|javascript|html|css|json|text|sql)?[ \t]*\r?\n/i, "")
          .replace(/\s+$/, "");
        return "<pre><code>" + esc(code) + "</code></pre>";
      }
      return part
        .split(/\n{2,}/)
        .map((block) => {
          const b = block.trim();
          if (!b) return "";
          if (b.startsWith("## ")) return "<h2>" + esc(b.slice(3)) + "</h2>";
          return "<p>" + esc(b).replace(/\n/g, "<br>") + "</p>";
        })
        .join("");
    })
    .join("");
}

async function loadPosts() {
  if (process.env.MOCK_POSTS) return JSON.parse(fs.readFileSync(process.env.MOCK_POSTS, "utf8"));
  const url =
    `${SUPABASE_URL}/rest/v1/gigs_posts` +
    `?select=id,title,category,excerpt,content,created_at&published=eq.true&order=created_at.desc`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
  if (!res.ok) throw new Error(`Supabase request failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// ---------- page template ----------
function pageHtml(post, slug, related) {
  const url = `${SITE_URL}/posts/${slug}.html`;
  const enc = encodeURIComponent;
  const words = String(post.content || "").trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  const desc = post.excerpt || `${post.title} - tips and tutorials for freelancers from ${SITE_NAME}.`;
  const iso = new Date(post.created_at).toISOString();

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: desc,
    datePublished: iso,
    dateModified: iso,
    image: `${SITE_URL}/og-image.png`,
    mainEntityOfPage: url,
    author: { "@type": "Person", name: AUTHOR },
    publisher: { "@type": "Organization", name: SITE_NAME },
  }).replace(/</g, "\\u003c");

  const relatedHtml = related.length
    ? `<section class="related"><h2>Keep reading</h2>${related
        .map(
          (r) => `
      <a class="rel" href="${esc(r.slug)}.html">
        <span class="tag">${esc(r.category)}</span>
        <span>${esc(r.title)}</span>
      </a>`
        )
        .join("")}</section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(post.title)} | ${SITE_NAME}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:site_name" content="${SITE_NAME}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(post.title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE_URL}/og-image.png">
  <meta property="article:published_time" content="${iso}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
  <link rel="apple-touch-icon" href="../apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Source+Serif+4:wght@400;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../style.css">
  <script type="application/ld+json">${jsonLd}</script>
</head>
<body>
  <header class="top">
    <div class="wrap">
      <a class="logo" href="../index.html"><img class="logo-mark" src="../logo-mark.svg" alt="" width="36" height="36"><span>Seven <b>Gigs</b></span></a>
      <button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="mainNav"><span></span><span></span><span></span></button>
      <nav aria-label="Main" id="mainNav">
        <a href="../index.html">Home</a>
        <a href="../about.html">About</a>
        <a href="../contact.html">Contact</a>
      </nav>
    </div>
  </header>

  <main class="wrap post">
    <a class="back" href="../index.html">&larr; Back to all posts</a><br>
    <span class="tag">${esc(post.category)}</span>
    <h1>${esc(post.title)}</h1>
    <div class="meta">${fmtDate(post.created_at)} &middot; ${mins} min read</div>
    <article class="body">${renderContent(post.content)}</article>
    <div class="share">
      <strong>Share this post</strong>
      <a href="https://www.facebook.com/sharer/sharer.php?u=${enc(url)}" target="_blank" rel="noopener">Facebook</a>
      <a href="https://twitter.com/intent/tweet?url=${enc(url)}&amp;text=${enc(post.title)}" target="_blank" rel="noopener">X</a>
      <a href="https://t.me/share/url?url=${enc(url)}&amp;text=${enc(post.title)}" target="_blank" rel="noopener">Telegram</a>
      <a href="https://wa.me/?text=${enc(post.title + " " + url)}" target="_blank" rel="noopener">WhatsApp</a>
      <button type="button" id="copyLink">Copy link</button>
    </div>
    ${relatedHtml}
  </main>

  <footer class="foot">
    <div class="wrap foot-grid">
      <div>
        <a class="logo" href="../index.html"><img class="logo-mark" src="../logo-mark.svg" alt="" width="36" height="36"><span>Seven <b>Gigs</b></span></a>
        <p>Tips, AI tools, and tutorials for freelancers.</p>
      </div>
      <nav aria-label="Footer">
        <a href="../index.html">Home</a>
        <a href="../about.html">About</a>
        <a href="../contact.html">Contact</a>
        <a href="../privacy.html">Privacy Policy</a>
        <a href="../terms.html">Terms &amp; Disclaimer</a>
      </nav>
    </div>
    <div class="wrap copy">&copy; <span id="yr">2026</span> ${SITE_NAME}. All rights reserved.</div>
  </footer>

  <script>
    document.getElementById("yr").textContent = new Date().getFullYear();
    document.getElementById("copyLink").addEventListener("click", async function (e) {
      var b = e.currentTarget;
      try { await navigator.clipboard.writeText(location.href.split("#")[0]); b.textContent = "Copied!"; }
      catch (err) { b.textContent = "Press Ctrl+C to copy the address bar"; }
      setTimeout(function () { b.textContent = "Copy link"; }, 2000);
    });
  </script>
  <script src="../menu.js"></script>
</body>
</html>
`;
}

// ---------- main ----------
const posts = await loadPosts();
fs.mkdirSync(POSTS_DIR, { recursive: true });

const existing = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".html"));
if (!posts.length && existing.length) {
  console.error("Supabase returned 0 posts but pages already exist. Stopping so nothing is deleted by mistake.");
  process.exit(1);
}

// unique slugs (newest first keeps the cleanest slug for the newest post)
const used = new Set();
const items = posts.map((p) => {
  let slug = slugify(p.title);
  if (used.has(slug)) slug = `${slug}-${String(p.id).slice(0, 6)}`;
  used.add(slug);
  return { ...p, slug };
});

const slugMap = {};
for (const p of items) {
  slugMap[p.id] = p.slug;
  const sameCat = items.filter((x) => x.id !== p.id && x.category === p.category);
  const others = items.filter((x) => x.id !== p.id && x.category !== p.category);
  const related = [...sameCat, ...others].slice(0, 3);
  fs.writeFileSync(path.join(POSTS_DIR, `${p.slug}.html`), pageHtml(p, p.slug, related));
}

// remove pages of posts that no longer exist (deleted or unpublished)
for (const f of existing) {
  if (!used.has(f.replace(/\.html$/, ""))) fs.unlinkSync(path.join(POSTS_DIR, f));
}

fs.writeFileSync(path.join(POSTS_DIR, "slugs.json"), JSON.stringify(slugMap, null, 2) + "\n");

// sitemap
const staticPages = ["", "about.html", "contact.html", "privacy.html", "terms.html"];
const urls = [
  ...staticPages.map((p) => `  <url><loc>${SITE_URL}/${p}</loc></url>`),
  ...items.map(
    (p) =>
      `  <url><loc>${SITE_URL}/posts/${p.slug}.html</loc><lastmod>${new Date(p.created_at)
        .toISOString()
        .slice(0, 10)}</lastmod></url>`
  ),
];
fs.writeFileSync(
  path.join(ROOT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

// robots.txt (only used by search engines when the site is on its own domain)
fs.writeFileSync(path.join(ROOT, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /admin.html\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

console.log(`Built ${items.length} post pages, sitemap.xml, robots.txt`);
