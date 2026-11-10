import {
  LeadLocale,
  PrivacyRequestStatus,
  PrivacyRequestType,
  type PrivacyRequest,
} from "@prisma/client";

import type { TransactionalEmail } from "../lead-email/email-delivery.service";
import {
  createBrandedEmailHtml,
  escapeEmailHtml,
  type EmailLocale,
} from "../lead-email/lead-email-templates";
import { createLeadEmailLogoAttachment } from "../lead-email/lead-email-logo";

type PrivacyRequestEmail = Pick<
  TransactionalEmail,
  "subject" | "text" | "html" | "attachments"
>;

const TYPE_LABELS = {
  [PrivacyRequestType.ACCESS]: {
    en: "Access my information",
    es: "Acceso a mi información",
  },
  [PrivacyRequestType.CORRECTION]: {
    en: "Correct information",
    es: "Corrección de información",
  },
  [PrivacyRequestType.DELETION]: {
    en: "Delete information",
    es: "Eliminación de información",
  },
  [PrivacyRequestType.WITHDRAW_CONSENT]: {
    en: "Withdraw consent",
    es: "Retiro del consentimiento",
  },
  [PrivacyRequestType.INFORMATION]: {
    en: "Information about processing",
    es: "Información sobre el tratamiento",
  },
  [PrivacyRequestType.OTHER]: { en: "Other request", es: "Otra solicitud" },
} satisfies Record<PrivacyRequestType, Record<EmailLocale, string>>;

function emailLocale(request: PrivacyRequest): EmailLocale {
  return request.locale === LeadLocale.ES ? "es" : "en";
}

function formattedTime(date: Date, locale: EmailLocale): string {
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

function optionalMessage(request: PrivacyRequest, locale: EmailLocale): string {
  return request.message ?? (locale === "es" ? "No proporcionado" : "Not provided");
}

function detailsTable(rows: Array<[string, string]>): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:1px solid #dbe3ec;border-collapse:separate;border-spacing:0;border-radius:8px;overflow:hidden;">${rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#475569;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;vertical-align:top;width:38%;">${escapeEmailHtml(label)}</td><td style="padding:9px 12px;border-bottom:1px solid #e2e8f0;color:#172033;font-family:Arial,Helvetica,sans-serif;font-size:14px;vertical-align:top;word-break:break-word;">${escapeEmailHtml(value)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function createInternalPrivacyRequestTemplate(
  request: PrivacyRequest,
): PrivacyRequestEmail {
  const locale = emailLocale(request);
  const spanish = locale === "es";
  const type = TYPE_LABELS[request.requestType][locale];
  const submitted = formattedTime(request.createdAt, locale);
  const warning = spanish
    ? "Esta solicitud debe revisarse y la identidad de la persona debe verificarse antes de acceder, corregir, eliminar o divulgar cualquier información."
    : "This request must be reviewed and the requester’s identity must be verified before accessing, correcting, deleting, or disclosing any information.";
  const rows: Array<[string, string]> = spanish
    ? [
        ["ID de solicitud", request.id],
        ["Tipo", type],
        ["Correo electrónico", request.email],
        ["Idioma", "Español"],
        ["Enviado", submitted],
        ["Consentimiento del aviso", "Confirmado"],
        ["Estado", PrivacyRequestStatus.RECEIVED],
      ]
    : [
        ["Request ID", request.id],
        ["Type", type],
        ["Email", request.email],
        ["Locale", "English"],
        ["Submitted", submitted],
        ["Privacy notice acceptance", "Confirmed"],
        ["Status", PrivacyRequestStatus.RECEIVED],
      ];
  const text = [
    spanish ? "Nueva solicitud de privacidad" : "New privacy request",
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    spanish ? "Mensaje:" : "Message:",
    optionalMessage(request, locale),
    "",
    warning,
  ].join("\n");
  const html = createBrandedEmailHtml(
    locale,
    `<h1 style="margin:0 0 20px;color:#0b2545;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;">${spanish ? "Nueva solicitud de privacidad" : "New privacy request"}</h1>${detailsTable(rows)}<h2 style="margin:28px 0 12px;color:#0b2545;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;">${spanish ? "Mensaje" : "Message"}</h2><div style="padding:16px;background-color:#f8fafc;border-left:4px solid #075eaa;color:#172033;font-family:Arial,Helvetica,sans-serif;line-height:24px;white-space:pre-wrap;word-break:break-word;">${escapeEmailHtml(optionalMessage(request, locale))}</div><div style="margin:24px 0 0;padding:16px;background-color:#fff7ed;border-left:4px solid #b45309;color:#4a2b0b;font-family:Arial,Helvetica,sans-serif;line-height:24px;"><strong>${escapeEmailHtml(warning)}</strong></div>`,
  );
  return {
    subject: spanish
      ? "Nueva solicitud de privacidad | Barmentech Formation"
      : "New privacy request | Barmentech Formation",
    text,
    html,
    attachments: [createLeadEmailLogoAttachment()],
  };
}

