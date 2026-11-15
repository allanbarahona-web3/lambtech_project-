import {
  LeadInterest,
  LeadLocale,
  LeadSourceSite,
} from "@prisma/client";
import type { TransactionalEmail } from "./email-delivery.service";
import type { LeadNotificationRecord } from "./lead-notifications.service";

export type LeadEmailTemplate = Pick<
  TransactionalEmail,
  "subject" | "text" | "html" | "attachments"
>;

export type EmailLocale = "en" | "es";
type LocalizedText = Record<EmailLocale, string>;
type SiteEmailCopy = {
  descriptor: string;
  internalHeading: string;
  internalSubject: string;
  name: string;
  relationship: string;
  security: string;
  team: string;
  visitorSubject: string;
};

const INTEREST_LABELS = {
  [LeadInterest.MANUFACTURER_INQUIRY]: {
    en: "Manufacturer inquiry",
    es: "Consulta de fabricante",
  },
  [LeadInterest.TECHNOLOGY_SOURCING]: {
    en: "Technology sourcing",
    es: "Búsqueda de tecnología",
  },
  [LeadInterest.GENERAL_INQUIRY]: {
    en: "General inquiry",
    es: "Consulta general",
  },
} satisfies Record<LeadInterest, LocalizedText>;

const SOURCE_SITE_LABELS = {
  [LeadSourceSite.LAMBTECH]: { en: "LAMBTECH", es: "LAMBTECH" },
} satisfies Record<LeadSourceSite, LocalizedText>;

const BRAND = {
  company: "LAMBTECH LLC",
  phone: "+506 8404-7638",
  address: "30 N Gould St #69234, Sheridan, WY 82801, USA",
  costaRicaAddress: "Oficentro Momentum Pinares, Sánchez, Curridabat, San José 11803, Costa Rica",
} as const;

// Hosted in the dedicated public LAMBTECH Space so recipients can display the
// mark without an attachment or an inherited Barmentech asset.
const LAMBTECH_LOGO_URL = "https://lambtech.sfo3.cdn.digitaloceanspaces.com/LogoColor.png";

const SITE_EMAIL_COPY = {
  [LeadSourceSite.LAMBTECH]: {
    en: {
      name: "LAMBTECH",
      descriptor: "International technology and market development",
      internalHeading: "New LAMBTECH inquiry",
      internalSubject: "New inquiry",
      visitorSubject: "We received your inquiry | LAMBTECH",
      security:
        "For your security, do not email passwords, payment information, identity documents, government identification numbers, or other sensitive records. We will provide a secure channel when appropriate.",
      relationship:
        "Submitting this inquiry does not automatically create a professional or contractual relationship. Any service remains subject to separate review, scope, and confirmation.",
      team: "LAMBTECH Team",
    },
    es: {
      name: "LAMBTECH",
      descriptor: "Tecnología internacional y desarrollo de mercados",
      internalHeading: "Nueva consulta de LAMBTECH",
      internalSubject: "Nueva solicitud",
      visitorSubject: "Recibimos tu solicitud | LAMBTECH",
      security:
        "Por tu seguridad, no envíes contraseñas, información de pago, documentos de identidad, números de identificación gubernamental ni otros documentos sensibles por correo electrónico. Cuando sea necesario, te indicaremos un canal seguro.",
      relationship:
        "El envío de esta consulta no crea automáticamente una relación profesional o contractual. Cualquier servicio estará sujeto a revisión, alcance y confirmación por separado.",
      team: "Equipo de LAMBTECH",
    },
  },
} satisfies Record<LeadSourceSite, Record<EmailLocale, SiteEmailCopy>>;

