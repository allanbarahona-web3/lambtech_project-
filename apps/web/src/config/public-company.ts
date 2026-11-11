export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok";

/**
 * Intentionally public LAMBTECH profile. Keep this versioned with the site;
 * credentials and deployment configuration do not belong here.
 */
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
  phone: { display: "+(506)84047638", e164: "+50684047638" },
  social: {
    facebook: "https://www.facebook.com/corderaguas#",
    instagram: "https://www.instagram.com/corderaguas",
    linkedin: "https://www.linkedin.com/company/corderaguas/posts/?feedView=all&viewAsMember=true",
    tiktok: undefined,
  } satisfies Record<SocialPlatform, string | undefined>,
  website: "https://lambtech.us",
  whatsappUrl: "https://wa.me/50684047638",
} as const;

export function telephoneHref(e164: string) {
  return `tel:${e164}`;
}
