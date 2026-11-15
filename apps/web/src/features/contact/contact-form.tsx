"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Locale } from "@/lib/i18n/config";
import { publicApiBaseUrl } from "@/lib/public-api";

export type ContactFormLabels = {
  company: string;
  country: string;
  email: string;
  errors: { email: string; message: string; name: string };
  honeypot: string;
  inactive: string;
  message: string;
  name: string;
  notice: string;
  required: string;
  submit: string;
  title: string;
  validationSummary: string;
};

export type ExtendedContactFormLabels = Omit<ContactFormLabels, "submit"> & {
  checkFields: string;
  inquiryType: string;
  inquiryTypes: { customer: string; general: string; manufacturer: string };
  lastName: string;
  marketOrProject: string;
  phone: string;
  privacyAcceptance: string;
  privacyLink: string;
  sending: string;
  submitError: string;
  confirmation: {
    close: string;
    closeLabel: string;
    message: string;
    title: string;
  };
  technologyContext: string;
  website: string;
};

type ContactFormProps = {
  extendedLabels: ExtendedContactFormLabels;
  labels: ContactFormLabels;
  locale: Locale;
  privacyNoticeHref: string;
};

const interestByInquiryType = {
  customer: "TECHNOLOGY_SOURCING",
  general: "GENERAL_INQUIRY",
  manufacturer: "MANUFACTURER_INQUIRY",
} as const;

function optionalValue(values: FormData, name: string): string | undefined {
  const value = String(values.get(name) ?? "").trim();
  return value || undefined;
}

function normalizedCompanyWebsite(values: FormData): string | undefined {
  const value = optionalValue(values, "company-website");
  if (!value) return undefined;

  return /^https?:\/\//iu.test(value) ? value : `https://${value}`;
}

