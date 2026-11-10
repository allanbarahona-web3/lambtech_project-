import { ButtonLink } from "@/components/design-system/button-link";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import type { Locale } from "@/lib/i18n/config";
import { getRouteHref } from "@/lib/site-navigation";

type EditorialSection = {
  description: string;
  eyebrow: string;
  items: string[];
  title: string;
};

type ProcessStep = { copy: string; number: string; title: string };

export type WhatWeDoPageContent = {
  cta: { manufacturer: string; technology: string; title: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; mediaCaption: string; mediaFallback: string; title: string };
  marketDevelopment: EditorialSection;
  procurement: EditorialSection;
  process: { description: string; steps: ProcessStep[]; title: string };
  solutions: EditorialSection & { mediaAlt: string; mediaCaption: string; mediaFallback: string };
  trading: EditorialSection;
  partnerships: EditorialSection;
};

type WhatWeDoPageProps = {
  content: WhatWeDoPageContent;
  currentLocale: Locale;
  media: { introduction?: string; supporting?: string };
};

function CapabilityList({ items }: { items: string[] }) {
  return (
    <ul className="capability-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function WhatWeDoPage({ content, currentLocale, media }: WhatWeDoPageProps) {
  return (
    <main className="internal-page" id="main-content">
      <section className="internal-page__intro">
        <Container>
          <SectionHeading
            description={content.introduction.description}
            eyebrow={content.introduction.eyebrow}
            level="h1"
            title={content.introduction.title}
          />
          <figure className="editorial-media editorial-media--wide">
            <PublicMediaFrame
              alt={content.introduction.mediaAlt}
              aspectRatio="21 / 9"
              fallbackLabel={content.introduction.mediaFallback}
              src={media.introduction}
            />
            <figcaption>{content.introduction.mediaCaption}</figcaption>
          </figure>
        </Container>
      </section>

      <section aria-labelledby="procurement-title" className="internal-page__section">
        <Container>
          <div className="editorial-split">
            <SectionHeading description={content.procurement.description} eyebrow={content.procurement.eyebrow} title={content.procurement.title} titleId="procurement-title" />
            <CapabilityList items={content.procurement.items} />
          </div>
          <div className="procurement-process" aria-labelledby="procurement-process-title">
            <div className="procurement-process__intro">
              <h3 id="procurement-process-title">{content.process.title}</h3>
              <p>{content.process.description}</p>
            </div>
            <ol>
              {content.process.steps.map((step) => (
                <li key={step.number}>
                  <p>{step.number}</p>
                  <h4>{step.title}</h4>
                  <span>{step.copy}</span>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section aria-labelledby="market-development-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="editorial-split editorial-split--reverse">
            <SectionHeading description={content.marketDevelopment.description} eyebrow={content.marketDevelopment.eyebrow} title={content.marketDevelopment.title} titleId="market-development-title" />
            <CapabilityList items={content.marketDevelopment.items} />
          </div>
        </Container>
      </section>

      <section className="internal-page__section">
        <Container>
          <div className="editorial-pair">
            <article aria-labelledby="partnerships-title">
              <SectionHeading description={content.partnerships.description} eyebrow={content.partnerships.eyebrow} title={content.partnerships.title} titleId="partnerships-title" />
              <CapabilityList items={content.partnerships.items} />
            </article>
            <article aria-labelledby="trading-title">
              <SectionHeading description={content.trading.description} eyebrow={content.trading.eyebrow} title={content.trading.title} titleId="trading-title" />
              <CapabilityList items={content.trading.items} />
            </article>
          </div>
        </Container>
      </section>

      <section aria-labelledby="solutions-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="editorial-split">
            <div>
              <SectionHeading description={content.solutions.description} eyebrow={content.solutions.eyebrow} title={content.solutions.title} titleId="solutions-title" />
              <CapabilityList items={content.solutions.items} />
            </div>
            <figure className="editorial-media">
              <PublicMediaFrame alt={content.solutions.mediaAlt} aspectRatio="3 / 2" fallbackLabel={content.solutions.mediaFallback} src={media.supporting} />
              <figcaption>{content.solutions.mediaCaption}</figcaption>
            </figure>
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
            <ButtonLink href={getRouteHref(currentLocale, "manufacturers")}>{content.cta.manufacturer}</ButtonLink>
            <ButtonLink href={getRouteHref(currentLocale, "latam")} variant="secondary">{content.cta.technology}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
