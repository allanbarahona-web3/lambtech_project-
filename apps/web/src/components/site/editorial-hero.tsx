import { Container } from "@/components/design-system/container";
import type { ResponsiveMedia } from "@/lib/media";

type EditorialHeroProps = {
  alt: string;
  description: string;
  eyebrow: string;
  media: ResponsiveMedia | undefined;
  title: string;
  titleId: string;
};

export function EditorialHero({ alt, description, eyebrow, media, title, titleId }: EditorialHeroProps) {
  return (
    <section aria-labelledby={titleId} className="corporate-hero editorial-hero">
      <div className="corporate-hero__media">
        <picture className="corporate-hero__media-picture">
          {media?.mobile ? <source media="(max-width: 39.99rem)" srcSet={media.mobile} type="image/webp" /> : null}
          {/* The native picture element selects only the source matching the viewport. */}
          <img alt={alt} className="corporate-hero__media-image" decoding="async" fetchPriority="high" height={1080} src={media?.desktop ?? media?.mobile} width={2520} />
        </picture>
        <div aria-hidden="true" className="corporate-hero__overlay" />
        <Container className="corporate-hero__content">
          <div className="corporate-hero__copy">
            <p className="eyebrow">{eyebrow}</p>
            <h1 id={titleId}>{title}</h1>
            <p className="editorial-hero__description">{description}</p>
          </div>
        </Container>
      </div>
    </section>
  );
}
