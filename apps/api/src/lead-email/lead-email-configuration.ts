import { isEmail } from "class-validator";

export type LeadEmailConfiguration = {
  apiKey: string;
  fromEmail: string;
  notificationTo: string;
};

export const LEAD_EMAIL_CONFIGURATION = Symbol("LEAD_EMAIL_CONFIGURATION");

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;

function readOptionalValue(
  environment: NodeJS.ProcessEnv,
  variableName: string,
): string | undefined {
  const rawValue = environment[variableName];
  if (rawValue === undefined) {
    return undefined;
  }

  if (CONTROL_CHARACTERS.test(rawValue)) {
    throw new Error(`${variableName} must not contain control characters.`);
  }

  const value = rawValue.trim();
  return value === "" ? undefined : value;
}

function requireValidEmail(value: string, variableName: string): string {
  if (!isEmail(value)) {
    throw new Error(`${variableName} must be a valid email address.`);
  }

  return value;
}

export function getLeadEmailConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): LeadEmailConfiguration | null {
  const apiKey = readOptionalValue(environment, "RESEND_API_KEY");
  const fromEmail = readOptionalValue(environment, "RESEND_FROM_EMAIL");
  const notificationTo = readOptionalValue(
    environment,
    "LEADS_NOTIFICATION_TO",
  );

  if (!apiKey && !fromEmail && !notificationTo) {
    return null;
  }

  if (!apiKey || !fromEmail || !notificationTo) {
    throw new Error(
      "RESEND_API_KEY, RESEND_FROM_EMAIL, and LEADS_NOTIFICATION_TO must be configured together.",
    );
  }

  return {
    apiKey,
    fromEmail: requireValidEmail(fromEmail, "RESEND_FROM_EMAIL"),
    notificationTo: requireValidEmail(notificationTo, "LEADS_NOTIFICATION_TO"),
  };
}
