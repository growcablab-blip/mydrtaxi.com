// schema.org JSON-LD for each language page.
// Note: no aggregateRating — self-served review markup is not eligible for
// Google rich results and must never be invented.

export function buildSchema({ lang, t, config: c, url, ogImage }) {
  const S = c.siteUrl;
  const business = `${S}/#business`;
  const airports = c.airports.map((a) => ({
    '@type': 'Airport', name: a.name, iataCode: a.code,
    address: { '@type': 'PostalAddress', addressLocality: a.city, addressCountry: 'DO' },
  }));
  const cities = c.areaServed.map((name) => ({ '@type': 'City', name }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': business,
        name: c.name,
        alternateName: [c.formerName, 'MyDRTaxi.com'],
        url: `${S}/`,
        description: t.footer.tagline,
        telephone: c.phone,
        image: ogImage,
        logo: `${S}/icon-512.png`,
        priceRange: '$$',
        address: { '@type': 'PostalAddress', addressRegion: 'Puerto Plata', addressCountry: 'DO' },
        areaServed: [...cities, ...airports, { '@type': 'Country', name: 'Dominican Republic' }],
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '00:00', closes: '23:59',
        },
        hasMap: c.googleMapsUrl,
        sameAs: [c.googleMapsUrl],
        knowsLanguage: c.languages,
        contactPoint: {
          '@type': 'ContactPoint', telephone: c.phone, contactType: 'reservations',
          availableLanguage: ['English', 'Spanish', 'French', 'Russian'],
          hoursAvailable: { '@type': 'OpeningHoursSpecification', opens: '00:00', closes: '23:59' },
        },
        employee: { '@type': 'Person', name: c.driver, jobTitle: 'Private driver' },
      },
      {
        '@type': 'TaxiService',
        '@id': `${S}/#taxi-service`,
        name: `${c.name} — ${t.services.items[1].t}`,
        serviceType: ['Airport transfer', 'Airport meet and greet', 'Private taxi', 'Private driver', 'Long-distance private transfer'],
        provider: { '@id': business },
        providerMobility: 'dynamic',
        areaServed: [...cities, ...airports],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `https://wa.me/${c.whatsapp}`,
          servicePhone: { '@type': 'ContactPoint', telephone: c.phone },
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: t.services.title,
          itemListElement: t.services.items.map((s) => ({
            '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.t, description: s.d },
          })),
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${S}/#website`,
        url: `${S}/`,
        name: c.name,
        inLanguage: c.languages,
        publisher: { '@id': business },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: t.meta.title,
        description: t.meta.description,
        inLanguage: lang,
        isPartOf: { '@id': `${S}/#website` },
        about: { '@id': business },
        primaryImageOfPage: ogImage,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        inLanguage: lang,
        mainEntity: t.faq.items.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };
}
