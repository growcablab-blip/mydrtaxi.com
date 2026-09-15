# My DR Taxi — mydrtaxi.com (V1)

A fast, mobile-first lead-generation site for Winton's private taxi service.
It isn't a booking platform: every call to action opens WhatsApp with a message already filled in.

- **4 languages:** English at `/`, Spanish at `/es/`, French at `/fr/`, Russian at `/ru/`. Each has its own URL, hreflang and schema. Visitors are never auto-redirected; a small banner offers their browser language.
- **No dependencies:** one template and one translation file build static HTML with CSS and JS inlined, about 60 KB per page and zero extra requests.
- **SEO and AI discoverability:** LocalBusiness, TaxiService, FAQPage, WebSite and WebPage JSON-LD, a sitemap with hreflang alternates, robots.txt, llms.txt, Open Graph and a social image.

## Commands (Node 18+)

```bash
npm run dev       # build + local server on http://localhost:4173 with auto-rebuild; photo placeholders show file names
npm run build     # production build -> dist/
npm test          # build + ~1,800 launch checks (i18n parity, SEO tags, schema, links, WhatsApp URLs)
npm run preview   # serve the production build
npm run icons     # regenerate favicons, app icons and og-default.png (Windows)
```

## Where things live

| Change…                                   | Edit                         |
|-------------------------------------------|------------------------------|
| Phone, WhatsApp, Maps link, routes, airports | `src/config.mjs`           |
| Any text, in any language                 | `src/i18n.mjs`               |
| Layout / sections                         | `src/template.mjs`           |
| Design                                    | `src/styles.css`             |
| Structured data                           | `src/schema.mjs`             |
| Photos                                    | `public/images/` (see README there) |

## Production hosting (Railway)

- **Project / service:** `mydrtaxi.com` / `mydrtaxi` (GrowCabLab workspace, `production` environment). Auto-deploys on every push to `main`.
- **`railway.json`:**
  - Railpack builder.
  - Build command is `npm test`: it builds `dist/` and runs every launch check, so a failing check blocks the deploy.
  - Start command is `npm start`, which runs `node scripts/serve.mjs --no-build`.
  - Health check path is `/`.
- **`scripts/serve.mjs` in production** (enabled automatically on Railway via `RAILWAY_ENVIRONMENT`):
  - `www.mydrtaxi.com` → `https://mydrtaxi.com` (301, keeps path and query).
  - HTTP → HTTPS (301).
  - `/en.html`, `/es.html` and other legacy URLs → clean URLs.
  - Security headers, plus HSTS on the canonical host.
  - HTML revalidates on every request; images are cached for 30 days.
  - Gzip compression.
  - `X-Robots-Tag: noindex` on any non-canonical host, such as `*.up.railway.app`.
  - Dotfiles are never served.
- **Railway test URL:** https://mydrtaxi-production.up.railway.app
- **DNS:** Cloudflare, DNS-only (grey cloud), because GoDaddy can't CNAME the bare domain.
  - `mydrtaxi.com` and `www.mydrtaxi.com` are CNAMEs to the targets Railway shows under Service → Settings → Networking.
  - Railway's `_railway-verify` TXT records are also required.
  - Railway issues the SSL certificates.
- The `_headers`, `_redirects` and `.htaccess` files in `dist/` are only used if the site is ever moved to Netlify, Cloudflare Pages or Apache.

## Before launch

1. **Photos:** add `winton-minivan.jpg`, `winton-portrait.jpg`, `minivan-exterior.jpg` and `minivan-interior.jpg` to `public/images/`, then run `npm run build`. Placeholders swap automatically.
2. **Google Reviews widget:** create a widget (Elfsight, Trustindex, EmbedSocial…) connected to the Google Business Profile. Paste its embed code into `reviews.embedHtml` in `src/config.mjs`. It lazy-loads near the section.
3. **Deploy `dist/`** to the web root.
   - Netlify / Cloudflare Pages use `_headers` and `_redirects`.
   - Apache / cPanel uses `.htaccess`, which also forces HTTPS and non-www.
4. **Google Search Console:** verify mydrtaxi.com and submit `https://mydrtaxi.com/sitemap.xml`.
5. **Google Business Profile:**
   - Set the website to `https://mydrtaxi.com/`.
   - Keep the name ("My DR Taxi"), phone (+1 829-929-5355), hours (24/7) and service areas identical to the site.
   - Ask happy passengers for reviews.
6. **Test on a real phone:** check the WhatsApp buttons, the quick-quote form and the call button.
7. **Verify facts:** confirm the approximate drive times in `config.routes` with Winton, and that he's happy with the FAQ answers (delays, Wi‑Fi, 6 passengers).

## Deliberately not included

- No prices.
- No aggregateRating markup, since self-served ratings are ineligible and must never be invented.
- No booking engine, cookies or third-party scripts until the reviews widget is added.
