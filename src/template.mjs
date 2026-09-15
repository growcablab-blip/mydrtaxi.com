import { sprite, ic, art } from './icons.mjs';
import { buildSchema } from './schema.mjs';

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const pagePath = (lang) => (lang === 'en' ? '/' : `/${lang}/`);

const fmtDuration = (mins, u) => {
  const h = Math.floor(mins / 60), m = mins % 60;
  return '≈ ' + [h && `${h} ${u.h}`, m && `${m} ${u.min}`].filter(Boolean).join(' ');
};

function head({ lang, t, config: c, url, ogImage, css, extraHead = '' }) {
  const alts = c.languages.map((l) =>
    `<link rel="alternate" hreflang="${l}" href="${c.siteUrl}${pagePath(l)}">`).join('');
  const ogAlts = c.languages.filter((l) => l !== lang)
    .map((l) => `<meta property="og:locale:alternate" content="${c.ogLocale[l]}">`).join('');
  return `<!doctype html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(t.meta.title)}</title>
<meta name="description" content="${esc(t.meta.description)}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<link rel="canonical" href="${url}">
${alts}<link rel="alternate" hreflang="x-default" href="${c.siteUrl}/">
<meta name="theme-color" content="#08121d">
<meta name="geo.region" content="DO-18">
<meta name="geo.placename" content="Cabarete, Sosúa, Puerto Plata">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(c.name)}">
<meta property="og:title" content="${esc(t.meta.title)}">
<meta property="og:description" content="${esc(t.meta.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:alt" content="${esc(t.alt.hero)}">
<meta property="og:locale" content="${c.ogLocale[lang]}">${ogAlts}
<meta name="twitter:card" content="summary_large_image">
${extraHead}<style>${css}</style>`;
}

// `sizes` hints per slot (layout widths: .wrap max 1180px with 20px padding).
const SIZES = {
  hero: '(min-width: 1180px) 510px, (min-width: 960px) 44vw, calc(100vw - 40px)',
  portrait: '(min-width: 1180px) 520px, (min-width: 960px) 44vw, calc(100vw - 40px)',
  vehicle: '(min-width: 1180px) 570px, (min-width: 960px) 48vw, calc(100vw - 40px)',
  cta: '(min-width: 1180px) 1140px, calc(100vw - 40px)',
};

const srcsetAttrs = (img, sizes) => (img.srcset ? ` srcset="${img.srcset}" sizes="${sizes}"` : '');

function photo(img, alt, { cls = '', eager = false, sizes = '100vw', kind = 'van', draft = false, file = '' }) {
  if (img) {
    const loading = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
    return `<div class="photo ${cls}"><img src="${img.src}"${srcsetAttrs(img, sizes)} width="${img.width}" height="${img.height}" alt="${esc(alt)}" ${loading} decoding="async"></div>`;
  }
  const note = draft ? `<span class="ph-note">images/${file}</span>` : '';
  return `<div class="photo ${cls}" aria-hidden="true"><div class="ph ph-${kind}">${art[kind]}</div>${note}</div>`;
}

