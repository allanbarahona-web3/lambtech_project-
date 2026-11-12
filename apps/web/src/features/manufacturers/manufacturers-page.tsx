import { ManufacturerLogoGrid } from "@/components/company/manufacturer-logo-grid";
import { ButtonLink } from "@/components/design-system/button-link";
import { CommercialProcess } from "@/components/design-system/commercial-process";
import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import type { Locale } from "@/lib/i18n/config";
import type { ManufacturerLogo, ResponsiveMedia } from "@/lib/media";
import { getRouteHref } from "@/lib/site-navigation";

type EditorialSection = {
  description: string;
  eyebrow: string;
  items: string[];
  title: string;
};

type ProcessStep = { copy: string; number: string; title: string };

export type ManufacturersPageContent = {
  cta: { label: string; title: string; whatsapp: string };
  channels: EditorialSection;
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
  network: { description: string; eyebrow: string; title: string };
  opportunities: EditorialSection;
  process: { description: string; steps: ProcessStep[]; title: string };
};

type ManufacturersPageProps = {
  content: ManufacturersPageContent;
  currentLocale: Locale;
  media: { hero?: ResponsiveMedia };
  logos: readonly ManufacturerLogo[];
};

function CapabilityList({ items }: { items: string[] }) {
  return <ul className="capability-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function ManufacturersPage({ content, currentLocale, logos, media }: ManufacturersPageProps) {
  return (
    <main className="internal-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.hero} title={content.introduction.title} titleId="manufacturers-title" />

      <section aria-labelledby="manufacturer-opportunities-title" className="internal-page__section">
        <Container>
          <div className="editorial-split">
            <SectionHeading description={content.opportunities.description} eyebrow={content.opportunities.eyebrow} title={content.opportunities.title} titleId="manufacturer-opportunities-title" />
            <CapabilityList items={content.opportunities.items} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="manufacturer-channels-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="editorial-split editorial-split--reverse">
            <SectionHeading description={content.channels.description} eyebrow={content.channels.eyebrow} title={content.channels.title} titleId="manufacturer-channels-title" />
            <CapabilityList items={content.channels.items} />
          </div>
          <CommercialProcess description={content.process.description} steps={content.process.steps} title={content.process.title} titleId="manufacturer-process-title" />
        </Container>
      </section>

      <section aria-labelledby="manufacturer-network-title" className="internal-page__section">
        <Container>
          <SectionHeading description={content.network.description} eyebrow={content.network.eyebrow} title={content.network.title} titleId="manufacturer-network-title" />
          <ManufacturerLogoGrid logos={logos} />
        </Container>
      </section>

      <section aria-labelledby="manufacturers-cta-title" className="internal-page__cta">
        <Container>
          <div>
            <p className="eyebrow">LAMBTECH LLC</p>
            <h2 id="manufacturers-cta-title">{content.cta.title}</h2>
          </div>
          <div className="page-actions">
            <ButtonLink data-inquiry-type="manufacturer" href={getRouteHref(currentLocale, "contact")}>{content.cta.label}</ButtonLink>
            <ButtonLink href={publicCompany.whatsappUrl} rel="noopener noreferrer" target="_blank" variant="secondary">{content.cta.whatsapp}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
