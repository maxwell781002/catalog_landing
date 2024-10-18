import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "En El Garaje",
  // tagline: "Top-quality Hardware Tools",
  description: "EnElGaraje es una innovadora aplicación diseñada para permitir a los negocios, crear y gestionar sus propias tiendas online de manera rápida y eficiente.",
  description_short: "EnElGaraje es una innovadora aplicación diseñada para permitir a los negocios, crear y gestionar sus propias tiendas online de manera rápida y eficiente.",
  url: "https://wwww.enelgaraje.com",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "en_US",
  type: "website",
  url: SITE.url,
  title: `${SITE.title}: : Hardware Tools & Construction Services`,
  description: "Innovadora aplicación diseñada para permitir a los negocios, crear y gestionar sus propias tiendas online de manera rápida y e ciente",
  image: ogImageSrc,
};
