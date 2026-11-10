import type { ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4";

type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: string;
  level?: HeadingLevel;
  className?: string;
  titleId?: string;
};

export function SectionHeading({
  title,
  description,
  eyebrow,
  level = "h2",
  className,
  titleId,
}: SectionHeadingProps) {
  const Heading = level;
  const classes = ["section-heading", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading className="section-heading__title" id={titleId}>
        {title}
      </Heading>
      {description ? (
        <p className="section-heading__description">{description}</p>
      ) : null}
    </div>
  );
}
