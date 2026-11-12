import { ButtonLink } from "@/components/design-system/button-link";
import { CommercialProcess } from "@/components/design-system/commercial-process";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import { TechnologyApplicationCards } from "@/features/latam/technology-application-cards";
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

type TechnologyContext = { bullets: string[]; description: string; id: string; mediaAlt: string; title: string };

export type LatamPageContent = {
  collaboration: EditorialSection & { mediaAlt: string };
  cta: { label: string; title: string; whatsapp: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
  procurement: EditorialSection & { linkLabel: string };
  process: { description: string; steps: ProcessStep[]; title: string };
  requirements: EditorialSection;
  technology: { backLabel: string; description: string; eyebrow: string; items: TechnologyContext[]; linkLabel: string; moreInfoLabel: string; title: string };
};

type LatamPageProps = {
  content: LatamPageContent;
  currentLocale: Locale;
  media: { connected?: string; gas?: string; industrial?: string; introduction?: ResponsiveMedia; supporting?: ResponsiveMedia; water?: string };
};

function CapabilityList({ items }: { items: string[] }) {
  return <ul className="capability-list">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function technologyMedia(media: LatamPageProps["media"], id: TechnologyContext["id"]) {
  return id === "water" ? media.water
    : id === "gas" ? media.gas
      : id === "industrial" ? media.industrial
        : media.connected;
}

export function LatamPage({ content, currentLocale, media }: LatamPageProps) {
  const technologyHref = getRouteHref(currentLocale, "technology");

  return (
    <main className="internal-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.introduction} title={content.introduction.title} titleId="latam-title" />

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
          <TechnologyApplicationCards
            backLabel={content.technology.backLabel}
            cards={content.technology.items.map((item) => ({ ...item, href: `${technologyHref}#${item.id}`, src: technologyMedia(media, item.id) }))}
            linkLabel={content.technology.linkLabel}
            moreInfoLabel={content.technology.moreInfoLabel}
          />
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
              <PublicMediaFrame alt={content.collaboration.mediaAlt} aspectRatio="3 / 2" fallbackLabel={content.collaboration.mediaAlt} height={1200} loading="lazy" mobileSrc={media.supporting?.mobile} src={media.supporting?.desktop} width={1800} />
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
            <ButtonLink href={publicCompany.whatsappUrl} rel="noopener noreferrer" target="_blank" variant="secondary">{content.cta.whatsapp}</ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
