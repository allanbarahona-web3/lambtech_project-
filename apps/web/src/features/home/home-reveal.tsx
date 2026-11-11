"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HomeReveal({ children }: { children: ReactNode }) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.dataset.reveal = "pending";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      element.dataset.reveal = "visible";
      observer.disconnect();
    }, { rootMargin: "0px 0px -8%" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div className="home-reveal" ref={elementRef}>{children}</div>;
}
