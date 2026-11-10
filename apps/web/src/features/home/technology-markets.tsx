import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";

type TechnologyArea = { copy: string; title: string };
type TechnologyMarketsProps = { areas: TechnologyArea[]; closing: string; description: string; eyebrow: string; title: string };

export function TechnologyMarkets({ areas, closing, description, eyebrow, title }: TechnologyMarketsProps) {
  return (
    <section aria-labelledby="technology-title" className="content-section content-section--subtle" id="technology">
      <Container>
        <SectionHeading description={description} eyebrow={eyebrow} title={title} titleId="technology-title" />
        <ul className="technology-list">
          {areas.map((area) => (
            <li key={area.title}>
              <h3>{area.title}</h3>
              <p>{area.copy}</p>
            </li>
          ))}
        </ul>
        <p className="technology-list__closing">{closing}</p>
      </Container>
    </section>
  );
}