const TEMPLATE_COPY = {
  en: {
    notProvided: "Not provided",
    confirmed: "Confirmed",
    locale: "English",
    submitted: "Submitted",
    leadId: "Lead ID",
    serviceInterest: "Service of interest",
    sourceSite: "Source site",
    localeLabel: "Locale",
    contact: "Contact information",
    request: "Request details",
    fullName: "Full name",
    email: "Email",
    phone: "Phone or WhatsApp",
    country: "Country",
    company: "Company",
    companyWebsite: "Company website",
    technologyContext: "Technology or application",
    marketOrProject: "Market or project details",
    message: "Message",
    campaign: "Campaign",
    utmSource: "UTM source",
    utmMedium: "UTM medium",
    utmCampaign: "UTM campaign",
    privacy: "Privacy consent",
    reply: "Reply to this person",
    greeting: (name: string) => `Hello ${name},`,
    received:
      "Thank you for contacting LAMBTECH. We received your inquiry, and our team will review the information you provided.",
    referenceNumber: "Reference number",
    nextSteps: "What happens next?",
    steps: [
      "We will review your inquiry and the information provided.",
      "We will contact you to better understand your needs and define the scope.",
      "We will explain the next steps before any service begins.",
    ],
    closing: "Sincerely,",
    footerAvailability: "Monday–Friday, 9:00 AM–6:00 PM ET · English and Spanish support",
    footerSafety:
      "For your security, do not send sensitive records by ordinary email. We will provide a secure channel when appropriate.",
    timeZone: "Time zone",
  },
  es: {
    notProvided: "No proporcionado",
    confirmed: "Confirmado",
    locale: "Español",
    submitted: "Enviado",
    leadId: "ID de solicitud",
    serviceInterest: "Servicio de interés",
    sourceSite: "Sitio de origen",
    localeLabel: "Idioma",
    contact: "Información de contacto",
    request: "Detalles de la solicitud",
    fullName: "Nombre completo",
    email: "Correo electrónico",
    phone: "Teléfono o WhatsApp",
    country: "País",
    company: "Empresa",
    companyWebsite: "Sitio web de la empresa",
    technologyContext: "Tecnología o aplicación",
    marketOrProject: "Mercado o detalles del proyecto",
    message: "Mensaje",
    campaign: "Campaña",
    utmSource: "Fuente UTM",
    utmMedium: "Medio UTM",
    utmCampaign: "Campaña UTM",
    privacy: "Consentimiento de privacidad",
    reply: "Responder a la persona",
    greeting: (name: string) => `Hola, ${name}:`,
    received:
      "Gracias por contactar a LAMBTECH. Recibimos tu solicitud y nuestro equipo revisará la información que proporcionaste.",
    referenceNumber: "Número de referencia",
    nextSteps: "¿Qué sigue?",
    steps: [
      "Revisaremos tu solicitud y la información proporcionada.",
      "Nos comunicaremos contigo para conocer mejor tu caso y definir el alcance.",
      "Te explicaremos los siguientes pasos antes de iniciar cualquier servicio.",
    ],
    closing: "Atentamente,",
    footerAvailability:
      "Lunes a viernes, 9:00 a. m.–6:00 p. m. ET · Atención en español e inglés",
    footerSafety:
      "Por tu seguridad, no envíes documentos sensibles por correo electrónico común. Te indicaremos un canal seguro cuando corresponda.",
    timeZone: "Zona horaria",
  },
} as const;

function localeFor(lead: LeadNotificationRecord): EmailLocale {
  return lead.locale === LeadLocale.ES ? "es" : "en";
}

export function escapeEmailHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function htmlWithLineBreaks(value: string): string {
  return escapeEmailHtml(value).replace(/\r?\n/g, "<br />");
}

function optionalValue(value: string | null, locale: EmailLocale): string {
  return value ?? TEMPLATE_COPY[locale].notProvided;
}

function isSafeEmail(value: string): boolean {
  return !/[\r\n\u0000-\u001f\u007f]/.test(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mailto(value: string): string | null {
  return isSafeEmail(value) ? `mailto:${encodeURIComponent(value)}` : null;
}

function formatSubmittedAt(date: Date, locale: EmailLocale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-CR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Costa_Rica",
    timeZoneName: "short",
  }).format(date);
}

function renderHeader(locale: EmailLocale, sourceSite: LeadSourceSite): string {
  const site = SITE_EMAIL_COPY[sourceSite][locale];
  return `<tr><td style="padding:28px 32px 24px;background-color:#ffffff;border-bottom:1px solid #dbe5e5;text-align:center;"><img alt="${escapeEmailHtml(site.name)}" src="${LAMBTECH_LOGO_URL}" width="184" style="display:block;width:184px;max-width:100%;height:auto;margin:0 auto;border:0;outline:none;text-decoration:none;" /><div style="margin-top:10px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#58616b;">${escapeEmailHtml(site.descriptor)}</div></td></tr>`;
}

function renderFooter(locale: EmailLocale, sourceSite: LeadSourceSite): string {
  const copy = TEMPLATE_COPY[locale];
  const year = new Date().getUTCFullYear();
  const site = SITE_EMAIL_COPY[sourceSite][locale];
  return `<tr><td style="padding:24px 32px 28px;background-color:#f2f7f7;border-top:1px solid #dbe5e5;font-family:Arial,Helvetica,sans-serif;color:#59636d;font-size:12px;line-height:18px;"><strong style="color:#007e80;font-size:13px;letter-spacing:0.04em;">${escapeEmailHtml(site.name)}</strong><br /><span style="color:#59636d;text-decoration:none;">${renderNonLinkedText(BRAND.phone)}</span><br /><span style="color:#59636d;text-decoration:none;">${renderNonLinkedText(BRAND.address)}</span><br /><span style="color:#59636d;text-decoration:none;">${renderNonLinkedText(BRAND.costaRicaAddress)}</span><br />${copy.footerAvailability}<p style="margin:14px 0 0;color:#69747d;">${copy.footerSafety}</p><p style="margin:10px 0 0;color:#69747d;">© ${year} ${BRAND.company}</p></td></tr>`;
}

