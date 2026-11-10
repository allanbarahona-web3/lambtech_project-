import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/design-system/container";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import type { Locale } from "@/lib/i18n/config";
import {
  getRouteHref,
  headerNavigationRouteIds,
  mobileNavigationRouteIds,
  type HeaderNavigationRouteId,
} from "@/lib/site-navigation";
import { MobileNavigation } from "./mobile-navigation";

type CorporateHeaderProps = {
  currentLocale: Locale;
  currentPage?: HeaderNavigationRouteId;
  localePath?: string;
  labels: {
    about: string;
    contact: string;
    english: string;
    language: string;
    latam: string;
    logoAlt: string;
    manufacturers: string;
    menuClose: string;
    menuOpen: string;
    navigation: string;
    spanish: string;
    technology: string;
    home: string;
    whatWeDo: string;
  };
};

function getNavigationLabel(id: HeaderNavigationRouteId, labels: CorporateHeaderProps["labels"]) {
  switch (id) {
    case "home": return labels.home;
    case "what-we-do": return labels.whatWeDo;
    case "technology": return labels.technology;
    case "manufacturers": return labels.manufacturers;
    case "latam": return labels.latam;
    case "about": return labels.about;
    case "contact": return labels.contact;
  }
}

export function CorporateHeader({ currentLocale, currentPage, labels, localePath }: CorporateHeaderProps) {
  const desktopNavigationItems = headerNavigationRouteIds.map((id) => ({
    href: getRouteHref(currentLocale, id),
    id,
    label: getNavigationLabel(id, labels),
  }));
  const mobileNavigationItems = mobileNavigationRouteIds.map((id) => ({
    href: getRouteHref(currentLocale, id),
    id,
    label: getNavigationLabel(id, labels),
  }));

  return (
    <header className="site-header">
      <Container className="site-header__container">
        <div className="site-header__desktop">
          <Link className="site-header__logo" href={`/${currentLocale}`}>
            <Image
              alt={labels.logoAlt}
              height={713}
              priority
              sizes="(max-width: 63.99rem) 140px, 164px"
              src="/LogoColor.png"
              width={2206}
            />
          </Link>

          <nav aria-label={labels.navigation} className="site-header__primary-navigation">
            <ul>
              {desktopNavigationItems.map((item) => (
                <li key={item.id}>
                  <Link aria-current={currentPage === item.id ? "page" : undefined} className="site-header__navigation-link" href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="site-header__utilities">
            <LocaleSwitcher
              currentLocale={currentLocale}
              englishAccessibleLabel={labels.english}
              englishLabel="EN"
              label={labels.language}
              path={localePath}
              spanishAccessibleLabel={labels.spanish}
              spanishLabel="ES"
            />
            <Link aria-current={currentPage === "contact" ? "page" : undefined} className="site-header__contact-cta" href={getRouteHref(currentLocale, "contact")}>{labels.contact}</Link>
          </div>
        </div>

        <div className="site-header__mobile-bar">
          <Link className="site-header__logo" href={`/${currentLocale}`}>
            <Image
              alt={labels.logoAlt}
              height={713}
              priority
              sizes="140px"
              src="/LogoColor.png"
              width={2206}
            />
          </Link>
          <MobileNavigation
            closeLabel={labels.menuClose}
            currentLocale={currentLocale}
            currentPage={currentPage}
            englishLabel={labels.english}
            items={mobileNavigationItems}
            languageLabel={labels.language}
            localePath={localePath}
            navigationLabel={labels.navigation}
            openLabel={labels.menuOpen}
            spanishLabel={labels.spanish}
          />
        </div>
      </Container>
    </header>
  );
}
