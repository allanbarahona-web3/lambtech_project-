export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok";

/** Official LAMBTECH profiles only. Leave unverified platforms undefined. */
export const publicCompany = {
  address: "30 N Gould St #69234, Sheridan, WY 82801, USA",
  costaRicaAddress: [
    "Oficentro Momentum Pinares",
    "Sánchez, Curridabat",
    "San José 11803, Costa Rica",
  ],
  email: "support@lambtech.us",
  fax: { display: "+1 (986) 300-8345", e164: "+19863008345" },
  jurisdiction: "Wyoming, USA",
  name: "LAMBTECH LLC",
  phone: { display: "+(506) 8404-7638", e164: "+50684047638" },
  social: {
    facebook: undefined,
    instagram: undefined,
    linkedin: undefined,
    tiktok: undefined,
  } satisfies Record<SocialPlatform, string | undefined>,
  website: "https://lambtech.us",
  whatsappUrl: "https://wa.me/50684047638",
} as const;

/** The canonical public origin. Do not derive this from an incoming request. */
export const publicSiteOrigin = new URL(publicCompany.website);

export function publicSiteUrl(pathname = "/") {
  return new URL(pathname, publicSiteOrigin).toString();
}

/**
 * Crawling and indexing are enabled only on the explicitly designated
 * production deployment. This keeps preview and QA deployments out of search
 * results even when they are built with NODE_ENV=production.
 */
export function isProductionSite() {
  return process.env.NEXT_PUBLIC_SITE_ENV === "production";
}

export function telephoneHref(e164: string) {
  return `tel:${e164}`;
}
