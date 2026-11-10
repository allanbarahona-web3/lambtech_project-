import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";

type ApproachStep = { copy: string; number: string; title: string };
type OurApproachProps = { closing: string; description: string; eyebrow: string; steps: ApproachStep[]; title: string };

export function OurApproach({ closing, description, eyebrow, steps, title }: OurApproachProps) {
  return (
    <section aria-labelledby="about-title" className="content-section" id="about">
      <Container>
        <SectionHeading description={description} eyebrow={eyebrow} title={title} titleId="about-title" />
        <ol className="approach-list">
          {steps.map((step) => (
            <li key={step.number}>
              <p className="approach-list__number">{step.number}</p>
              <div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="approach-list__closing">{closing}</p>
      </Container>
    </section>
  );
}
