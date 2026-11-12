import { SectionHeading } from "@/components/design-system/section-heading";
import { Container } from "@/components/design-system/container";
import type { Locale } from "@/lib/i18n/config";
import { getRouteHref, type CorporateRouteId } from "@/lib/site-navigation";

type Service = { description: string; linkLabel: string; number: string; scope: string[]; title: string };
type WhatWeDoProps = { currentLocale: Locale; description: string; eyebrow: string; items: Service[]; title: string };

const serviceRoutes: readonly CorporateRouteId[] = ["latam", "manufacturers", "technology"];

export function WhatWeDo({ currentLocale, description, eyebrow, items, title }: WhatWeDoProps) {
  return (
    <section aria-labelledby="what-we-do-title" className="content-section home-what-we-do" id="what-we-do">
      <Container>
        <SectionHeading description={description} eyebrow={eyebrow} title={title} titleId="what-we-do-title" />
        <ol className="service-list">
          {items.map((item, index) => (
            <li key={item.number}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <ul className="service-list__scope">
                {item.scope.map((scopeItem) => <li key={scopeItem}>{scopeItem}</li>)}
              </ul>
              <a className="home-text-link" href={getRouteHref(currentLocale, serviceRoutes[index] ?? "what-we-do")}>{item.linkLabel}</a>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
