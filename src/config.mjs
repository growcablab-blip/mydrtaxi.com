// Single source of truth for business facts. Keep these identical to the
// Google Business Profile (name, phone, service area) for local SEO.
export const config = {
  siteUrl: 'https://mydrtaxi.com',
  name: 'My DR Taxi',
  formerName: 'Winton Quick Services', // previous business name, for search/AI entity matching only
  driver: 'Winton',
  phone: '+18299295355',
  phoneDisplay: '+1 829-929-5355',
  whatsapp: '18299295355',
  googleMapsUrl: 'https://maps.app.goo.gl/aPBnN6ropype1h8V6',

  languages: ['en', 'es', 'fr', 'ru'],
  ogLocale: { en: 'en_US', es: 'es_DO', fr: 'fr_FR', ru: 'ru_RU' },

  // Site photography, relative to public/images/. `variants` are extra widths that
  // must exist as <name>-<width>.jpg next to the file (used for srcset).
  // A missing file renders the illustrated placeholder instead.
  photos: {
    hero: { file: 'winton-driving.jpg', width: 1536, height: 1024, variants: [960] },
    portrait: { file: 'meet-winton.jpg', width: 1374, height: 1145, variants: [800] },
    exterior: { file: 'vehicle/exterior.jpg', width: 1316, height: 482, variants: [800] },
    interior: { file: 'vehicle/interior.jpg', width: 1316, height: 482, variants: [800] },
    cta: { file: 'cta/airport-arrival.jpg', width: 1920, height: 819, variants: [1100] },
  },

  // Complete airport card visuals (text + button artwork baked in); the whole card
  // is rendered as a real WhatsApp link.
  airportCard: { width: 413, height: 779 },

  // Paste the embed code from your live Google Reviews widget provider
  // (e.g. Elfsight, Trustindex, EmbedSocial) between the backticks.
  // It is lazy-loaded only when visitors scroll near the reviews section.
  reviews: {
    embedHtml: ``,
  },

  // English names used in structured data.
  airports: [
    { code: 'POP', key: 'pop', name: 'Gregorio Luperón International Airport', city: 'Puerto Plata', card: 'airports/pop.jpg' },
    { code: 'STI', key: 'sti', name: 'Cibao International Airport', city: 'Santiago de los Caballeros', card: 'airports/sti.jpg' },
    { code: 'SDQ', key: 'sdq', name: 'Las Américas International Airport', city: 'Santo Domingo', card: 'airports/sdq.jpg' },
    { code: 'PUJ', key: 'puj', name: 'Punta Cana International Airport', city: 'Punta Cana', card: 'airports/puj.jpg' },
  ],

  // [from place key, to place key, approx. drive minutes]
  routes: [
    ['pop', 'sosua', 15],
    ['pop', 'cabarete', 30],
    ['pop', 'puertoPlata', 20],
    ['cabarete', 'sosua', 20],
    ['sti', 'cabarete', 105],
    ['sdq', 'cabarete', 240],
    ['puj', 'cabarete', 330],
  ],

  areaServed: [
    'Cabarete', 'Sosúa', 'Puerto Plata', 'Playa Dorada',
    'Santiago de los Caballeros', 'Santo Domingo', 'Punta Cana',
  ],
};
