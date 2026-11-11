import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/company/social-links";
import { publicCompany, telephoneHref, type SocialPlatform } from "@/config/public-company";
import { Container } from "@/components/design-system/container";
import type { Locale } from "@/lib/i18n/config";
import { publicMedia } from "@/lib/media";
import { getRouteHref, type PrimaryNavigationRouteId } from "@/lib/site-navigation";

type CorporateFooterProps = {
  currentLocale: Locale;
  labels: {
    about: string;
    contact: string;
    costaRica: string;
    contactDetails: { address: string; email: string; fax: string; phone: string; whatsapp: string };
    disclaimer: string;
    copyright: string;
    footerLogoMissing: string;
    legalTitle: string;
    logoAlt: string;
    navigationTitle: string;
    privacy: string;
    social: Record<SocialPlatform, string>;
    socialTitle: string;
    tagline: string;
    technology: string;
    terms: string;
    unitedStates: string;
    whatWeDo: string;
  };
};

export function CorporateFooter({ currentLocale, labels }: CorporateFooterProps) {
  const sectionLinks: Array<{ id: PrimaryNavigationRouteId; label: string }> = [
    { id: "what-we-do", label: labels.whatWeDo },
    { id: "technology", label: labels.technology },
    { id: "about", label: labels.about },
    { id: "contact", label: labels.contact },
  ];

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            {publicMedia.footerLogo ? (
              <Link aria-label={labels.logoAlt} className="site-footer__logo" href={`/${currentLocale}`}>
                <Image alt={labels.logoAlt} height={725} src={publicMedia.footerLogo} width={2170} />
              </Link>
            ) : <p className="site-footer__asset-notice">{labels.footerLogoMissing}</p>}
            <p>{labels.tagline}</p>
            <SocialLinks label={labels.socialTitle} labels={labels.social} links={publicCompany.social} />
          </div>
          <nav aria-label={labels.navigationTitle} className="site-footer__explore">
            <p className="site-footer__heading">{labels.navigationTitle}</p>
            <ul>
              {sectionLinks.map(({ id, label }) => (
                <li key={id}><Link href={getRouteHref(currentLocale, id)}>{label}</Link></li>
              ))}
            </ul>
          </nav>
          <section aria-labelledby="footer-united-states-title" className="site-footer__united-states">
            <p className="site-footer__heading" id="footer-united-states-title">{labels.unitedStates}</p>
            <address className="site-footer__location">
              <p className="site-footer__entity">LAMBTECH LLC</p>
              <p>{publicCompany.address}</p>
              <a href={telephoneHref(publicCompany.fax.e164)}>{labels.contactDetails.fax}: {publicCompany.fax.display}</a>
            </address>
          </section>
          <section aria-labelledby="footer-costa-rica-title" className="site-footer__costa-rica">
            <p className="site-footer__heading" id="footer-costa-rica-title">{labels.costaRica}</p>
            <address className="site-footer__location">
              {publicCompany.costaRicaAddress.map((line) => <p key={line}>{line}</p>)}
              <a href={telephoneHref(publicCompany.phone.e164)}>{labels.contactDetails.phone}: {publicCompany.phone.display}</a>
              <a href={`mailto:${publicCompany.email}`}>{labels.contactDetails.email}: {publicCompany.email}</a>
            </address>
          </section>
          <nav aria-label={labels.legalTitle} className="site-footer__legal">
            <p className="site-footer__heading">{labels.legalTitle}</p>
            <ul>
              <li><Link href={`/${currentLocale}/privacy`}>{labels.privacy}</Link></li>
              <li><Link href={`/${currentLocale}/terms`}>{labels.terms}</Link></li>
              <li><Link href={`/${currentLocale}/disclaimer`}>{labels.disclaimer}</Link></li>
            </ul>
          </nav>
        </div>
        <p className="site-footer__base">{labels.copyright}</p>
      </Container>
    </footer>
  );
}
