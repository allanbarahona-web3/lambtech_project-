"use client";

import { useEffect, useState } from "react";

type ChannelItem = {
  description: string;
  id: string;
  title: string;
};

type ManufacturerChannelAccordionProps = {
  items: ChannelItem[];
};

export function ManufacturerChannelAccordion({ items }: ManufacturerChannelAccordionProps) {
  const [enhanced, setEnhanced] = useState(false);
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const timer = window.setTimeout(() => setEnhanced(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="manufacturer-channel-accordion" data-enhanced={enhanced ? "true" : "false"}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const panelId = `manufacturer-channel-${item.id}`;

        return (
          <article className="manufacturer-channel-accordion__item" data-open={isOpen ? "true" : "false"} key={item.id}>
            <h3>
              <button aria-controls={panelId} aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : item.id)} type="button">
                <span>{item.title}</span>
                <span aria-hidden="true" className="manufacturer-channel-accordion__marker" />
              </button>
            </h3>
            <div aria-hidden={enhanced && !isOpen ? true : undefined} className="manufacturer-channel-accordion__panel" id={panelId}>
              <div><p>{item.description}</p></div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
