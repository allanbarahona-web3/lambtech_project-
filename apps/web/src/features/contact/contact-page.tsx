import { ContactDetails } from "@/components/company/contact-details";
import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";
import { ContactForm, type ExtendedContactFormLabels } from "./contact-form";

type ContactPath = { copy: string; id: string; label: string; title: string };

export type ContactPageContent = {
  details: { address: string; email: string; fax: string; phone: string; whatsapp: string };
  form: ExtendedContactFormLabels;
  information: { description: string; eyebrow: string; title: string };
  introduction: { description: string; eyebrow: string; title: string };
  paths: ContactPath[];
  pathsHeading: { description: string; eyebrow: string; title: string };
};

export function ContactPage({ content }: { content: ContactPageContent }) {
  return (
    <main className="internal-page" id="main-content">
      <section className="internal-page__intro contact-page__intro">
        <Container>
          <SectionHeading description={content.introduction.description} eyebrow={content.introduction.eyebrow} level="h1" title={content.introduction.title} />
        </Container>
      </section>

      <section aria-labelledby="contact-routes-title" className="internal-page__section">
        <Container>
          <SectionHeading description={content.pathsHeading.description} eyebrow={content.pathsHeading.eyebrow} title={content.pathsHeading.title} titleId="contact-routes-title" />
          <div className="contact-paths contact-paths--page">
            {content.paths.map((path) => (
              <article id={`contact-${path.id}`} key={path.id}>
                <p className="eyebrow">{path.label}</p>
                <h3>{path.title}</h3>
                <p>{path.copy}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="contact-information-title" className="internal-page__section internal-page__section--subtle">
        <Container>
          <div className="contact-page__connection">
            <div>
              <SectionHeading description={content.information.description} eyebrow={content.information.eyebrow} title={content.information.title} titleId="contact-information-title" />
              <ContactDetails className="contact-details--page" labels={content.details} />
            </div>
            <ContactForm extendedLabels={content.form} labels={{ ...content.form, submit: content.form.checkFields }} />
          </div>
        </Container>
      </section>
    </main>
  );
}
