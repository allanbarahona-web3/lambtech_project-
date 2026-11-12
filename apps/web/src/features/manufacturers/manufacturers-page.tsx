import { ManufacturerLogoGrid } from "@/components/company/manufacturer-logo-grid";
import { ButtonLink } from "@/components/design-system/button-link";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import { ManufacturerChannelAccordion } from "@/features/manufacturers/manufacturer-channel-accordion";
import type { Locale } from "@/lib/i18n/config";
import type { ManufacturerLogo, ResponsiveMedia } from "@/lib/media";
import { getRouteHref } from "@/lib/site-navigation";

type MarketCard = {
  description: string;
  title: string;
};

type MarketOpportunitySection = {
  description: string;
  eyebrow: string;
  cards: MarketCard[];
  title: string;
};

type ChannelItem = { description: string; id: string; title: string };

type CommercialChannelsSection = {
  description: string;
  eyebrow: string;
  items: ChannelItem[];
  mediaAlt: string;
  title: string;
};

type ProcessStage = { description: string; focus: string; title: string };

export type ManufacturersPageContent = {
  cta: { label: string; title: string; whatsapp: string };
  channels: CommercialChannelsSection;
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
  network: { description: string; eyebrow: string; title: string };
  opportunities: MarketOpportunitySection;
  process: { description: string; focusLabel: string; stages: ProcessStage[]; title: string };
};

type ManufacturersPageProps = {
  content: ManufacturersPageContent;
  currentLocale: Locale;
  media: { channels?: ResponsiveMedia; hero?: ResponsiveMedia };
  logos: readonly ManufacturerLogo[];
};

export function ManufacturersPage({ content, currentLocale, logos, media }: ManufacturersPageProps) {
  return (
    <main className="internal-page manufacturer-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.hero} title={content.introduction.title} titleId="manufacturers-title" />

      <section aria-labelledby="manufacturer-opportunities-title" className="internal-page__section manufacturer-page__section">
        <Container>
          <SectionHeading className="manufacturer-market__heading" description={content.opportunities.description} eyebrow={content.opportunities.eyebrow} title={content.opportunities.title} titleId="manufacturer-opportunities-title" />
          <div className="manufacturer-market__cards">
            {content.opportunities.cards.map((card) => (
              <article key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="manufacturer-channels-title" className="internal-page__section internal-page__section--subtle manufacturer-page__section">
        <Container>
          <div className="manufacturer-channels">
            <figure className="manufacturer-channels__media">
              <PublicMediaFrame alt={content.channels.mediaAlt} aspectRatio="3 / 2" fallbackLabel={content.channels.mediaAlt} height={1200} loading="lazy" mobileSrc={media.channels?.mobile} src={media.channels?.desktop} width={1800} />
            </figure>
            <div className="manufacturer-channels__content">
              <SectionHeading description={content.channels.description} eyebrow={content.channels.eyebrow} title={content.channels.title} titleId="manufacturer-channels-title" />
              <ManufacturerChannelAccordion items={content.channels.items} />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="manufacturer-process-title" className="internal-page__section manufacturer-page__section manufacturer-process">
        <Container>
          <div className="manufacturer-process__intro">
            <h2 id="manufacturer-process-title">{content.process.title}</h2>
            <p>{content.process.description}</p>
          </div>
          <ol>
            {content.process.stages.map((stage) => (
              <li key={stage.title}>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <p className="manufacturer-process__focus"><span>{content.process.focusLabel}</span>{stage.focus}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="manufacturer-network-title" className="internal-page__section partner-network manufacturer-network">
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
