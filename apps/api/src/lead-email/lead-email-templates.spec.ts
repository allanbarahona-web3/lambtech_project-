import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  LeadInterest,
  LeadLocale,
  LeadSourceSite,
} from "@prisma/client";

import {
  createInternalLeadNotificationTemplate,
  createVisitorConfirmationTemplate,
  getLocalizedInterestLabel,
  INTEREST_LABELS,
} from "./lead-email-templates";
import {
  LeadEmailAssetError,
  loadLeadEmailLogo,
} from "./lead-email-logo";
import type { LeadNotificationRecord } from "./lead-notifications.service";

function leadRecord(
  overrides: Partial<LeadNotificationRecord> = {},
): LeadNotificationRecord {
  return {
    id: "lead-123",
    sourceSite: LeadSourceSite.FORMATION,
    locale: LeadLocale.EN,
    interest: LeadInterest.COMPANY_FORMATION,
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+1 555 0100",
    country: "Costa Rica",
    company: "Analytical Engines",
    message: "I need help forming a company.\nPlease contact me by email.",
    privacyConsentAt: new Date("2026-10-27T10:00:00.000Z"),
    campaign: "autumn-launch",
    utmSource: "newsletter",
    utmMedium: "email",
    utmCampaign: "autumn-launch",
    createdAt: new Date("2026-10-27T10:01:00.000Z"),
    ...overrides,
  };
}

test("builds complete English internal and visitor templates", () => {
  const lead = leadRecord();
  const internal = createInternalLeadNotificationTemplate(lead);
  const visitor = createVisitorConfirmationTemplate(lead);

  assert.equal(
    internal.subject,
    "New inquiry: U.S. company formation | Barmentech Formation",
  );
  assert.match(internal.html, /New Barmentech Formation inquiry/);
  assert.match(internal.html, /Full name/);
  assert.match(internal.html, /UTM source/);
  assert.match(internal.text, /America\/Costa_Rica/);
  assert.match(internal.text, /Reply to this person/);
  assert.equal(
    visitor.subject,
    "We received your inquiry | Barmentech Formation",
  );
  assert.match(visitor.html, /What happens next\?/);
  assert.match(visitor.html, /do not email passwords/i);
  assert.match(visitor.html, /professional, legal, tax, or contractual relationship/i);
  assert.match(visitor.text, /Reference number: lead-123/);
  assert.match(visitor.html, /Barmentech LLC/);
  assert.match(visitor.html, /formation/);
  assert.doesNotMatch(visitor.html, /mailto:formation@barmentech\.com/);
  assert.doesNotMatch(visitor.html, /formation@barmentech\.com/);
});

test("builds complete Spanish internal and visitor templates from the persisted locale", () => {
  const lead = leadRecord({
    locale: LeadLocale.ES,
    interest: LeadInterest.IN_PERSON_WORKSHOP,
  });
  const internal = createInternalLeadNotificationTemplate(lead);
  const visitor = createVisitorConfirmationTemplate(lead);

  assert.equal(
    internal.subject,
    "Nueva solicitud: Taller presencial | Barmentech Formation",
  );
  assert.match(internal.html, /Nueva solicitud de Barmentech Formation/);
  assert.match(internal.html, /Nombre completo/);
  assert.match(internal.html, /Fuente UTM/);
  assert.equal(
    visitor.subject,
    "Recibimos tu solicitud | Barmentech Formation",
  );
  assert.match(visitor.html, /¿Qué sigue\?/);
  assert.match(visitor.html, /no envíes contraseñas/i);
  assert.match(visitor.html, /relación profesional, legal, fiscal o contractual/i);
  assert.match(visitor.text, /Número de referencia: lead-123/);
  assert.match(visitor.html, /Atención en español e inglés/);
});

test("uses Technology-specific bilingual email presentation without changing the shared delivery flow", () => {
  const englishLead = leadRecord({
    sourceSite: LeadSourceSite.TECHNOLOGY,
    interest: LeadInterest.TECHNOLOGY_AND_DIGITAL,
    message: "Technology need: Automation and integrations\n\nWe need to connect existing systems.",
  });
  const spanishLead = leadRecord({
    sourceSite: LeadSourceSite.TECHNOLOGY,
    locale: LeadLocale.ES,
    interest: LeadInterest.TECHNOLOGY_AND_DIGITAL,
    message: "Necesidad tecnológica: Automatización e integraciones\n\nNecesitamos conectar sistemas existentes.",
  });

  const englishInternal = createInternalLeadNotificationTemplate(englishLead);
  const englishVisitor = createVisitorConfirmationTemplate(englishLead);
  const spanishInternal = createInternalLeadNotificationTemplate(spanishLead);
  const spanishVisitor = createVisitorConfirmationTemplate(spanishLead);

  assert.equal(
    englishInternal.subject,
    "New Technology inquiry: Technology and digital support | Barmentech Technology",
  );
  assert.equal(
    englishVisitor.subject,
    "We received your Technology inquiry | Barmentech Technology",
  );
  assert.match(englishInternal.html, /New Barmentech Technology inquiry/);
  assert.match(englishInternal.html, /Technology need: Automation and integrations/);
  assert.match(englishVisitor.html, /Barmentech Technology Team/);
  assert.doesNotMatch(englishVisitor.html, /Barmentech Formation/);
  assert.equal(
    spanishInternal.subject,
    "Nueva consulta de Tecnología: Tecnología y apoyo digital | Barmentech Tecnología",
  );
  assert.equal(
    spanishVisitor.subject,
    "Recibimos tu consulta de Tecnología | Barmentech Tecnología",
  );
  assert.match(spanishInternal.html, /Nueva consulta de Barmentech Tecnología/);
  assert.match(spanishVisitor.html, /Equipo de Barmentech Tecnología/);
  assert.doesNotMatch(spanishVisitor.html, /Formación y apoyo empresarial/);
});

