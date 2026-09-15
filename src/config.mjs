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

  // Drop real photos into public/images/ using these base names
  // (.jpg, .jpeg, .png or .webp — add both .webp and .jpg for best results).
  // Missing photos render as clean illustrated placeholders.
  photos: {
    hero: 'winton-minivan',       // Winton with the Toyota minivan (portrait 4:4.6)
    portrait: 'winton-portrait',  // Friendly photo of Winton (4:4.4)
    avatar: 'winton-avatar',      // Face crop for the round driver-card avatar (square); falls back to portrait
    exterior: 'minivan-exterior', // The minivan, e.g. trunk full of luggage (landscape 16:10)
    airport: 'airport-luggage',   // Airport pickup / loading luggage (landscape 16:10)
  },

  // Paste the embed code from your live Google Reviews widget provider
  // (e.g. Elfsight, Trustindex, EmbedSocial) between the backticks.
  // It is lazy-loaded only when visitors scroll near the reviews section.
  reviews: {
    embedHtml: ``,
  },

  // English names used in structured data.
  airports: [
    { code: 'POP', key: 'pop', name: 'Gregorio Luperón International Airport', city: 'Puerto Plata' },
    { code: 'STI', key: 'sti', name: 'Cibao International Airport', city: 'Santiago de los Caballeros' },
    { code: 'SDQ', key: 'sdq', name: 'Las Américas International Airport', city: 'Santo Domingo' },
    { code: 'PUJ', key: 'puj', name: 'Punta Cana International Airport', city: 'Punta Cana' },
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
