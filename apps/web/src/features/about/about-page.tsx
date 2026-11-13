import { ButtonLink } from "@/components/design-system/button-link";
import { CommercialProcess } from "@/components/design-system/commercial-process";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import type { Locale } from "@/lib/i18n/config";
import type { ResponsiveMedia } from "@/lib/media";
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
  bridge: { items: string[] };
  cta: { label: string; title: string; whatsapp: string };
  future: { description: string; eyebrow: string; title: string };
  identity: EditorialSection & { founderAlt: string; founderRole: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
  model: { description: string; steps: ProcessStep[]; title: string };
  principles: { description: string; eyebrow: string; items: Principle[]; title: string };
};

type AboutPageProps = {
  content: AboutPageContent;
  currentLocale: Locale;
  media: { founder?: string; introduction?: ResponsiveMedia };
};

export function AboutPage({ content, currentLocale, media }: AboutPageProps) {
  return (
    <main className="internal-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.introduction} title={content.introduction.title} titleId="about-title" />

      <section aria-label="LAMBTECH" className="about-page__bridge">
        <Container>
          <ul>{content.bridge.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </Container>
      </section>

      <section aria-labelledby="about-identity-title" className="internal-page__section about-page__identity">
        <Container>
          <div className="about-page__identity-layout">
            <SectionHeading className="about-page__identity-heading" description={content.identity.description} eyebrow={content.identity.eyebrow} title={content.identity.title} titleId="about-identity-title" />
            <figure className="about-page__founder-portrait">
              <PublicMediaFrame alt={content.identity.founderAlt} aspectRatio="4 / 5" fallbackLabel={content.identity.founderAlt} height={1500} loading="lazy" src={media.founder} width={1200} />
              <figcaption><span className="about-page__founder-role">{content.identity.founderRole}</span><span className="about-page__founder-company">LAMBTECH LLC</span></figcaption>
            </figure>
          </div>
          <ul className="about-page__identity-capabilities">{content.identity.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </Container>
      </section>

      <section aria-labelledby="about-model-title" className="internal-page__section internal-page__section--subtle about-page__model-section">
        <Container>
          <CommercialProcess className="about-page__model" description={content.model.description} showNumbers={false} steps={content.model.steps} title={content.model.title} titleId="about-model-title" />
        </Container>
      </section>

      <section aria-labelledby="about-principles-title" className="internal-page__section about-page__principles-section">
        <Container>
          <SectionHeading className="about-page__principles-heading" description={content.principles.description} eyebrow={content.principles.eyebrow} title={content.principles.title} titleId="about-principles-title" />
          <div className="about-page__principles-list">
            {content.principles.items.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <span>{principle.copy}</span>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="about-future-title" className="internal-page__section internal-page__section--subtle about-page__future">
        <Container>
          <SectionHeading className="about-page__future-heading" description={content.future.description} eyebrow={content.future.eyebrow} title={content.future.title} titleId="about-future-title" />
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
            <ButtonLink href={publicCompany.whatsappUrl} rel="noopener noreferrer" target="_blank" variant="secondary">{content.cta.whatsapp}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