function renderNonLinkedText(value: string): string {
  return Array.from(value)
    .map((character) => `<span>${escapeEmailHtml(character)}</span>`)
    .join("");
}

export function createBrandedEmailHtml(
  locale: EmailLocale,
  content: string,
  sourceSite: LeadSourceSite = LeadSourceSite.LAMBTECH,
): string {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="margin:0;padding:0;background-color:#eef3f4;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background-color:#eef3f4;"><tr><td align="center" style="padding:28px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background-color:#ffffff;border:1px solid #dbe5e5;border-radius:16px;overflow:hidden;">${renderHeader(locale, sourceSite)}<tr><td style="padding:32px;font-family:Arial,Helvetica,sans-serif;color:#333842;font-size:16px;line-height:24px;">${content}</td></tr>${renderFooter(locale, sourceSite)}</table></td></tr></table></body></html>`;
}

function tableRows(rows: Array<[string, string]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #e3ebeb;color:#52616a;font-size:13px;font-weight:700;vertical-align:top;width:38%;">${escapeEmailHtml(label)}</td><td style="padding:10px 12px;border-bottom:1px solid #e3ebeb;color:#333842;font-size:14px;vertical-align:top;">${escapeEmailHtml(value)}</td></tr>`,
    )
    .join("");
}

function section(title: string, contents: string): string {
  return `<h2 style="margin:28px 0 12px;color:#333842;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;">${escapeEmailHtml(title)}</h2>${contents}`;
}

function summaryTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #dbe5e5;border-collapse:separate;border-spacing:0;border-radius:8px;overflow:hidden;">${tableRows(rows)}</table>`;
}

export function getLocalizedInterestLabel(
  interest: LeadInterest,
  locale: EmailLocale,
): string {
  return INTEREST_LABELS[interest][locale];
}

export function createInternalLeadNotificationTemplate(
  lead: LeadNotificationRecord,
): LeadEmailTemplate {
  const locale = localeFor(lead);
  const copy = TEMPLATE_COPY[locale];
  const site = SITE_EMAIL_COPY[lead.sourceSite][locale];
  const interest = getLocalizedInterestLabel(lead.interest, locale);
  const sourceSite = SOURCE_SITE_LABELS[lead.sourceSite][locale];
  const submitted = `${formatSubmittedAt(lead.createdAt, locale)} (${copy.timeZone}: America/Costa_Rica)`;
  const replyLink = mailto(lead.email);
  const priorityRows: Array<[string, string]> = [
    [copy.leadId, lead.id],
    [copy.submitted, submitted],
    [copy.serviceInterest, interest],
    [copy.sourceSite, sourceSite],
    [copy.localeLabel, copy.locale],
  ];
  const contactRows: Array<[string, string]> = [
    [copy.fullName, lead.fullName],
    [copy.email, lead.email],
    [copy.phone, optionalValue(lead.phone, locale)],
    [copy.country, optionalValue(lead.country, locale)],
    [copy.company, optionalValue(lead.company, locale)],
    [copy.companyWebsite, optionalValue(lead.companyWebsite, locale)],
  ];
  const requestRows: Array<[string, string]> = [
    [copy.technologyContext, optionalValue(lead.technologyContext, locale)],
    [copy.marketOrProject, optionalValue(lead.marketOrProject, locale)],
    [copy.campaign, optionalValue(lead.campaign, locale)],
    [copy.utmSource, optionalValue(lead.utmSource, locale)],
    [copy.utmMedium, optionalValue(lead.utmMedium, locale)],
    [copy.utmCampaign, optionalValue(lead.utmCampaign, locale)],
    [copy.privacy, copy.confirmed],
  ];
  const replyAction = replyLink
    ? `<p style="margin:28px 0 0;"><a href="${replyLink}" style="display:inline-block;padding:12px 18px;background-color:#007e80;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:18px;text-decoration:none;border-radius:6px;">${escapeEmailHtml(copy.reply)}</a></p>`
    : "";

  const text = [
    site.internalHeading,
    "",
    `${copy.leadId}: ${lead.id}`,
    `${copy.submitted}: ${submitted}`,
    `${copy.serviceInterest}: ${interest}`,
    `${copy.sourceSite}: ${sourceSite}`,
    `${copy.localeLabel}: ${copy.locale}`,
    "",
    copy.contact,
    `${copy.fullName}: ${lead.fullName}`,
    `${copy.email}: ${lead.email}`,
    `${copy.phone}: ${optionalValue(lead.phone, locale)}`,
    `${copy.country}: ${optionalValue(lead.country, locale)}`,
    `${copy.company}: ${optionalValue(lead.company, locale)}`,
    `${copy.companyWebsite}: ${optionalValue(lead.companyWebsite, locale)}`,
    "",
    copy.request,
    `${copy.technologyContext}: ${optionalValue(lead.technologyContext, locale)}`,
    `${copy.marketOrProject}: ${optionalValue(lead.marketOrProject, locale)}`,
    `${copy.message}:`,
    lead.message,
    "",
    `${copy.campaign}: ${optionalValue(lead.campaign, locale)}`,
    `${copy.utmSource}: ${optionalValue(lead.utmSource, locale)}`,
    `${copy.utmMedium}: ${optionalValue(lead.utmMedium, locale)}`,
    `${copy.utmCampaign}: ${optionalValue(lead.utmCampaign, locale)}`,
    `${copy.privacy}: ${copy.confirmed}`,
    replyLink ? `\n${copy.reply}: ${replyLink}` : "",
    "",
    `${BRAND.company} · ${site.name}`,
    BRAND.phone,
    BRAND.address,
    BRAND.costaRicaAddress,
    copy.footerAvailability,
    copy.footerSafety,
  ]
    .filter(Boolean)
    .join("\n");

  const html = createBrandedEmailHtml(
    locale,
    `<h1 style="margin:0 0 20px;color:#333842;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;">${escapeEmailHtml(site.internalHeading)}</h1>${summaryTable(priorityRows)}${section(copy.contact, summaryTable(contactRows))}${section(copy.request, `${summaryTable(requestRows)}<h3 style="margin:20px 0 8px;color:#333842;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:22px;">${escapeEmailHtml(copy.message)}</h3><div style="padding:16px;background-color:#f2f7f7;border-left:4px solid #007e80;color:#333842;word-break:break-word;">${htmlWithLineBreaks(lead.message)}</div>`)}${replyAction}`,
    lead.sourceSite,
  );

  return {
    subject: `${site.internalSubject}: ${interest} | ${site.name}`,
    text,
    html,
  };
}

