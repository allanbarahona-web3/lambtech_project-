export type SocialPlatform = "facebook" | "instagram" | "linkedin" | "tiktok";

export type PublicPartnerLogo = {
  name: string;
  src: string;
};

function optionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function publicHttpUrl(value: string | undefined) {
  const candidate = optionalValue(value);
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function publicEmail(value: string | undefined) {
  const candidate = optionalValue(value);
  return candidate && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? candidate : undefined;
}

function publicPhone(value: string | undefined) {
  const candidate = optionalValue(value);
  return candidate && /\d/.test(candidate) ? candidate : undefined;
}

function publicE164(value: string | undefined) {
  const candidate = optionalValue(value);
  return candidate && /^\+[1-9]\d{6,14}$/.test(candidate) ? candidate : undefined;
}

function publicTelephone(displayValue: string | undefined, e164Value: string | undefined) {
  const display = publicPhone(displayValue);
  const e164 = publicE164(e164Value);
  return display && e164 ? { display, e164 } : undefined;
}

function partnerLogos(value: string | undefined): PublicPartnerLogo[] {
  const candidates = optionalValue(value)?.split(";") ?? [];

  return candidates.flatMap((candidate) => {
    const [name, rawUrl] = candidate.split("|", 2).map((part) => part.trim());
    const src = publicHttpUrl(rawUrl);
    return name && src ? [{ name, src }] : [];
  });
}

const social = {
  facebook: publicHttpUrl(process.env.NEXT_PUBLIC_FACEBOOK_URL),
  instagram: publicHttpUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  linkedin: publicHttpUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL),
  tiktok: publicHttpUrl(process.env.NEXT_PUBLIC_TIKTOK_URL),
} satisfies Record<SocialPlatform, string | undefined>;

export const publicCompany = {
  address: optionalValue(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
  email: publicEmail(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
  fax: publicTelephone(process.env.NEXT_PUBLIC_COMPANY_FAX, process.env.NEXT_PUBLIC_COMPANY_FAX_E164),
  jurisdiction: optionalValue(process.env.NEXT_PUBLIC_COMPANY_JURISDICTION),
  media: {
    aboutIntroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_ABOUT_INTRO_IMAGE_URL),
    faviconUrl: publicHttpUrl(process.env.NEXT_PUBLIC_FAVICON_URL),
    footerLogoUrl: publicHttpUrl(process.env.NEXT_PUBLIC_FOOTER_LOGO_URL),
    heroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_LAMBTECH_HERO_IMAGE_URL),
    latamIntroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_LATAM_INTRO_IMAGE_URL),
    latamSupportingImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_LATAM_SUPPORTING_IMAGE_URL),
    manufacturersIntroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_MANUFACTURERS_INTRO_IMAGE_URL),
    technologyConnectedImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_TECHNOLOGY_CONNECTED_IMAGE_URL),
    technologyGasImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_TECHNOLOGY_GAS_IMAGE_URL),
    technologyIndustrialImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_TECHNOLOGY_INDUSTRIAL_IMAGE_URL),
    technologyIntroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_TECHNOLOGY_INTRO_IMAGE_URL),
    technologyWaterImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_TECHNOLOGY_WATER_IMAGE_URL),
    whatWeDoIntroImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_WHAT_WE_DO_INTRO_IMAGE_URL),
    whatWeDoSupportingImageUrl: publicHttpUrl(process.env.NEXT_PUBLIC_WHAT_WE_DO_SUPPORTING_IMAGE_URL),
  },
  name: optionalValue(process.env.NEXT_PUBLIC_COMPANY_NAME),
  partnerLogos: partnerLogos(process.env.NEXT_PUBLIC_PARTNER_LOGOS),
  phone: publicTelephone(process.env.NEXT_PUBLIC_COMPANY_PHONE, process.env.NEXT_PUBLIC_COMPANY_PHONE_E164),
  social,
  website: publicHttpUrl(process.env.NEXT_PUBLIC_COMPANY_WEBSITE),
  whatsappUrl: publicHttpUrl(process.env.NEXT_PUBLIC_WHATSAPP_URL),
} as const;

export function telephoneHref(e164: string) {
  return `tel:${e164}`;
}