export function ContactForm({ extendedLabels, labels, locale, privacyNoticeHref }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (confirmationOpen) {
      confirmationDialogRef.current?.showModal();
      closeButtonRef.current?.focus();
    }

    return () => confirmationDialogRef.current?.close();
  }, [confirmationOpen]);

  useEffect(() => {
    if (!confirmationOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [confirmationOpen]);

  function closeConfirmation() {
    confirmationDialogRef.current?.close();
    window.location.assign(`/${locale}`);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = formRef.current;
    if (!form || submitting) return;

    const values = new FormData(form);
    const nextErrors: Record<string, string> = {};
    const firstName = optionalValue(values, "name");
    const email = optionalValue(values, "email");
    const message = optionalValue(values, "message");
    const privacyAccepted = values.get("privacyAccepted") === "on";

    if (!firstName) nextErrors.name = labels.errors.name;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = labels.errors.email;
    if (!message || message.length < 10) nextErrors.message = labels.errors.message;
    if (!privacyAccepted) nextErrors.privacyAccepted = labels.validationSummary;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setStatus(labels.validationSummary);
      return;
    }
    if (!publicApiBaseUrl) {
      setStatus(labels.inactive);
      return;
    }

    const inquiryType = String(values.get("inquiry-type") ?? "general") as keyof typeof interestByInquiryType;
    const fullName = [firstName, optionalValue(values, "last-name")].filter(Boolean).join(" ");
    const payload = {
      fullName,
      email,
      phone: optionalValue(values, "phone"),
      country: optionalValue(values, "country"),
      company: optionalValue(values, "company"),
      companyWebsite: normalizedCompanyWebsite(values),
      technologyContext: optionalValue(values, "technology-context"),
      marketOrProject: optionalValue(values, "market-or-project"),
      interest: interestByInquiryType[inquiryType] ?? interestByInquiryType.general,
      message,
      locale: locale.toUpperCase(),
      privacyAccepted: true,
      website: optionalValue(values, "website"),
    };

    setSubmitting(true);
    setStatus(extendedLabels.sending);
    try {
      const response = await fetch(`${publicApiBaseUrl}/public/leads`, {
        method: "POST",
        credentials: "omit",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("LeadSubmissionFailed");

      form.reset();
      setErrors({});
      setStatus("");
      setConfirmationOpen(true);
    } catch {
      setStatus(extendedLabels.submitError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form aria-describedby="contact-form-notice contact-form-status" className="contact-form" noValidate onSubmit={submit} ref={formRef}>
      <p className="contact-form__title">{labels.title}</p>
      <p className="contact-form__notice" id="contact-form-notice">{labels.notice}</p>
      <div className="contact-form__grid">
        <SelectField label={extendedLabels.inquiryType} name="inquiry-type" options={extendedLabels.inquiryTypes} />
        <Field error={errors.name} label={labels.name} name="name" requiredLabel={labels.required} required />
        <Field label={extendedLabels.lastName} name="last-name" />
        <Field label={labels.company} name="company" />
        <Field error={errors.email} label={labels.email} name="email" requiredLabel={labels.required} required type="email" />
        <Field label={extendedLabels.phone} name="phone" type="tel" />
        <Field label={labels.country} name="country" />
        <Field label={extendedLabels.website} name="company-website" type="url" />
        <Field label={extendedLabels.technologyContext} name="technology-context" textarea />
        <Field label={extendedLabels.marketOrProject} name="market-or-project" textarea />
        <Field error={errors.message} label={labels.message} name="message" requiredLabel={labels.required} required textarea />
        <div className="contact-form__honeypot" hidden>
          <input aria-label={labels.honeypot} autoComplete="off" id="contact-website" name="website" tabIndex={-1} type="text" />
        </div>
        <div className="contact-form__consent contact-form__field--full">
          <label>
            <input aria-describedby={errors.privacyAccepted ? "contact-privacy-error" : undefined} aria-invalid={Boolean(errors.privacyAccepted)} name="privacyAccepted" type="checkbox" />
            {" "}{extendedLabels.privacyAcceptance} <a href={privacyNoticeHref} rel="noreferrer" target="_blank">{extendedLabels.privacyLink}</a>.
          </label>
          {errors.privacyAccepted ? <p className="contact-form__error" id="contact-privacy-error">{errors.privacyAccepted}</p> : null}
        </div>
      </div>
      <div className="contact-form__actions">
        <button className="button-link button-link--primary" disabled={submitting} type="submit">{submitting ? extendedLabels.sending : labels.submit}</button>
        <p aria-live="polite" id="contact-form-status" role="status">{status}</p>
      </div>
      {confirmationOpen && mounted ? createPortal(
        <dialog aria-describedby="contact-confirmation-description" aria-labelledby="contact-confirmation-title" className="contact-confirmation" onCancel={(event) => { event.preventDefault(); closeConfirmation(); }} ref={confirmationDialogRef}>
          <div className="contact-confirmation__panel">
            <button aria-label={extendedLabels.confirmation.closeLabel} className="contact-confirmation__close" onClick={closeConfirmation} type="button">
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
            </button>
            <span aria-hidden="true" className="contact-confirmation__success-icon">
              <svg fill="none" viewBox="0 0 24 24">
                <path d="m7.5 12 3 3 6-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </span>
            <h2 id="contact-confirmation-title">{extendedLabels.confirmation.title}</h2>
            <p id="contact-confirmation-description">{extendedLabels.confirmation.message}</p>
            <button className="button-link button-link--primary" onClick={closeConfirmation} ref={closeButtonRef} type="button">
              {extendedLabels.confirmation.close}
            </button>
          </div>
        </dialog>,
        document.body,
      ) : null}
    </form>
  );
}

type FieldProps = {
  error?: string;
  label: string;
  name: string;
  required?: boolean;
  requiredLabel?: string;
  textarea?: boolean;
  type?: "email" | "tel" | "text" | "url";
};

function Field({ error, label, name, required, requiredLabel, textarea, type = "text" }: FieldProps) {
  const id = `contact-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className={textarea ? "contact-form__field contact-form__field--full" : "contact-form__field"}>
      <label htmlFor={id}>{label}{required ? <span aria-label={requiredLabel}> *</span> : null}</label>
      {textarea ? (
        <textarea aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} id={id} name={name} rows={5} />
      ) : (
        <input aria-describedby={error ? errorId : undefined} aria-invalid={Boolean(error)} id={id} name={name} type={type} />
      )}
      {error ? <p className="contact-form__error" id={errorId}>{error}</p> : null}
    </div>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: ExtendedContactFormLabels["inquiryTypes"] }) {
  const id = `contact-${name}`;

  return (
    <div className="contact-form__field">
      <label htmlFor={id}>{label}</label>
      <select defaultValue="general" id={id} name={name}>
        <option value="manufacturer">{options.manufacturer}</option>
        <option value="customer">{options.customer}</option>
        <option value="general">{options.general}</option>
      </select>
    </div>
  );
}
