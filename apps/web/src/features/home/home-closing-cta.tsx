import { ButtonLink } from "@/components/design-system/button-link";
import { Container } from "@/components/design-system/container";
import type { Locale } from "@/lib/i18n/config";
import { getRouteHref } from "@/lib/site-navigation";

type HomeClosingCtaProps = {
  currentLocale: Locale;
  description: string;
  primaryAction: string;
  secondaryAction: string;
  title: string;
  whatsappUrl?: string;
};

export function HomeClosingCta({ currentLocale, description, primaryAction, secondaryAction, title, whatsappUrl }: HomeClosingCtaProps) {
  return (
    <section aria-labelledby="home-closing-title" className="home-closing">
      <Container>
        <div>
          <h2 id="home-closing-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="home-closing__actions">
          <ButtonLink href={getRouteHref(currentLocale, "contact")}>{primaryAction}</ButtonLink>
          {whatsappUrl ? <ButtonLink href={whatsappUrl} rel="noopener noreferrer" target="_blank" variant="secondary">{secondaryAction}</ButtonLink> : null}
        </div>
      </Container>
    </section>
  );
}
