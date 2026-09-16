// Launch checks on dist/. Run via `npm test` (builds first).
import { readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.mjs';
import { dicts } from '../src/i18n.mjs';
import { esc } from '../src/template.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
let failures = 0, passes = 0;
const check = (ok, msg) => { if (ok) passes++; else { failures++; console.log(`  ✗ ${msg}`); } };

// 1. Translation parity: same keys, same array lengths, no empty strings
function shape(v, p = '') {
  if (Array.isArray(v)) return [`${p}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${p}[${i}]`))];
  if (v && typeof v === 'object') return Object.entries(v).flatMap(([k, x]) => shape(x, p ? `${p}.${k}` : k));
  check(typeof v === 'string' && v.trim().length > 0, `empty translation at ${p}`);
  return [p];
}
const base = shape(dicts.en).sort().join('\n');
for (const l of config.languages) check(shape(dicts[l]).sort().join('\n') === base, `i18n keys for "${l}" differ from "en"`);

// 2. Pages
const expectedAlt = new Set([...config.languages, 'x-default']);
for (const lang of config.languages) {
  const rel = lang === 'en' ? 'index.html' : `${lang}/index.html`;
  const file = path.join(DIST, rel);
  const label = `[${rel}]`;
  if (!existsSync(file)) { check(false, `${label} missing`); continue; }
  const html = await readFile(file, 'utf8');
  const url = `${config.siteUrl}${lang === 'en' ? '/' : `/${lang}/`}`;

  check(new RegExp(`<html lang="${lang}"`).test(html), `${label} html lang`);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  check(title.length >= 30 && title.length <= 70, `${label} title length ${title.length}`);
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  check(desc.length >= 110 && desc.length <= 175, `${label} meta description length ${desc.length}`);
  check((html.match(/<h1[\s>]/g) || []).length === 1, `${label} exactly one h1`);
  check(html.includes(`<link rel="canonical" href="${url}">`), `${label} canonical`);
  check(html.includes(`<meta property="og:url" content="${url}">`), `${label} og:url`);

  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
  check(alts.length === expectedAlt.size && alts.every(([, h]) => expectedAlt.has(h)), `${label} hreflang set`);
  for (const [, , href] of alts) {
    const p = href.replace(config.siteUrl, '');
    check(existsSync(path.join(DIST, p.endsWith('/') ? p + 'index.html' : p)), `${label} hreflang target ${href}`);
  }

  // JSON-LD
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(blocks.length === 1, `${label} one JSON-LD block`);
  try {
    const graph = JSON.parse(blocks[0][1])['@graph'];
    const types = graph.map((n) => n['@type']);
    for (const t of ['LocalBusiness', 'TaxiService', 'WebSite', 'WebPage', 'FAQPage']) check(types.includes(t), `${label} schema has ${t}`);
    const faq = graph.find((n) => n['@type'] === 'FAQPage');
    check(faq.mainEntity.length === dicts[lang].faq.items.length, `${label} FAQ schema matches visible FAQ`);
    check((html.match(/<details/g) || []).length - 1 === dicts[lang].faq.items.length, `${label} visible FAQ count`);
  } catch (e) { check(false, `${label} JSON-LD parse: ${e.message}`); }

  // WhatsApp + phone links
  const wa = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  check(wa.length >= 15, `${label} WhatsApp links (${wa.length})`);
  for (const w of wa) {
    const u = new URL(w);
    check(u.pathname === `/${config.whatsapp}`, `${label} WhatsApp number in ${w}`);
    check((u.searchParams.get('text') || '').length > 10, `${label} WhatsApp prefilled text in ${w}`);
  }
  check(html.includes('data-cta="hero"') && html.includes('data-cta="dock"') && html.includes('data-cta="header"'), `${label} primary WhatsApp CTAs present`);
  check([...html.matchAll(/href="tel:([^"]+)"/g)].every((m) => m[1] === config.phone), `${label} tel links`);

  // Internal links and anchors
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  check(ids.size === (html.match(/\sid="/g) || []).length, `${label} duplicate ids`);
  for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"#]*|#[^"]+)"/g)) {
    if (href.startsWith('#')) { check(ids.has(href.slice(1)), `${label} anchor ${href}`); continue; }
    const p = path.join(DIST, href.endsWith('/') ? href + 'index.html' : href);
    check(existsSync(p), `${label} broken link ${href}`);
  }
  // Images: responsive sources exist, no local filesystem paths, loading priorities, no layout shift
  for (const [, set] of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g)) {
    for (const part of set.split(',')) {
      const u = part.trim().split(/\s+/)[0];
      check(existsSync(path.join(DIST, u)), `${label} srcset target ${u}`);
    }
  }
  check(!/\b[A-Za-z]:\\|file:\/\/|Winton Taxi|AI GEN/.test(html), `${label} no local filesystem paths`);
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  check(imgs.every((i) => /\swidth="\d+"/.test(i) && /\sheight="\d+"/.test(i)), `${label} images have intrinsic width/height`);
  check(/<img[^>]+fetchpriority="high"/.test(html) && /<link rel="preload" as="image"/.test(html), `${label} hero image prioritized`);
  check(imgs.filter((i) => !/class="(logo|avatar-img)"|fetchpriority/.test(i)).every((i) => /loading="lazy"/.test(i)), `${label} below-the-fold images lazy-load`);
  // Airport cards: photo + live, translated code/name/area/action inside one real WhatsApp link
  const cards = [...html.matchAll(/<a class="apt apt-photo"([^>]*)>([\s\S]*?)<\/a>/g)];
  check(cards.length === config.airports.length, `${label} ${cards.length} airport photo cards`);
  const tr = dicts[lang].airports;
  config.airports.forEach((a, i) => {
    const [, attrs = '', body = ''] = cards[i] || [];
    check(/href="https:\/\/wa\.me\/\d+\?text=[^"]+"/.test(attrs) && attrs.includes(`data-cta="airport-${a.code}"`), `${label} ${a.code} card is a real WhatsApp link`);
    check(body.includes(`/images/${a.card}`) && body.includes('alt=""'), `${label} ${a.code} card uses photo ${a.card}`);
    check([`>${a.code}<`, esc(tr.items[a.code].name), esc(tr.items[a.code].area), esc(tr.action)].every((s) => body.includes(s)), `${label} ${a.code} card shows live localized code/name/area/action`);
  });
  check(/class="driver"[\s\S]*?data-cta="driver-card"/.test(html), `${label} hero driver strip with live WhatsApp action`);
  check(/class="final-scene has-photo"[\s\S]*?<h2>[\s\S]*?data-cta="final"[\s\S]*?href="tel:/.test(html), `${label} final CTA keeps live heading, WhatsApp and phone buttons over the photo`);

  for (const [, id] of html.matchAll(/<use href="#([^"]+)"/g)) check(html.includes(`<symbol id="${id}"`), `${label} icon ${id}`);
  check([...html.matchAll(/<img\b[^>]*>/g)].every((m) => /\salt="/.test(m[0])), `${label} images have alt`);
  check(!/\{(airport|route)\}/.test(html), `${label} unreplaced template placeholder`);
  check(!html.includes('class="ph-note"'), `${label} draft photo labels leaked into production build`);
  const kb = statSync(file).size / 1024;
  check(kb < 90, `${label} page weight ${kb.toFixed(1)} KB`);
}

// 3. Crawl files
const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
check((sitemap.match(/<loc>/g) || []).length === config.languages.length, 'sitemap URL count');
check(!sitemap.includes('404'), 'sitemap excludes 404');
const robots = await readFile(path.join(DIST, 'robots.txt'), 'utf8');
check(robots.includes(`Sitemap: ${config.siteUrl}/sitemap.xml`), 'robots.txt sitemap line');
check(existsSync(path.join(DIST, 'llms.txt')), 'llms.txt exists');
const nf = await readFile(path.join(DIST, '404.html'), 'utf8');
check(nf.includes('noindex') && !nf.includes('rel="canonical"'), '404 is noindex without canonical');
for (const f of ['images/logo.png', 'favicon-32.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'og-default.png', 'site.webmanifest']) {
  check(existsSync(path.join(DIST, f)), `asset ${f}`);
}

console.log(`\n${passes} checks passed, ${failures} failed.`);
process.exit(failures ? 1 : 0);
