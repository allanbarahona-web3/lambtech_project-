import { Container } from "@/components/design-system/container";
import type { Locale } from "@/lib/i18n/config";
import type { LegalContent } from "@/lib/legal";

type LegalPageProps = {
  content: LegalContent;
  locale: Locale;
};

export function LegalPage({ content, locale }: LegalPageProps) {
  return (
    <main id="main-content">
      <section className="legal-page">
        <Container width="prose">
          <article className="legal-page__content">
            <header className="legal-page__header">
              <p className="section-heading__eyebrow">{content.eyebrow}</p>
              <h1>{content.title}</h1>
              <p className="legal-page__description">{content.description}</p>
              <p className="legal-page__updated">{content.lastUpdatedLabel}: {content.lastUpdated}</p>
            </header>
            <div className="legal-page__sections">
              {content.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.links?.length ? (
                    <p className="legal-page__links">
                      {section.links.map((link) => <a href={`/${locale}${link.href}`} key={link.href}>{link.label}</a>)}
                    </p>
                  ) : null}
                </section>
              ))}
            </div>
          </article>
        </Container>
      </section>
    </main>
  );
}
