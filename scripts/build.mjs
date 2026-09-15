// Zero-dependency static build: src/ + public/ -> dist/
// Usage: node scripts/build.mjs [--draft]
import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';
import { dicts } from '../src/i18n.mjs';
import { renderPage, render404, pagePath } from '../src/template.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'src');
const PUB = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
const draft = process.argv.includes('--draft');

const minifyCss = (css) => css
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();

const minifyJs = (js) => js
  .split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'))
  .join('\n');

// Resolve an image spec ({ file, width, height, variants }) to { src, srcset, width, height },
// or null when the file is missing (the template then renders a placeholder).
function resolveImage(spec) {
  if (!spec || !existsSync(path.join(PUB, 'images', spec.file))) return null;
  const src = `/images/${spec.file}`;
  const variants = (spec.variants || [])
    .map((w) => ({ w, url: src.replace(/(\.\w+)$/, `-${w}$1`) }))
    .filter(({ url }) => existsSync(path.join(PUB, url)));
  const srcset = variants.length
    ? [...variants.map(({ w, url }) => `${url} ${w}w`), `${src} ${spec.width}w`].join(', ')
    : '';
  return { src, srcset, width: spec.width, height: spec.height };
}

async function write(rel, content) {
  const file = path.join(DIST, rel);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
  return Buffer.byteLength(content);
}

const fmtDur = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? (m % 60) + ' min' : ''}` : `${m} min`).trim();

function llmsTxt(t, c) {
  const S = c.siteUrl;
  return `# ${c.name}

> ${t.footer.tagline} Private driver: ${c.driver}. Available 24/7. Book by WhatsApp: ${c.phoneDisplay}.

${c.name} (${S}), formerly known as ${c.formerName}, is a private taxi and airport transfer service on the North Coast of the Dominican Republic, run by driver ${c.driver} and a small trusted team. Travelers contact the driver directly on WhatsApp for availability and a price agreed before the ride. It is not a booking platform or aggregator.

## Key facts
- Service: private taxi, airport transfers, airport meet-and-greet with a name sign, local rides, long-distance private transfers nationwide
- Base area: Cabarete, Sosúa and Puerto Plata (Puerto Plata province, Dominican Republic)
- Airports: ${c.airports.map((a) => `${a.name} (${a.code}, ${a.city})`).join('; ')}
- Also serves: ${c.areaServed.join(', ')} and anywhere in the Dominican Republic
- Vehicle: clean Toyota minivan, up to 6 passengers with luggage, strong A/C, onboard Wi-Fi
- Hours: 24 hours a day, 7 days a week
- Contact / WhatsApp: ${c.phoneDisplay} — https://wa.me/${c.whatsapp}
- Google Business listing: ${c.googleMapsUrl}
- Prices: quoted per trip on WhatsApp (depends on route, time and passengers)
- Website languages: English, Spanish, French, Russian

## Popular routes (approximate drive times)
${c.routes.map(([f, to, m]) => `- ${t.places[f]} to ${t.places[to]}: about ${fmtDur(m)}`).join('\n')}

## FAQ
${t.faq.items.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

## Pages
${c.languages.map((l) => `- [${dicts[l].langName}](${S}${pagePath(l)}): ${dicts[l].meta.description}`).join('\n')}
`;
}

export async function build() {
  const started = Date.now();
  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // Static assets (skip authoring notes like images/README.md)
  await cp(PUB, DIST, { recursive: true, filter: (src) => !/\.md$/i.test(src) });

  const css = minifyCss(await readFile(path.join(SRC, 'styles.css'), 'utf8'));
  const js = minifyJs(await readFile(path.join(SRC, 'app.js'), 'utf8'));
  const photos = Object.fromEntries(Object.entries(config.photos).map(([k, spec]) => [k, resolveImage(spec)]));
  const airportCards = Object.fromEntries(config.airports.map((a) =>
    [a.code, a.card ? resolveImage({ file: a.card, ...config.airportCard }) : null]));

  const ogImage = config.siteUrl + (existsSync(path.join(PUB, 'images', 'og.jpg')) ? '/images/og.jpg' : '/og-default.png');
  const year = new Date().getFullYear();
  const ctx = { dicts, config, photos, airportCards, draft, css, js, ogImage, year };

  const report = [];
  for (const lang of config.languages) {
    const rel = lang === 'en' ? 'index.html' : `${lang}/index.html`;
    const bytes = await write(rel, renderPage({ ...ctx, lang }));
    report.push(`  ${rel.padEnd(16)} ${(bytes / 1024).toFixed(1)} KB`);
  }
  await write('404.html', render404(ctx));

  const today = new Date().toISOString().slice(0, 10);
  const alternates = config.languages
    .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${config.siteUrl}${pagePath(l)}"/>`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${config.siteUrl}/"/>`).join('\n');
  await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${config.languages.map((l) => `  <url>
    <loc>${config.siteUrl}${pagePath(l)}</loc>
    <lastmod>${today}</lastmod>
${alternates}
  </url>`).join('\n')}
</urlset>
`);

  await write('robots.txt', `# Search engines and AI assistants are welcome.
User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${config.siteUrl}/sitemap.xml
`);

  await write('llms.txt', llmsTxt(dicts.en, config));

  await write('site.webmanifest', JSON.stringify({
    name: config.name, short_name: config.name, start_url: '/', display: 'browser',
    background_color: '#08121d', theme_color: '#08121d',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2));

  // Hosting configs: Netlify / Cloudflare Pages (_headers, _redirects) and Apache (.htaccess)
  await write('_headers', `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: SAMEORIGIN
/images/*
  Cache-Control: public, max-age=2592000
/*.png
  Cache-Control: public, max-age=2592000
`);
  await write('_redirects', `/en.html  /     301
/es.html  /es/  301
/fr.html  /fr/  301
/ru.html  /ru/  301
/en       /     301
/en/      /     301
`);
  await write('.htaccess', `ErrorDocument 404 /404.html
DirectoryIndex index.html
Options -Indexes
AddDefaultCharset utf-8
AddType application/manifest+json .webmanifest
AddType text/plain .txt

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off [OR]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteRule ^ https://mydrtaxi.com%{REQUEST_URI} [R=301,L]
  RewriteRule ^en(\\.html|/)?$ / [R=301,L]
  RewriteRule ^(es|fr|ru)\\.html$ /$1/ [R=301,L]
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml application/xml image/svg+xml application/manifest+json
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/webp "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
</IfModule>

<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set X-Frame-Options "SAMEORIGIN"
</IfModule>
`);

  const missing = [
    ...Object.entries(photos).filter(([, v]) => !v).map(([k]) => `images/${config.photos[k].file}`),
    ...config.airports.filter((a) => a.card && !airportCards[a.code]).map((a) => `images/${a.card}`),
  ];
  const icons = ['og-default.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'favicon-32.png']
    .filter((f) => !existsSync(path.join(PUB, f)));

  console.log(`\nMy DR Taxi built${draft ? ' (draft)' : ''} in ${Date.now() - started} ms -> dist/`);
  console.log(report.join('\n'));
  if (missing.length) console.log(`  Photo placeholders in use: ${missing.join(', ')}`);
  if (icons.length) console.log(`  Missing generated icons (run npm run icons): ${icons.join(', ')}`);
  if (!config.reviews.embedHtml.trim()) console.log('  Google Reviews widget not configured yet (src/config.mjs -> reviews.embedHtml)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build().catch((err) => { console.error(err); process.exit(1); });
}
