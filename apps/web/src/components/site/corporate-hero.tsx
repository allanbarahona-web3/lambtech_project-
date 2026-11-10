import { Container } from "@/components/design-system/container";
import { ButtonLink } from "@/components/design-system/button-link";
import type { Locale } from "@/lib/i18n/config";
import { heroMedia } from "@/lib/media";
import { getRouteHref } from "@/lib/site-navigation";

type CorporateHeroProps = {
  currentLocale: Locale;
  labels: {
    eyebrow: string;
    headline: string;
    mediaAlt: string;
    primaryCta: string;
    secondaryCta: string;
  };
};

export function CorporateHero({ currentLocale, labels }: CorporateHeroProps) {
  return (
    <section aria-labelledby="hero-title" className="corporate-hero">
      <div className="corporate-hero__media">
        {/* The approved SVG is intentionally rendered without Next's SVG optimizer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={labels.mediaAlt}
          className="corporate-hero__media-image"
          decoding="async"
          fetchPriority="high"
          height={heroMedia.height}
          src={heroMedia.src}
          width={heroMedia.width}
        />
        <div aria-hidden="true" className="corporate-hero__overlay" />
        <Container className="corporate-hero__content">
          <div className="corporate-hero__copy">
            <p className="eyebrow">{labels.eyebrow}</p>
            <h1 id="hero-title">{labels.headline}</h1>
            <div className="corporate-hero__actions">
              <ButtonLink href={getRouteHref(currentLocale, "manufacturers")}>
                {labels.primaryCta}
              </ButtonLink>
              <ButtonLink href={getRouteHref(currentLocale, "latam")} variant="secondary">
                {labels.secondaryCta}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
