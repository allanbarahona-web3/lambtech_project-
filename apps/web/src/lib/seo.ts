import type { Metadata } from "next";
import { publicCompany } from "@/config/public-company";
import { defaultLocale, locales, type Locale } from "./i18n/config";

function getMetadataBase() {
  if (!publicCompany.website) {
    return undefined;
  }

  try {
    return new URL(publicCompany.website);
  } catch {
    return undefined;
  }
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

  return {
    alternates: {
      canonical: pathname,
      languages: {
        en: normalizedSuffix ? `/en/${normalizedSuffix}` : "/en",
        es: normalizedSuffix ? `/es/${normalizedSuffix}` : "/es",
        "x-default": normalizedSuffix ? `/${defaultLocale}/${normalizedSuffix}` : `/${defaultLocale}`,
      },
    },
    description,
    icons: publicCompany.media.faviconUrl
      ? {
          icon: [{ type: "image/png", url: publicCompany.media.faviconUrl }],
          shortcut: [{ type: "image/png", url: publicCompany.media.faviconUrl }],
        }
      : undefined,
    metadataBase: getMetadataBase(),
    ...(noIndex ? { robots: { follow: false, index: false } } : {}),
    title,
  };
}

export function getLocaleStaticParams() {
  return locales.map((locale) => ({ locale }));
}
