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
  favicon: publicMediaUrl("Favicon.png"),
  founderPortrait: publicMediaUrl("Executive PortraitFounder.png"),
  footerLogo: publicMediaUrl("Lambtech LogoFooter.png"),
  headerLogo: publicMediaUrl("LogoColor.png"),
  hero: publicMediaUrl("Hero Desktop Lambtech.svg"),
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
  height: 1080,
  src: publicMedia.hero,
  width: 1920,
} as const;
