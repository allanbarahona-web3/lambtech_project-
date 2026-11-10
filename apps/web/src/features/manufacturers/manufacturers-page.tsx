import { ManufacturerLogoGrid } from "@/components/company/manufacturer-logo-grid";
import { ButtonLink } from "@/components/design-system/button-link";
import { CommercialProcess } from "@/components/design-system/commercial-process";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import type { PublicPartnerLogo } from "@/config/public-company";
import type { Locale } from "@/lib/i18n/config";
import { getRouteHref } from "@/lib/site-navigation";

type EditorialSection = {
  description: string;
  eyebrow: string;
  items: string[];
  title: string;
};

type ProcessStep = { copy: string; number: string; title: string };

export type ManufacturersPageContent = {
  cta: { label: string; title: string };
  channels: EditorialSection;
  introduction: { description: string; eyebrow: string; mediaAlt: string; mediaCaption: string; mediaFallback: string; title: string };
  network: { description: string; eyebrow: string; logoFallback: string; pendingNote: string; title: string };
  opportunities: EditorialSection;
  process: { description: string; steps: ProcessStep[]; title: string };
};

type ManufacturersPageProps = {
  content: ManufacturersPageContent;
  currentLocale: Locale;
  logos: readonly PublicPartnerLogo[];
  media: { introduction?: string };
};

function CapabilityList({ items }: { items: string[] }) {
  return <ul className="capability-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function ManufacturersPage({ content, currentLocale, logos, media }: ManufacturersPageProps) {
  return (
    <main className="internal-page" id="main-content">
      <section className="internal-page__intro">
        <Container>
          <SectionHeading description={content.introduction.description} eyebrow={content.introduction.eyebrow} level="h1" title={content.introduction.title} />
          <figure className="editorial-media editorial-media--wide">
            <PublicMediaFrame alt={content.introduction.mediaAlt} aspectRatio="21 / 9" fallbackLabel={content.introduction.mediaFallback} src={media.introduction} />
            <figcaption>{content.introduction.mediaCaption}</figcaption>
          </figure>
        </Container>
      </section>

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
          <ManufacturerLogoGrid fallbackLabel={content.network.logoFallback} logos={logos} />
          {!logos.length ? <p className="manufacturer-logo-grid__note">{content.network.pendingNote}</p> : null}
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
          </div>
        </Container>
      </section>
    </main>
  );
}
