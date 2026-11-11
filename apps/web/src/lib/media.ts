type MediaPath = `${string}.${"png" | "svg" | "webp" | "jpg" | "jpeg" | "avif"}`;

function getMediaBaseUrl(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return undefined;

    url.hash = "";
    url.search = "";
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    return url;
  } catch {
    return undefined;
  }
}

const mediaBaseUrl = getMediaBaseUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);

function publicMediaUrl(path: MediaPath) {
  return mediaBaseUrl ? new URL(path, mediaBaseUrl).toString() : undefined;
}

// Object paths in the exclusive LAMBTECH Space. Only the base URL is configured
// per environment so assets can move behind the Space CDN without code changes.
export const publicMedia = {
  aboutIntroduction: undefined,
  contactPortrait: publicMediaUrl("lambtech-contact-portrait.webp"),
  favicon: publicMediaUrl("Favicon.png"),
  founderPortrait: publicMediaUrl("Executive PortraitFounder.png"),
  footerLogo: publicMediaUrl("Lambtech LogoFooter.png"),
  headerLogo: publicMediaUrl("LogoColor.png"),
  heroDesktop: publicMediaUrl("lambtech-hero-scada-Desktop.webp"),
  heroMobile: publicMediaUrl("lambtech-hero-scada-mobile.webp"),
  latamIntroduction: undefined,
  latamSupporting: undefined,
  manufacturersIntroduction: undefined,
  technologyConnected: undefined,
  technologyGas: undefined,
  technologyIndustrial: undefined,
  technologyIntroduction: undefined,
  technologyWater: undefined,
  whatWeDoIntroduction: undefined,
  whatWeDoSupporting: undefined,
} as const;

export const heroMedia = {
  desktop: publicMedia.heroDesktop,
  height: 1080,
  mobile: publicMedia.heroMobile,
  width: 1920,
} as const;
