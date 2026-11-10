import { SectionHeading } from "@/components/design-system/section-heading";
import { Container } from "@/components/design-system/container";

type Service = { copy: string; number: string; title: string };
type WhatWeDoProps = { description: string; eyebrow: string; items: Service[]; title: string };

export function WhatWeDo({ description, eyebrow, items, title }: WhatWeDoProps) {
  return (
    <section aria-labelledby="what-we-do-title" className="content-section" id="what-we-do">
      <Container>
        <SectionHeading description={description} eyebrow={eyebrow} title={title} titleId="what-we-do-title" />
        <ol className="service-list">
          {items.map((item) => (
            <li key={item.number}>
              <p className="service-list__number">{item.number}</p>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
