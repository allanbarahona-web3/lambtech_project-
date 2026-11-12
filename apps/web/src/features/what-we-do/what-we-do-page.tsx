import { ButtonLink } from "@/components/design-system/button-link";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import { ProcurementJourney } from "@/features/what-we-do/procurement-journey";
import { ServiceScopes } from "@/features/what-we-do/service-scopes";
import type { Locale } from "@/lib/i18n/config";
import type { ResponsiveMedia } from "@/lib/media";
import { getRouteHref } from "@/lib/site-navigation";

type Scope = {
  description: string;
  title: string;
};

type ProcurementJourneySlide = { description: string; mediaAlt: string; title: string };

type ProcurementSection = { description: string; eyebrow: string; items: Scope[]; title: string };

export type WhatWeDoPageContent = {
  collaboration: { columns: Scope[]; description: string; eyebrow: string; title: string };
  cta: { contact: string; title: string; whatsapp: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
  marketDevelopment: { description: string; eyebrow: string; items: Scope[]; title: string };
  procurement: ProcurementSection;
  procurementJourney: {
    description: string;
    slides: ProcurementJourneySlide[];
    title: string;
  };
  solutions: { applications: Scope[]; description: string; eyebrow: string; mediaAlt: string; title: string };
};

type WhatWeDoPageProps = {
  content: WhatWeDoPageContent;
  currentLocale: Locale;
  media: { introduction?: ResponsiveMedia; procurementJourney: readonly ResponsiveMedia[]; supporting?: ResponsiveMedia };
};

export function WhatWeDoPage({ content, currentLocale, media }: WhatWeDoPageProps) {
  return (
    <main className="internal-page what-we-do-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.introduction} title={content.introduction.title} titleId="what-we-do-title" />

      <section aria-labelledby="procurement-title" className="internal-page__section">
        <Container>
          <div className="procurement-overview">
            <SectionHeading className="procurement-overview__heading" description={content.procurement.description} eyebrow={content.procurement.eyebrow} title={content.procurement.title} titleId="procurement-title" />
            <ServiceScopes items={content.procurement.items} />
            <ProcurementJourney description={content.procurementJourney.description} media={media.procurementJourney} slides={content.procurementJourney.slides} title={content.procurementJourney.title} />
          </div>
        </Container>
      </section>

      <section className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="market-collaboration">
            <div className="market-collaboration__stage">
              <SectionHeading description={content.marketDevelopment.description} eyebrow={content.marketDevelopment.eyebrow} title={content.marketDevelopment.title} titleId="market-development-title" />
              <div className="market-collaboration__scopes">
                {content.marketDevelopment.items.map((item) => (
                  <article key={item.title}>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="market-collaboration__stage market-collaboration__stage--collaboration">
              <SectionHeading description={content.collaboration.description} eyebrow={content.collaboration.eyebrow} title={content.collaboration.title} titleId="collaboration-title" />
              <div className="market-collaboration__columns">
                {content.collaboration.columns.map((column) => (
                  <article key={column.title}>
                    <h3>{column.title}</h3>
                    <p>{column.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="solutions-title" className="internal-page__section">
        <Container>
          <div className="solutions-feature">
            <figure className="solutions-feature__media">
              <PublicMediaFrame alt={content.solutions.mediaAlt} aspectRatio="3 / 2" className="solutions-feature__image" fallbackLabel={content.solutions.mediaAlt} height={1200} loading="lazy" mobileSrc={media.supporting?.mobile} src={media.supporting?.desktop} width={1800} />
            </figure>
            <div>
              <SectionHeading description={content.solutions.description} eyebrow={content.solutions.eyebrow} title={content.solutions.title} titleId="solutions-title" />
              <div className="solutions-feature__applications">
                {content.solutions.applications.map((application) => (
                  <article key={application.title}>
                    <h3>{application.title}</h3>
                    <p>{application.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="internal-page__cta" aria-labelledby="what-we-do-cta-title">
        <Container>
          <div>
            <p className="eyebrow">LAMBTECH LLC</p>
            <h2 id="what-we-do-cta-title">{content.cta.title}</h2>
          </div>
          <div className="page-actions">
            <ButtonLink href={getRouteHref(currentLocale, "contact")}>{content.cta.contact}</ButtonLink>
            <ButtonLink href={publicCompany.whatsappUrl} rel="noopener noreferrer" target="_blank" variant="secondary">{content.cta.whatsapp}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
