import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";

type ApproachStep = { copy: string; number: string; title: string };
type OurApproachProps = { steps: ApproachStep[]; title: string };

export function OurApproach({ steps, title }: OurApproachProps) {
  return (
    <section aria-labelledby="how-we-work-title" className="content-section home-approach" id="how-we-work">
      <Container>
        <SectionHeading title={title} titleId="how-we-work-title" />
        <ol className="approach-list">
          {steps.map((step) => (
            <li key={step.number}>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
