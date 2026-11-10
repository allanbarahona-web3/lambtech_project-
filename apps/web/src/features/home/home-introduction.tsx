import { Container } from "@/components/design-system/container";

type HomeIntroductionProps = { copy: string; label: string };

export function HomeIntroduction({ copy, label }: HomeIntroductionProps) {
  return (
    <section aria-label={label} className="home-introduction">
      <Container>
        <p>{copy}</p>
      </Container>
    </section>
  );
}