export function createVisitorPrivacyRequestTemplate(
  request: PrivacyRequest,
): PrivacyRequestEmail {
  const locale = emailLocale(request);
  const spanish = locale === "es";
  const type = TYPE_LABELS[request.requestType][locale];
  const received = spanish
    ? "Recibimos tu solicitud de privacidad. Esto no significa que la acción solicitada ya se haya completado. Podemos contactarte para verificar tu identidad o aclarar el alcance."
    : "We received your privacy request. This does not mean the requested action has already been completed. We may contact you to verify your identity or clarify the scope.";
  const safety = spanish
    ? "No respondas con documentos de identidad, registros fiscales, información bancaria, contraseñas ni otros datos sensibles por correo ordinario o el formulario público. Te indicaremos un canal seguro aprobado si es necesario."
    : "Do not reply with identity documents, tax records, banking information, passwords, or other sensitive records by ordinary email or the public form. We will provide an approved secure channel if needed.";
  const outcome = spanish
    ? "El resultado final puede depender de obligaciones legales, contractuales, fiscales, contables, de seguridad y de conservación de registros aplicables."
    : "The final result may depend on applicable legal, contractual, tax, accounting, security, and record-retention obligations.";
  const reference = spanish ? "Referencia" : "Reference";
  const typeLabel = spanish ? "Tipo solicitado" : "Requested type";
  const text = [received, "", `${typeLabel}: ${type}`, `${reference}: ${request.id}`, "", safety, "", outcome].join("\n");
  const html = createBrandedEmailHtml(
    locale,
    `<h1 style="margin:0 0 20px;color:#0b2545;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;">${spanish ? "Recibimos tu solicitud de privacidad" : "We received your privacy request"}</h1><p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;color:#172033;font-size:16px;line-height:24px;">${escapeEmailHtml(received)}</p><p style="margin:0;padding:14px 16px;background-color:#f8fafc;border-left:4px solid #075eaa;color:#172033;font-family:Arial,Helvetica,sans-serif;line-height:24px;"><strong>${escapeEmailHtml(typeLabel)}:</strong> ${escapeEmailHtml(type)}<br /><strong>${escapeEmailHtml(reference)}:</strong> ${escapeEmailHtml(request.id)}</p><div style="margin:24px 0 0;padding:16px;background-color:#eff6ff;border-left:4px solid #075eaa;color:#172033;font-family:Arial,Helvetica,sans-serif;line-height:24px;"><strong>${spanish ? "Seguridad" : "Security"}</strong><br />${escapeEmailHtml(safety)}</div><p style="margin:20px 0 0;color:#475569;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;">${escapeEmailHtml(outcome)}</p>`,
  );
  return {
    subject: spanish
      ? "Recibimos tu solicitud de privacidad | Barmentech"
      : "We received your privacy request | Barmentech",
    text,
    html,
    attachments: [createLeadEmailLogoAttachment()],
  };
}
