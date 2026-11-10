import type { Locale } from "@/lib/i18n/config";

export const corporateRouteIds = [
  "what-we-do",
  "technology",
  "manufacturers",
  "latam",
  "about",
  "contact",
] as const;

export const headerNavigationRouteIds = [
  "home",
  "what-we-do",
  "technology",
  "manufacturers",
  "latam",
  "about",
] as const;

export const mobileNavigationRouteIds = [
  ...headerNavigationRouteIds,
  "contact",
] as const;

export const primaryNavigationRouteIds = [
  "what-we-do",
  "technology",
  "about",
  "contact",
] as const;

export const legalRouteIds = ["privacy", "terms", "disclaimer"] as const;

export type CorporateRouteId = (typeof corporateRouteIds)[number];
export type HeaderNavigationRouteId = (typeof mobileNavigationRouteIds)[number];
export type PrimaryNavigationRouteId = (typeof primaryNavigationRouteIds)[number];
export type LegalRouteId = (typeof legalRouteIds)[number];
export type SiteRouteId = HeaderNavigationRouteId | LegalRouteId;

export function getRouteHref(locale: Locale, route: SiteRouteId) {
  return route === "home" ? `/${locale}` : `/${locale}/${route}`;
}

export function isCorporateRoute(value: string): value is CorporateRouteId {
  return corporateRouteIds.includes(value as CorporateRouteId);
}

export function isLegalRoute(value: string): value is LegalRouteId {
  return legalRouteIds.includes(value as LegalRouteId);
}
