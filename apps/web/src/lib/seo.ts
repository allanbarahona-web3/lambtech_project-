import type { Metadata } from "next";
import { isProductionSite, publicCompany, publicSiteOrigin, publicSiteUrl } from "@/config/public-company";
import { heroMedia, publicMedia } from "@/lib/media";
import { defaultLocale, locales, type Locale } from "./i18n/config";

function getOpenGraphLocale(locale: Locale) {
  return locale === "es" ? "es_ES" : "en_US";
}

export function getLocaleMetadata(
  locale: Locale,
  title: string,
  description: string,
  pathSuffix = "",
  { noIndex = false }: { noIndex?: boolean } = {},
): Metadata {
  const normalizedSuffix = pathSuffix.replace(/^\/+/, "");
  const pathname = normalizedSuffix ? `/${locale}/${normalizedSuffix}` : `/${locale}`;
  const canonicalUrl = publicSiteUrl(pathname);
  const isNoIndex = noIndex || !isProductionSite();
  const socialImage = heroMedia.desktop
    ? [{ alt: `${title} | ${publicCompany.name}`, height: heroMedia.height, url: heroMedia.desktop, width: heroMedia.width }]
    : undefined;

  return {
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: publicSiteUrl(normalizedSuffix ? `/en/${normalizedSuffix}` : "/en"),
        es: publicSiteUrl(normalizedSuffix ? `/es/${normalizedSuffix}` : "/es"),
        "x-default": publicSiteUrl(normalizedSuffix ? `/${defaultLocale}/${normalizedSuffix}` : `/${defaultLocale}`),
      },
    },
    description,
    icons: publicMedia.favicon
      ? {
          icon: [{ type: "image/png", url: publicMedia.favicon }],
          shortcut: [{ type: "image/png", url: publicMedia.favicon }],
        }
      : undefined,
    metadataBase: publicSiteOrigin,
    openGraph: {
      description,
      images: socialImage,
      locale: getOpenGraphLocale(locale),
      siteName: publicCompany.name,
      title,
      type: "website",
      url: canonicalUrl,
    },
    ...(isNoIndex ? { robots: { follow: false, index: false } } : {}),
    title,
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      description,
      images: socialImage?.map((image) => image.url),
      title,
    },
  };
}

export function getLocaleStaticParams() {
  return locales.map((locale) => ({ locale }));
}