test("attaches the complete logo through an in-memory inline CID reference", () => {
  const visitor = createVisitorConfirmationTemplate(leadRecord());
  const attachment = visitor.attachments?.[0];

  assert.equal(attachment?.filename, "barmentech-logo.png");
  assert.equal(attachment?.contentId, "barmentech-logo");
  assert.equal(attachment?.contentType, "image/png");
  assert.equal(attachment?.path, undefined);
  assert.ok(Buffer.isBuffer(attachment?.content));
  assert.ok((attachment?.content as Buffer | undefined)?.length);
  assert.deepEqual(
    (attachment?.content as Buffer).subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
  assert.match(visitor.html, /src="cid:barmentech-logo"/);
  assert.match(visitor.html, /alt="Barmentech"/);
});

test("loads the approved PNG from the compiled module-relative asset location", () => {
  const content = loadLeadEmailLogo();

  assert.ok(content.length > 0);
  assert.deepEqual(
    content.subarray(0, 8),
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
});

test("categorizes missing and invalid logo assets without exposing their path", () => {
  assert.throws(
    () =>
      loadLeadEmailLogo(() => {
        throw new Error("not available");
      }),
    (error: unknown) => {
      assert.ok(error instanceof LeadEmailAssetError);
      assert.equal(error.category, "EMAIL_ASSET_NOT_FOUND");
      assert.equal(error.message, "EMAIL_ASSET_NOT_FOUND");
      return true;
    },
  );
  assert.throws(
    () => loadLeadEmailLogo(() => Buffer.from("not a PNG")),
    (error: unknown) => {
      assert.ok(error instanceof LeadEmailAssetError);
      assert.equal(error.category, "EMAIL_ASSET_INVALID");
      return true;
    },
  );
  assert.throws(
    () => loadLeadEmailLogo(() => Buffer.alloc(0)),
    (error: unknown) => {
      assert.ok(error instanceof LeadEmailAssetError);
      assert.equal(error.category, "EMAIL_ASSET_INVALID");
      return true;
    },
  );
});

test("localizes every current interest without exposing raw enum values to visitors", () => {
  for (const interest of Object.values(LeadInterest)) {
    assert.equal(typeof INTEREST_LABELS[interest].en, "string");
    assert.equal(typeof INTEREST_LABELS[interest].es, "string");
    assert.notEqual(getLocalizedInterestLabel(interest, "en"), interest);
    assert.notEqual(getLocalizedInterestLabel(interest, "es"), interest);

    const visitor = createVisitorConfirmationTemplate(
      leadRecord({ interest }),
    );
    assert.doesNotMatch(visitor.html, new RegExp(interest));
    assert.doesNotMatch(visitor.text, new RegExp(interest));
  }
});

test("escapes user values in HTML, preserves message line breaks, and keeps plain text readable", () => {
  const lead = leadRecord({
    fullName: "<Ada & Co>",
    message: "<img src=x onerror=alert(1)>\nSecond line & details",
  });
  const internal = createInternalLeadNotificationTemplate(lead);
  const visitor = createVisitorConfirmationTemplate(lead);

  assert.doesNotMatch(internal.html, /<img src=x/);
  assert.match(internal.html, /&lt;img src=x onerror=alert\(1\)&gt;<br \/>Second line &amp; details/);
  assert.match(internal.text, /<img src=x onerror=alert\(1\)>\nSecond line & details/);
  assert.doesNotMatch(visitor.html, /<Ada & Co>/);
  assert.match(visitor.html, /&lt;Ada &amp; Co&gt;/);
});

test("uses localized fallbacks for absent optional values", () => {
  const spanishInternal = createInternalLeadNotificationTemplate(
    leadRecord({
      locale: LeadLocale.ES,
      phone: null,
      company: null,
      campaign: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    }),
  );
  const englishInternal = createInternalLeadNotificationTemplate(
    leadRecord({
      phone: null,
      company: null,
      campaign: null,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
    }),
  );

  assert.match(spanishInternal.text, /No proporcionado/);
  assert.match(englishInternal.text, /Not provided/);
});
