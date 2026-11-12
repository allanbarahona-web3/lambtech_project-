"use client";

import { useEffect, useRef, useState } from "react";

type ServiceScope = { description: string; title: string };

type ServiceScopesProps = { items: ServiceScope[] };

export function ServiceScopes({ items }: ServiceScopesProps) {
  const elementRef = useRef<HTMLUListElement>(null);
  const hasPlayedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const element = elementRef.current;
    if (!element) return;

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || hasPlayedRef.current) return;

      hasPlayedRef.current = true;
      let index = 0;
      const advance = () => {
        setActiveIndex(index);
        index += 1;

        timeoutId = setTimeout(() => {
          if (index < items.length) advance();
          else setActiveIndex(null);
        }, 2200);
      };

      advance();
      observer.disconnect();
    }, { rootMargin: "0px 0px -16%" });

    observer.observe(element);
    return () => {
      observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [items.length]);

  return (
    <ul className="service-scopes" ref={elementRef}>
      {items.map((item, index) => (
        <li data-active={activeIndex === index ? "true" : undefined} key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </li>
      ))}
    </ul>
  );
}
