import { ButtonLink } from "@/components/design-system/button-link";
import { Container } from "@/components/design-system/container";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import { SectionHeading } from "@/components/design-system/section-heading";
import { EditorialHero } from "@/components/site/editorial-hero";
import { publicCompany } from "@/config/public-company";
import type { Locale } from "@/lib/i18n/config";
import type { ResponsiveMedia } from "@/lib/media";
import { getRouteHref } from "@/lib/site-navigation";

type TechnologyCategoryContent = {
  copy: string;
  eyebrow: string;
  id: string;
  items: string[];
  listLabel: string;
  mediaAlt: string;
  title: string;
};

export type TechnologyPageContent = {
  applicationsIntroduction: { description: string; eyebrow: string; title: string };
  categories: TechnologyCategoryContent[];
  cta: { contact: string; title: string; whatsapp: string };
  introduction: { description: string; eyebrow: string; mediaAlt: string; title: string };
};

type TechnologyPageProps = {
  content: TechnologyPageContent;
  currentLocale: Locale;
  media: { connected?: string; gas?: string; hero?: ResponsiveMedia; industrial?: string; water?: string };
};

function categoryMedia(media: TechnologyPageProps["media"], id: string) {
  return id === "water" ? media.water
    : id === "gas" ? media.gas
      : id === "industrial" ? media.industrial
        : media.connected;
}

export function TechnologyPage({ content, currentLocale, media }: TechnologyPageProps) {
  return (
    <main className="internal-page" id="main-content">
      <EditorialHero alt={content.introduction.mediaAlt} description={content.introduction.description} eyebrow={content.introduction.eyebrow} media={media.hero} title={content.introduction.title} titleId="technology-title" />

      <section aria-labelledby="technology-applications-title" className="technology-page__applications-intro">
        <Container>
          <SectionHeading className="technology-page__applications-heading" description={content.applicationsIntroduction.description} eyebrow={content.applicationsIntroduction.eyebrow} title={content.applicationsIntroduction.title} titleId="technology-applications-title" />
        </Container>
      </section>

      {content.categories.map((category, index) => (
        <section aria-labelledby={`${category.id}-title`} className={index % 2 ? "internal-page__section internal-page__section--subtle technology-page__section" : "internal-page__section technology-page__section"} id={category.id} key={category.id}>
          <Container>
            <article className={index % 2 ? "technology-feature technology-feature--reverse" : "technology-feature"}>
              <figure className="technology-feature__media">
                <PublicMediaFrame alt={category.mediaAlt} aspectRatio="16 / 10" fallbackLabel={category.mediaAlt} height={1000} loading="lazy" src={categoryMedia(media, category.id)} width={1600} />
              </figure>
              <div className="technology-feature__content">
                <SectionHeading className="technology-feature__heading" description={category.copy} eyebrow={category.eyebrow} title={category.title} titleId={`${category.id}-title`} />
                <div className="technology-feature__scope">
                  <p>{category.listLabel}</p>
                  <ul>
                    {category.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </article>
          </Container>
        </section>
      ))}

      <section className="internal-page__cta" aria-labelledby="technology-cta-title">
        <Container>
          <div>
            <p className="eyebrow">LAMBTECH LLC</p>
            <h2 id="technology-cta-title">{content.cta.title}</h2>
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
