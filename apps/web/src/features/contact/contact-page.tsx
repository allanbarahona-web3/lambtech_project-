import { ContactDetails } from "@/components/company/contact-details";
import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";
import { publicMedia } from "@/lib/media";
import { ContactForm, type ExtendedContactFormLabels } from "./contact-form";

type ContactPath = { copy: string; id: string; label: string; title: string };

export type ContactPageContent = {
  details: { address: string; email: string; fax: string; phone: string; whatsapp: string };
  form: ExtendedContactFormLabels;
  information: { description: string; eyebrow: string; title: string };
  introduction: { description: string; eyebrow: string; portraitAlt: string; title: string };
  paths: ContactPath[];
  pathsHeading: { description: string; eyebrow: string; title: string };
};

export function ContactPage({ content }: { content: ContactPageContent }) {
  return (
    <main className="internal-page" id="main-content">
      <section className="contact-page__hero">
        <Container>
          <div className="contact-page__hero-layout">
            <SectionHeading description={content.introduction.description} eyebrow={content.introduction.eyebrow} level="h1" title={content.introduction.title} />
            {publicMedia.contactPortrait ? (
              <div className="contact-page__portrait">
                {/* The portrait is a public CDN asset intentionally rendered directly. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={content.introduction.portraitAlt} src={publicMedia.contactPortrait} />
              </div>
            ) : null}
          </div>
        </Container>
      </section>

      <section aria-labelledby="contact-routes-title" className="contact-page__inquiry">
        <Container>
          <div className="contact-page__workspace">
            <aside className="contact-page__guide">
              <SectionHeading description={content.pathsHeading.description} eyebrow={content.pathsHeading.eyebrow} title={content.pathsHeading.title} titleId="contact-routes-title" />
              <div className="contact-page__routes">
                {content.paths.map((path) => (
                  <article id={`contact-${path.id}`} key={path.id}>
                    <p className="eyebrow">{path.label}</p>
                    <h3>{path.title}</h3>
                    <p>{path.copy}</p>
                  </article>
                ))}
              </div>
              <div className="contact-page__details">
                <SectionHeading description={content.information.description} eyebrow={content.information.eyebrow} title={content.information.title} titleId="contact-information-title" />
                <ContactDetails className="contact-details--page" labels={content.details} />
              </div>
            </aside>
            <div className="contact-page__form-card">
              <ContactForm extendedLabels={content.form} labels={{ ...content.form, submit: content.form.checkFields }} />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