export function createVisitorConfirmationTemplate(
  lead: LeadNotificationRecord,
): LeadEmailTemplate {
  const locale = localeFor(lead);
  const copy = TEMPLATE_COPY[locale];
  const site = SITE_EMAIL_COPY[lead.sourceSite][locale];
  const interest = getLocalizedInterestLabel(lead.interest, locale);
  const summaryRows: Array<[string, string]> = [
    [copy.serviceInterest, interest],
    [copy.referenceNumber, lead.id],
  ];
  const list = copy.steps
    .map(
      (step) =>
        `<li style="margin:0 0 10px;padding-left:4px;">${escapeEmailHtml(step)}</li>`,
    )
    .join("");
  const text = [
    copy.greeting(lead.fullName),
    "",
    copy.received,
    "",
    `${copy.serviceInterest}: ${interest}`,
    `${copy.referenceNumber}: ${lead.id}`,
    "",
    copy.nextSteps,
    ...copy.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    site.security,
    "",
    site.relationship,
    "",
    copy.closing,
    site.team,
    "",
    `${BRAND.company} · ${site.name}`,
    BRAND.phone,
    BRAND.address,
    BRAND.costaRicaAddress,
    copy.footerAvailability,
    copy.footerSafety,
  ].join("\n");
  const html = createBrandedEmailHtml(
    locale,
    `<h1 style="margin:0 0 20px;color:#333842;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;">${escapeEmailHtml(copy.greeting(lead.fullName))}</h1><p style="margin:0 0 20px;">${escapeEmailHtml(copy.received)}</p>${summaryTable(summaryRows)}${section(copy.nextSteps, `<ol style="margin:0;padding-left:24px;">${list}</ol>`)}<div style="margin:28px 0 0;padding:16px;background-color:#f2f7f7;border-left:4px solid #007e80;color:#333842;"><strong>${locale === "es" ? "Seguridad" : "Security"}</strong><br />${escapeEmailHtml(site.security)}</div><p style="margin:22px 0 0;color:#59636d;font-size:14px;line-height:21px;">${escapeEmailHtml(site.relationship)}</p><p style="margin:24px 0 0;">${escapeEmailHtml(copy.closing)}<br /><strong>${escapeEmailHtml(site.team)}</strong></p>`,
    lead.sourceSite,
  );

  return {
    subject: site.visitorSubject,
    text,
    html,
  };
}

export { INTEREST_LABELS };
