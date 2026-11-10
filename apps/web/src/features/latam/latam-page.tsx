import { ButtonLink } from "@/components/design-system/button-link";
import { CommercialProcess } from "@/components/design-system/commercial-process";
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

type TechnologyContext = { copy: string; id: string; title: string };

export type LatamPageContent = {
  collaboration: EditorialSection & { mediaAlt: string; mediaCaption: string; mediaFallback: string };
  cta: { label: string; title: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; mediaCaption: string; mediaFallback: string; title: string };
  procurement: EditorialSection & { linkLabel: string };
  process: { description: string; steps: ProcessStep[]; title: string };
  requirements: EditorialSection;
  technology: { description: string; eyebrow: string; items: TechnologyContext[]; linkLabel: string; title: string };
};

type LatamPageProps = {
  content: LatamPageContent;
  currentLocale: Locale;
  media: { introduction?: string; supporting?: string };
};

function CapabilityList({ items }: { items: string[] }) {
  return <ul className="capability-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export function LatamPage({ content, currentLocale, media }: LatamPageProps) {
  const technologyHref = getRouteHref(currentLocale, "technology");

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

      <section aria-labelledby="latam-requirements-title" className="internal-page__section">
        <Container>
          <div className="editorial-split">
            <SectionHeading description={content.requirements.description} eyebrow={content.requirements.eyebrow} title={content.requirements.title} titleId="latam-requirements-title" />
            <CapabilityList items={content.requirements.items} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="latam-procurement-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="editorial-split editorial-split--reverse">
            <SectionHeading description={content.procurement.description} eyebrow={content.procurement.eyebrow} title={content.procurement.title} titleId="latam-procurement-title" />
            <div>
              <CapabilityList items={content.procurement.items} />
              <ButtonLink className="editorial-inline-action" href={getRouteHref(currentLocale, "what-we-do")} variant="secondary">
                {content.procurement.linkLabel}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="latam-technology-title" className="internal-page__section">
        <Container>
          <SectionHeading description={content.technology.description} eyebrow={content.technology.eyebrow} title={content.technology.title} titleId="latam-technology-title" />
          <div className="technology-context-list">
            {content.technology.items.map((item) => (
              <article key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <a href={`${technologyHref}#${item.id}`}>{content.technology.linkLabel}</a>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="latam-collaboration-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="editorial-split">
            <div>
              <SectionHeading description={content.collaboration.description} eyebrow={content.collaboration.eyebrow} title={content.collaboration.title} titleId="latam-collaboration-title" />
              <CapabilityList items={content.collaboration.items} />
            </div>
            <figure className="editorial-media">
              <PublicMediaFrame alt={content.collaboration.mediaAlt} aspectRatio="3 / 2" fallbackLabel={content.collaboration.mediaFallback} src={media.supporting} />
              <figcaption>{content.collaboration.mediaCaption}</figcaption>
            </figure>
          </div>
          <CommercialProcess description={content.process.description} steps={content.process.steps} title={content.process.title} titleId="latam-process-title" />
        </Container>
      </section>

      <section aria-labelledby="latam-cta-title" className="internal-page__cta">
        <Container>
          <div>
            <p className="eyebrow">LAMBTECH LLC</p>
            <h2 id="latam-cta-title">{content.cta.title}</h2>
          </div>
          <div className="page-actions">
            <ButtonLink data-inquiry-type="technology-sourcing" href={getRouteHref(currentLocale, "contact")}>{content.cta.label}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
