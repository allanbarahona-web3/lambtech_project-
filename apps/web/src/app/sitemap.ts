import type { MetadataRoute } from "next";
import { publicSiteUrl } from "@/config/public-company";
import { locales } from "@/lib/i18n/config";
import { corporateRouteIds } from "@/lib/site-navigation";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) => [
    { priority: 1, url: publicSiteUrl(`/${locale}`) },
    ...corporateRouteIds.map((page) => ({ priority: 0.8, url: publicSiteUrl(`/${locale}/${page}`) })),
  ]);
}