export function renderPage(ctx) {
  const { lang, dicts, config: c, photos, airportCards = {}, draft, css, js, ogImage, year } = ctx;
  const t = dicts[lang];
  const url = c.siteUrl + pagePath(lang);
  const wa = (text) => `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`;
  const waAttrs = (text, cta) => `href="${esc(wa(text))}" target="_blank" rel="noopener" data-cta="${cta}"`;
  const tel = `href="tel:${c.phone}"`;
  const schema = JSON.stringify(buildSchema({ lang, t, config: c, url, ogImage })).replace(/</g, '\\u003c');

  const langLinks = c.languages.map((l) =>
    `<li><a href="${pagePath(l)}" hreflang="${l}" lang="${l}" data-setlang="${l}"${l === lang ? ' aria-current="page"' : ''}>${esc(dicts[l].langName)}<span>${l.toUpperCase()}</span></a></li>`).join('');

  const hints = c.languages.filter((l) => l !== lang).map((l) =>
    `<a href="${pagePath(l)}" data-hint="${l}" data-setlang="${l}" lang="${l}" hidden>${esc(dicts[l].langHint)} ${ic('arrow')}</a>`).join('');

  const badgeIcons = ['clock', 'sign', 'wifi', 'users'];
  const serviceIcons = ['sign', 'plane', 'pin', 'route'];
  const specIcons = ['users', 'wifi', 'wind', 'bag'];

  const heroPreload = photos.hero
    ? `<link rel="preload" as="image" href="${photos.hero.src}"${photos.hero.srcset ? ` imagesrcset="${photos.hero.srcset}" imagesizes="${SIZES.hero}"` : ''} fetchpriority="high">\n`
    : '';

  const msg = { intro: t.quote.msg.intro, outro: t.quote.msg.outro, fields: t.quote.msg.fields };
  const placeOptions = Object.values(t.places).map((p) => `<option value="${esc(p)}">`).join('');

  const reviewsEmbed = c.reviews.embedHtml.trim();

  return `${head({ lang, t, config: c, url, ogImage, css, extraHead: heroPreload })}
<script type="application/ld+json">${schema}</script>
</head>
<body>
${sprite}
<a class="skip" href="#main">${esc(t.a11y.skip)}</a>
<div class="langhint" id="langhint" hidden><div class="wrap">${hints}<button type="button" aria-label="${esc(t.a11y.close)}">×</button></div></div>

<header class="hdr">
  <div class="wrap">
    <a class="brand" href="${pagePath(lang)}" aria-label="${esc(c.name)}"><img class="logo" src="/images/logo.png" alt="My DR Taxi" width="427" height="100"></a>
    <nav class="nav" aria-label="${esc(t.a11y.nav)}">
      <a href="#services">${esc(t.nav.services)}</a>
      <a href="#airports">${esc(t.nav.airports)}</a>
      <a href="#routes">${esc(t.nav.routes)}</a>
      <a href="#reviews">${esc(t.nav.reviews)}</a>
      <a href="#faq">${esc(t.nav.faq)}</a>
    </nav>
    <details class="lang">
      <summary aria-label="${esc(t.a11y.lang)}">${ic('globe')}<span>${lang.toUpperCase()}</span>${ic('chev', 'sm')}</summary>
      <ul>${langLinks}</ul>
    </details>
    <a class="btn btn-wa hdr-wa" ${waAttrs(t.wa.default, 'header')} aria-label="${esc(t.cta.talkLong)}">${ic('wa')}<span>${esc(t.cta.talk)}</span></a>
  </div>
</header>

<main id="main">
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="eyebrow"><span class="dot" aria-hidden="true"></span>${esc(t.hero.eyebrow)}</p>
      <h1>${esc(t.hero.h1)}</h1>
      <p class="lead">${esc(t.hero.lead)}</p>
      <div class="hero-cta" id="hero-cta">
        <a class="btn btn-wa btn-lg" ${waAttrs(t.wa.default, 'hero')}>${ic('wa')}${esc(t.cta.talk)}</a>
        <a class="btn btn-ghost btn-lg" href="#quote">${esc(t.cta.quote)}</a>
      </div>
      <p class="reply">${ic('shield')}${esc(t.hero.reply)}</p>
      <ul class="badges">${t.hero.badges.map((b, i) => `<li>${ic(badgeIcons[i])}${esc(b)}</li>`).join('')}</ul>
    </div>
    <div class="hero-media">
      ${photo(photos.hero, t.alt.hero, { cls: 'photo-hero', eager: true, sizes: SIZES.hero, kind: 'van', draft, file: c.photos.hero.file })}
    </div>
  </div>
</section>

<section class="sec" id="services">
  <div class="wrap">
    <div class="head">
      <p class="kicker">${esc(t.services.kicker)}</p>
      <h2>${esc(t.services.title)}</h2>
      <p>${esc(t.services.intro)}</p>
    </div>
    <div class="grid grid-4">
      ${t.services.items.map((s, i) => `<article class="card"><span class="ico">${ic(serviceIcons[i])}</span><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></article>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec sec-alt" id="winton">
  <div class="wrap split">
    ${photo(photos.portrait, t.alt.portrait, { cls: 'photo-portrait', sizes: SIZES.portrait, kind: 'portrait', draft, file: c.photos.portrait.file })}
    <div>
      <p class="kicker">${esc(t.winton.kicker)}</p>
      <h2 class="h2">${esc(t.winton.title)}</h2>
      <p class="body">${esc(t.winton.body)}</p>
      <ul class="checks">${t.winton.points.map((p) => `<li>${ic('check')}${esc(p)}</li>`).join('')}</ul>
      <a class="btn btn-wa btn-lg" ${waAttrs(t.wa.default, 'winton')}>${ic('wa')}${esc(t.cta.talk)}</a>
    </div>
  </div>
</section>

<section class="sec" id="airports">
  <div class="wrap">
    <div class="head">
      <p class="kicker">${esc(t.airports.kicker)}</p>
      <h2>${esc(t.airports.title)}</h2>
      <p>${esc(t.airports.intro)}</p>
    </div>
    <div class="grid grid-apt">
      ${c.airports.map((a) => {
        const item = t.airports.items[a.code];
        const text = t.wa.airport.replace('{airport}', t.places[a.key]);
        const card = airportCards[a.code];
        if (card) {
          return `<a class="apt-card" ${waAttrs(text, 'airport-' + a.code)} aria-label="${esc(`${t.airports.action}: ${item.name}`)}"><img src="${card.src}" width="${card.width}" height="${card.height}" alt="${esc(`${a.code} · ${item.name} · ${item.area}`)}" loading="lazy" decoding="async"></a>`;
        }
        return `<a class="apt" ${waAttrs(text, 'airport-' + a.code)}><span class="code">${a.code}</span><strong>${esc(item.name)}</strong><span class="area">${ic('pin')}${esc(item.area)}</span><span class="go">${ic('wa')}${esc(t.airports.action)}${ic('arrow')}</span></a>`;
      }).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec sec-alt" id="routes">
  <div class="wrap">
    <div class="head">
      <p class="kicker">${esc(t.routes.kicker)}</p>
      <h2>${esc(t.routes.title)}</h2>
      <p>${esc(t.routes.intro)}</p>
    </div>
    <ul class="routes">
      ${c.routes.map(([from, to, mins]) => {
        const label = `${t.places[from]} → ${t.places[to]}`;
        const text = t.wa.route.replace('{route}', label);
        return `<li><a class="route" ${waAttrs(text, `route-${from}-${to}`)}><span class="route-path">${esc(t.places[from])}${ic('arrow')}${esc(t.places[to])}</span><span class="route-time">${ic('clock')}${fmtDuration(mins, t.units)}</span><span class="route-go">${ic('wa')}<span>${esc(t.routes.ask)}</span></span></a></li>`;
      }).join('\n      ')}
    </ul>
    <p class="note">${esc(t.routes.note)}</p>
  </div>
</section>

<section class="sec" id="quote">
  <div class="wrap quote">
    <div>
      <p class="kicker">${esc(t.quote.kicker)}</p>
      <h2 class="h2">${esc(t.quote.title)}</h2>
      <p class="body">${esc(t.quote.intro)}</p>
      <ul class="checks">${t.quote.points.map((p) => `<li>${ic('check')}${esc(p)}</li>`).join('')}</ul>
    </div>
    <form class="form" id="quote-form" action="https://wa.me/${c.whatsapp}" method="get" target="_blank" data-wa="https://wa.me/${c.whatsapp}" data-msg="${esc(JSON.stringify(msg))}">
      <div class="fields">
        <div class="f"><label for="q-from">${esc(t.quote.labels.from)}</label><input id="q-from" name="from" list="places" required autocomplete="off" placeholder="${esc(t.quote.placeholders.from)}"></div>
        <div class="f"><label for="q-to">${esc(t.quote.labels.to)}</label><input id="q-to" name="to" list="places" required autocomplete="off" placeholder="${esc(t.quote.placeholders.to)}"></div>
        <div class="f half"><label for="q-date">${esc(t.quote.labels.date)}</label><input id="q-date" name="date" type="date"></div>
        <div class="f half"><label for="q-time">${esc(t.quote.labels.time)}</label><input id="q-time" name="time" type="time"></div>
        <div class="f half"><label for="q-pax">${esc(t.quote.labels.pax)}</label><select id="q-pax" name="pax"><option value="">—</option>${[1, 2, 3, 4, 5, 6].map((n) => `<option>${n}</option>`).join('')}</select></div>
        <div class="f half"><label for="q-flight">${esc(t.quote.labels.flight)}</label><input id="q-flight" name="flight" autocomplete="off" placeholder="${esc(t.quote.placeholders.flight)}"></div>
        <div class="f"><label for="q-notes">${esc(t.quote.labels.notes)}</label><textarea id="q-notes" name="notes" rows="2" placeholder="${esc(t.quote.placeholders.notes)}"></textarea></div>
      </div>
      <input type="hidden" name="text" value="${esc(t.wa.default)}">
      <button class="btn btn-wa btn-lg" type="submit">${ic('wa')}${esc(t.quote.submit)}</button>
      <p class="hint">${ic('shield')}${esc(t.quote.hint)}</p>
      <datalist id="places">${placeOptions}</datalist>
    </form>
  </div>
</section>

<section class="sec sec-alt" id="vehicle">
  <div class="wrap split split-rev">
    <div class="photos">
      ${photo(photos.exterior, t.alt.exterior, { cls: 'photo-vehicle', sizes: SIZES.vehicle, kind: 'van', draft, file: c.photos.exterior.file })}
      ${photo(photos.interior, t.alt.interior, { cls: 'photo-vehicle', sizes: SIZES.vehicle, kind: 'interior', draft, file: c.photos.interior.file })}
    </div>
    <div>
      <p class="kicker">${esc(t.vehicle.kicker)}</p>
      <h2 class="h2">${esc(t.vehicle.title)}</h2>
      <p class="body">${esc(t.vehicle.intro)}</p>
      <ul class="specs">${t.vehicle.specs.map((s, i) => `<li><span class="ico">${ic(specIcons[i])}</span>${esc(s)}</li>`).join('')}</ul>
    </div>
  </div>
</section>

<section class="sec" id="reviews">
  <div class="wrap">
    <div class="head">
      <p class="kicker">${esc(t.reviews.kicker)}</p>
      <h2>${esc(t.reviews.title)}</h2>
      <p>${esc(t.reviews.intro)}</p>
    </div>
    <div class="reviews">
      <div id="reviews-slot" class="reviews-slot${reviewsEmbed ? ' is-loading' : ''}">
        <div class="reviews-fallback">
          <span class="g" aria-hidden="true">G</span>
          <div><h3>${esc(t.reviews.fallbackTitle)}</h3><p>${esc(t.reviews.fallbackBody)}</p></div>
        </div>
      </div>
      ${reviewsEmbed ? `<template id="reviews-embed">${reviewsEmbed}</template>` : ''}
      <a class="btn btn-ghost" href="${esc(c.googleMapsUrl)}" target="_blank" rel="noopener">${ic('star')}${esc(t.reviews.button)}</a>
    </div>
  </div>
</section>

<section class="sec sec-alt" id="faq">
  <div class="wrap faq-wrap">
    <div class="head">
      <p class="kicker">${esc(t.faq.kicker)}</p>
      <h2>${esc(t.faq.title)}</h2>
    </div>
    <div class="faq">
      ${t.faq.items.map((f, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(f.q)}${ic('chev')}</summary><p>${esc(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="sec" id="contact">
  <div class="wrap">
    <div class="final-scene${photos.cta ? ' has-photo' : ''}">
      ${photos.cta ? `<img class="final-bg" src="${photos.cta.src}"${srcsetAttrs(photos.cta, SIZES.cta)} width="${photos.cta.width}" height="${photos.cta.height}" alt="" loading="lazy" decoding="async">` : ''}
      <div class="final">
        <h2>${esc(t.final.title)}</h2>
        <p>${esc(t.final.body)}</p>
        <div class="row">
          <a class="btn btn-wa btn-lg" ${waAttrs(t.wa.default, 'final')}>${ic('wa')}${esc(t.cta.talkLong)}</a>
          <a class="btn btn-ghost btn-lg" ${tel}>${ic('phone')}${esc(c.phoneDisplay)}</a>
        </div>
      </div>
    </div>
  </div>
</section>
</main>

<footer class="ftr">
  <div class="wrap">
    <div class="ftr-grid">
      <div>
        <a class="brand" href="${pagePath(lang)}"><img class="logo" src="/images/logo.png" alt="My DR Taxi" width="427" height="100"></a>
        <p>${esc(t.footer.tagline)}</p>
      </div>
      <div>
        <h3>${esc(t.footer.contactTitle)}</h3>
        <ul class="stack">
          <li><a ${waAttrs(t.wa.default, 'footer')}>${ic('wa')}WhatsApp ${esc(c.phoneDisplay)}</a></li>
          <li><a ${tel}>${ic('phone')}${esc(c.phoneDisplay)}</a></li>
          <li><a href="${esc(c.googleMapsUrl)}" target="_blank" rel="noopener">${ic('pin')}Google Maps</a></li>
        </ul>
      </div>
      <div>
        <h3>${esc(t.footer.areasTitle)}</h3>
        <ul class="inline">${t.footer.areas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>
      </div>
      <div>
        <h3>${esc(t.footer.langsTitle)}</h3>
        <ul class="stack">${c.languages.map((l) => `<li><a href="${pagePath(l)}" hreflang="${l}" lang="${l}" data-setlang="${l}"${l === lang ? ' aria-current="page"' : ''}>${esc(dicts[l].langName)}</a></li>`).join('')}</ul>
      </div>
    </div>
    <p class="legal"><span>© ${year} ${esc(c.name)}. ${esc(t.footer.rights)}</span><span>mydrtaxi.com</span></p>
  </div>
</footer>

<div class="dock" id="dock">
  <a class="btn btn-wa" ${waAttrs(t.wa.default, 'dock')}>${ic('wa')}${esc(t.cta.talk)}</a>
  <a class="btn call" ${tel} aria-label="${esc(t.cta.call)} ${esc(c.phoneDisplay)}">${ic('phone')}</a>
</div>
<script>${js}</script>
</body>
</html>
`;
}

export function render404(ctx) {
  const { dicts, config: c, css, ogImage } = ctx;
  const t = dicts.en;
  const url = `${c.siteUrl}/404.html`;
  const page = { ...t, meta: { title: `${t.notFound.title} | ${c.name}`, description: t.meta.description } };
  const wa = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(t.wa.default)}`;
  return `${head({ lang: 'en', t: page, config: c, url, ogImage, css }).replace('index,follow,max-image-preview:large,max-snippet:-1', 'noindex,follow').replace(/<link rel="canonical"[^>]*>\n/, '')}
</head>
<body>
${sprite}
<main class="nf">
  <div class="wrap">
    <a class="brand" href="/"><img class="logo" src="/images/logo.png" alt="My DR Taxi" width="427" height="100"></a>
    <h1>${esc(t.notFound.title)}</h1>
    <p class="lead">${esc(t.notFound.body)}</p>
    <div class="row">
      <a class="btn btn-wa btn-lg" href="${esc(wa)}" target="_blank" rel="noopener">${ic('wa')}${esc(t.cta.talk)}</a>
      <a class="btn btn-ghost btn-lg" href="/">${esc(t.notFound.back)}</a>
    </div>
    <p class="nf-langs">${c.languages.map((l) => `<a href="${pagePath(l)}" hreflang="${l}" lang="${l}">${esc(dicts[l].langName)}</a>`).join(' · ')}</p>
  </div>
</main>
</body>
</html>
`;
}
