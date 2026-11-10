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
type Principle = { copy: string; title: string };

export type AboutPageContent = {
  cta: { label: string; title: string };
  future: { description: string; eyebrow: string; title: string };
  identity: EditorialSection;
  introduction: { description: string; eyebrow: string; mediaAlt: string; mediaCaption: string; mediaFallback: string; title: string };
  model: { description: string; steps: ProcessStep[]; title: string };
  principles: { description: string; eyebrow: string; items: Principle[]; title: string };
};

type AboutPageProps = {
  content: AboutPageContent;
  currentLocale: Locale;
  media: { introduction?: string };
};

export function AboutPage({ content, currentLocale, media }: AboutPageProps) {
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

      <section aria-labelledby="about-identity-title" className="internal-page__section">
        <Container>
          <div className="editorial-split">
            <SectionHeading description={content.identity.description} eyebrow={content.identity.eyebrow} title={content.identity.title} titleId="about-identity-title" />
            <ul className="capability-list">{content.identity.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-model-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <CommercialProcess description={content.model.description} steps={content.model.steps} title={content.model.title} titleId="about-model-title" />
        </Container>
      </section>

      <section aria-labelledby="about-principles-title" className="internal-page__section">
        <Container>
          <SectionHeading description={content.principles.description} eyebrow={content.principles.eyebrow} title={content.principles.title} titleId="about-principles-title" />
          <div className="principles-list">
            {content.principles.items.map((principle, index) => (
              <article key={principle.title}>
                <p>{String(index + 1).padStart(2, "0")}</p>
                <h3>{principle.title}</h3>
                <span>{principle.copy}</span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-future-title" className="internal-page__section internal-page__section--subtle">
        <Container width="prose">
          <SectionHeading description={content.future.description} eyebrow={content.future.eyebrow} title={content.future.title} titleId="about-future-title" />
        </Container>
      </section>

      <section aria-labelledby="about-cta-title" className="internal-page__cta">
        <Container>
          <div>
            <p className="eyebrow">LAMBTECH LLC</p>
            <h2 id="about-cta-title">{content.cta.title}</h2>
          </div>
          <div className="page-actions">
            <ButtonLink href={getRouteHref(currentLocale, "contact")}>{content.cta.label}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
