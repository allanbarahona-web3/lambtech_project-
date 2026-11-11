import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";
import type { Locale } from "@/lib/i18n/config";
import { getRouteHref } from "@/lib/site-navigation";

type TechnologyArea = { copy: string; mediaAlt: string; title: string };
type TechnologyMarketsProps = {
  areas: TechnologyArea[];
  currentLocale: Locale;
  eyebrow: string;
  images: readonly (string | undefined)[];
  linkLabel: string;
  title: string;
};

export function TechnologyMarkets({ areas, currentLocale, eyebrow, images, linkLabel, title }: TechnologyMarketsProps) {
  return (
    <section aria-labelledby="technology-title" className="content-section content-section--subtle home-technology" id="technology">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} titleId="technology-title" />
        <ul className="technology-list">
          {areas.map((area, index) => (
            <li key={area.title}>
              {images[index] ? (
                // Public CDN images remain direct until the remote host is configured for Next optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={area.mediaAlt} className="technology-list__image" height="1000" loading="lazy" src={images[index]} width="1600" />
              ) : null}
              <div className="technology-list__copy">
                <h3>{area.title}</h3>
                <p>{area.copy}</p>
              </div>
            </li>
          ))}
        </ul>
        <a className="home-text-link home-text-link--section" href={getRouteHref(currentLocale, "technology")}>{linkLabel}</a>
      </Container>
    </section>
  );
}
