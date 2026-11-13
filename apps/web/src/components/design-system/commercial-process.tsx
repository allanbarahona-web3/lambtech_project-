type CommercialProcessStep = {
  copy: string;
  number: string;
  title: string;
};

type CommercialProcessProps = {
  className?: string;
  description: string;
  showNumbers?: boolean;
  steps: CommercialProcessStep[];
  title: string;
  titleId: string;
};

export function CommercialProcess({ className, description, showNumbers = true, steps, title, titleId }: CommercialProcessProps) {
  return (
    <div className={["commercial-process", className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
      <div className="commercial-process__intro">
        <h3 id={titleId}>{title}</h3>
        <p>{description}</p>
      </div>
      <ol>
        {steps.map((step) => (
          <li key={step.number}>
            {showNumbers ? <p>{step.number}</p> : null}
            <h4>{step.title}</h4>
            <span>{step.copy}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
