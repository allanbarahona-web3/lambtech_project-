type MediaPath = `${string}.${"png" | "svg" | "webp" | "jpg" | "jpeg" | "avif"}`;

export type ManufacturerLogo = {
  desktopSrc?: string;
  mobileSrc?: string;
  name: string;
};

export type ResponsiveMedia = {
  desktop?: string;
  mobile?: string;
};

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
  aboutIntroduction: {
    desktop: publicMediaUrl("lambtech-about-intro-desktop.webp"),
    mobile: publicMediaUrl("lambtech-about-intro-mobile.webp"),
  } satisfies ResponsiveMedia,
  contactPortrait: publicMediaUrl("lambtech-contact-portrait.webp"),
  favicon: publicMediaUrl("Favicon.png"),
  founderPortrait: publicMediaUrl("Executive PortraitFounder.png"),
  footerLogo: publicMediaUrl("Lambtech LogoFooter.png"),
  headerLogo: publicMediaUrl("LogoColor.png"),
  heroDesktop: publicMediaUrl("lambtech-hero-scada-Desktop.webp"),
  heroMobile: publicMediaUrl("lambtech-hero-scada-mobile.webp"),
  latamIntroduction: {
    desktop: publicMediaUrl("lambtech-latam-intro-desktop.webp"),
    mobile: publicMediaUrl("lambtech-latam-intro-mobile.webp"),
  } satisfies ResponsiveMedia,
  latamSupporting: {
    desktop: publicMediaUrl("lambtech-latam-collaboration-desktop.webp"),
    mobile: publicMediaUrl("lambtech-latam-collaboration-mobile.webp"),
  } satisfies ResponsiveMedia,
  manufacturerLogos: [
    { desktopSrc: publicMediaUrl("orionis-desktop.webp"), mobileSrc: publicMediaUrl("orionis-mobile.webp"), name: "Orionis" },
    { desktopSrc: publicMediaUrl("apator-desktop.webp"), mobileSrc: publicMediaUrl("apator-mobile.webp"), name: "Apator" },
    { desktopSrc: publicMediaUrl("seba-kmt-desktop.webp"), mobileSrc: publicMediaUrl("seba-kmt-mobile.webp"), name: "SebaKMT" },
    { desktopSrc: publicMediaUrl("mru-desktop.webp"), mobileSrc: publicMediaUrl("mru-mobile.webp"), name: "MRU" },
  ] satisfies readonly ManufacturerLogo[],
  technologyConnected: publicMediaUrl("lambtech-connectivity-monitoring.webp"),
  technologyGas: publicMediaUrl("lambtech-biogas-energy.webp"),
  technologyIndustrial: publicMediaUrl("lambtech-industrial-instrumentation.webp"),
  technologyIntroduction: {
    desktop: publicMediaUrl("lambtech-technology-intro-desktop.webp"),
    mobile: publicMediaUrl("lambtech-technology-intro-mobile.webp"),
  } satisfies ResponsiveMedia,
  technologyWater: publicMediaUrl("lambtech-water-infrastructure.webp"),
  whatWeDoIntroduction: {
    desktop: publicMediaUrl("lambtech-what-we-do-intro-desktop.webp"),
    mobile: publicMediaUrl("lambtech-what-we-do-intro-mobile.webp"),
  } satisfies ResponsiveMedia,
  whatWeDoSupporting: {
    desktop: publicMediaUrl("lambtech-technology-solutions-desktop.webp"),
    mobile: publicMediaUrl("lambtech-technology-solutions-mobile.webp"),
  } satisfies ResponsiveMedia,
} as const;

export const heroMedia = {
  desktop: publicMedia.heroDesktop,
  height: 1080,
  mobile: publicMedia.heroMobile,
  width: 1920,
} as const;
