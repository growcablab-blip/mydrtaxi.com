// Inline SVG sprite (24px grid, stroke icons) + placeholder illustrations.

const symbols = {
  wa: '<path d="M3.5 20.5 4.9 16.4A8.5 8.5 0 1 1 7.9 19z"/><path fill="currentColor" stroke="none" d="M9.3 7.6c.3-.3.8-.3 1 .1l.9 1.8c.2.3.1.7-.2 1l-.6.6c.5 1.1 1.4 2 2.5 2.5l.6-.6c.3-.3.7-.4 1-.2l1.8.9c.4.2.4.7.1 1l-.8.9c-.5.5-1.3.7-2 .4-2.4-1-4.3-2.9-5.3-5.3-.3-.7-.1-1.5.4-2z"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  sign: '<rect x="3" y="3" width="18" height="12" rx="2"/><path d="M7 7.5h10M7 11h6M12 15v6M8 21h8"/>',
  route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  wind: '<path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>',
  bag: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 5l7 7-7 7"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
};

export const sprite =
  '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
  Object.entries(symbols).map(([id, body]) => `<symbol id="i-${id}" viewBox="0 0 24 24">${body}</symbol>`).join('') +
  '</svg>';

export const ic = (name, cls = '') => `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// Line-art placeholders shown until real photos are added.
export const art = {
  van: `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">
<path d="M14 176h372" opacity=".25"/>
<path d="M40 152v-40q0-15 14-22l64-40q10-7 24-7h180q22 0 28 21l12 48q4 14 4 26v14z"/>
<path d="M94 92l38-33q6-3 14-3h54v36zM212 56h60v36h-60zM284 56h36q14 0 18 14l6 22h-60z" opacity=".8"/>
<path d="M206 98v44M278 98v44M44 120h14M352 118h12" opacity=".5"/>
<circle cx="112" cy="152" r="24" fill="#0c1a29"/><circle cx="112" cy="152" r="9"/>
<circle cx="302" cy="152" r="24" fill="#0c1a29"/><circle cx="302" cy="152" r="9"/>
</svg>`,
  portrait: `<svg viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
<circle cx="100" cy="78" r="32"/><path d="M36 190q0-58 64-58t64 58"/>
</svg>`,
  interior: `<svg viewBox="0 0 400 200" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" aria-hidden="true">
<rect x="62" y="44" width="72" height="92" rx="16"/><rect x="54" y="132" width="88" height="30" rx="12"/>
<rect x="164" y="44" width="72" height="92" rx="16"/><rect x="156" y="132" width="88" height="30" rx="12"/>
<rect x="266" y="44" width="72" height="92" rx="16"/><rect x="258" y="132" width="88" height="30" rx="12"/>
<path d="M14 176h372" opacity=".25"/>
</svg>`,
};
