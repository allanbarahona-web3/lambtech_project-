import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import type { ResponsiveMedia } from "@/lib/media";

type ProcurementJourneySlide = { description: string; mediaAlt: string; title: string };

type ProcurementJourneyProps = {
  description: string;
  media: readonly ResponsiveMedia[];
  slides: ProcurementJourneySlide[];
  title: string;
};

export function ProcurementJourney({ description, media, slides, title }: ProcurementJourneyProps) {
  return (
    <section aria-labelledby="procurement-journey-title" className="procurement-journey">
      <div className="procurement-journey__header">
        <h3 id="procurement-journey-title">{title}</h3>
        <p>{description}</p>
      </div>
      <div className="procurement-journey__track">
        {slides.map((slide, index) => {
          const image = media[index];

          return (
            <article className="procurement-journey__slide" key={slide.title}>
              <PublicMediaFrame alt={slide.mediaAlt} aspectRatio="3 / 2" className="procurement-journey__media" fallbackLabel={slide.mediaAlt} height={1200} loading="lazy" mobileSrc={image?.mobile} src={image?.desktop} width={1800} />
              <div className="procurement-journey__copy">
                <h4>{slide.title}</h4>
                <p>{slide.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
