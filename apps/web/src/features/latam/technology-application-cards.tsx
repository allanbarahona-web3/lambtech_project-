"use client";

import { useEffect, useRef, useState } from "react";
import { PublicMediaFrame } from "@/components/design-system/public-media-frame";

type TechnologyApplicationCard = {
  bullets: string[];
  description: string;
  href: string;
  id: string;
  mediaAlt: string;
  src?: string;
  title: string;
};

type TechnologyApplicationCardsProps = {
  backLabel: string;
  cards: TechnologyApplicationCard[];
  linkLabel: string;
  moreInfoLabel: string;
};

export function TechnologyApplicationCards({ backLabel, cards, linkLabel, moreInfoLabel }: TechnologyApplicationCardsProps) {
  return (
    <div className="technology-flip-cards">
      {cards.map((card) => (
        <TechnologyApplicationCard key={card.id} backLabel={backLabel} card={card} linkLabel={linkLabel} moreInfoLabel={moreInfoLabel} />
      ))}
    </div>
  );
}

function TechnologyApplicationCard({
  backLabel,
  card,
  linkLabel,
  moreInfoLabel,
}: {
  backLabel: string;
  card: TechnologyApplicationCard;
  linkLabel: string;
  moreInfoLabel: string;
}) {
  const [enhanced, setEnhanced] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const frontButtonRef = useRef<HTMLButtonElement>(null);
  const backHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusTargetRef = useRef<"back" | "front" | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnhanced(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const target = focusTargetRef.current;
    if (!enhanced || !target) return;

    const frame = window.requestAnimationFrame(() => {
      if (target === "back") backHeadingRef.current?.focus();
      else frontButtonRef.current?.focus();
      focusTargetRef.current = null;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [enhanced, flipped]);

  function revealBack() {
    focusTargetRef.current = "back";
    setFlipped(true);
  }

  function revealFront() {
    focusTargetRef.current = "front";
    setFlipped(false);
  }

  const frontInactive = enhanced && flipped;
  const backInactive = enhanced && !flipped;

  return (
    <article className="technology-flip-card" data-enhanced={enhanced ? "true" : "false"} data-flipped={flipped ? "true" : "false"}>
      <div className="technology-flip-card__scene">
        <section aria-hidden={frontInactive || undefined} className="technology-flip-card__face technology-flip-card__front" inert={frontInactive}>
          <PublicMediaFrame alt={card.mediaAlt} aspectRatio="16 / 10" className="technology-flip-card__image" fallbackLabel={card.mediaAlt} height={1000} loading="lazy" src={card.src} width={1600} />
          <div className="technology-flip-card__front-panel">
            <h3>{card.title}</h3>
            <button aria-controls={`${card.id}-details`} aria-expanded={flipped} className="button-link button-link--primary technology-flip-card__button" onClick={revealBack} ref={frontButtonRef} type="button">
              {moreInfoLabel}
            </button>
          </div>
        </section>

        <section aria-hidden={backInactive || undefined} className="technology-flip-card__face technology-flip-card__back" id={`${card.id}-details`} inert={backInactive}>
          <div className="technology-flip-card__back-content">
            <h3 ref={backHeadingRef} tabIndex={-1}>{card.title}</h3>
            <p>{card.description}</p>
            <ul>
              {card.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </div>
          <div className="technology-flip-card__back-actions">
            <a className="button-link button-link--secondary" href={card.href}>{linkLabel}</a>
            <button className="technology-flip-card__back-button" onClick={revealFront} type="button">{backLabel}</button>
          </div>
        </section>
      </div>
    </article>
  );
}
