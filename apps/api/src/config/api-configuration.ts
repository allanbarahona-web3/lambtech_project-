import { LeadSourceSite } from "@prisma/client";

export type ApiConfiguration = {
  nodeEnv: string;
  port: number;
  publicWebOrigins: string[];
  publicLeadSourceSiteOrigins: ReadonlyMap<string, LeadSourceSite>;
  trustProxy: false | "loopback";
};

const DEFAULT_PORT = 3001;

function getPort(value: string | undefined): number {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const normalizedValue = value.trim();
  if (!/^\d+$/.test(normalizedValue)) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  const port = Number(normalizedValue);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }

  return port;
}

export function parseExactPublicOrigin(value: string): string {
  if (value.includes("*")) {
    throw new Error("PUBLIC_WEB_ORIGINS must not contain wildcard origins.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("PUBLIC_WEB_ORIGINS contains an invalid origin.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("PUBLIC_WEB_ORIGINS origins must use http or https.");
  }

  if (url.username || url.password) {
    throw new Error("PUBLIC_WEB_ORIGINS origins must not contain credentials.");
  }

  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error(
      "PUBLIC_WEB_ORIGINS values must be origins without paths, queries, or fragments.",
    );
  }

  return url.origin;
}

export function parsePublicWebOrigins(value: string | undefined): string[] {
  if (value === undefined || value.trim() === "") {
    return [];
  }

  const origins = value.split(",").map((origin) => origin.trim());
  if (origins.some((origin) => origin === "")) {
    throw new Error("PUBLIC_WEB_ORIGINS must not contain empty origins.");
  }

  return [...new Set(origins.map(parseExactPublicOrigin))];
}

export function parsePublicLeadSourceSiteOrigins(
  value: string | undefined,
  publicWebOrigins: readonly string[],
): ReadonlyMap<string, LeadSourceSite> {
  if (value === undefined || value.trim() === "") {
    throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS is required.");
  }

  const mappings = new Map<string, LeadSourceSite>();
  for (const rawEntry of value.split(",")) {
    const entry = rawEntry.trim();
    const separator = entry.lastIndexOf("=");
    if (separator <= 0 || separator === entry.length - 1 || entry.indexOf("=") !== separator) {
      throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS entries must use https://origin=SOURCE_SITE.");
    }

    const origin = parseExactPublicOrigin(entry.slice(0, separator).trim());
    const sourceSite = entry.slice(separator + 1).trim();
    if (sourceSite !== LeadSourceSite.FORMATION && sourceSite !== LeadSourceSite.TECHNOLOGY) {
      throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS must map to FORMATION or TECHNOLOGY.");
    }
    if (!publicWebOrigins.includes(origin)) {
      throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS origins must also be in PUBLIC_WEB_ORIGINS.");
    }
    if (mappings.has(origin)) {
      throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS must not repeat an origin.");
    }
    mappings.set(origin, sourceSite);
  }

  const sourceSites = new Set(mappings.values());
  if (!sourceSites.has(LeadSourceSite.FORMATION) || !sourceSites.has(LeadSourceSite.TECHNOLOGY)) {
    throw new Error("PUBLIC_LEAD_SOURCE_SITE_ORIGINS must map both FORMATION and TECHNOLOGY.");
  }

  return mappings;
}

function requiresSecurePublicOrigins(nodeEnv: string): boolean {
  return nodeEnv !== "development" && nodeEnv !== "test";
}

function assertSecurePublicOrigins(origins: string[], nodeEnv: string): void {
  if (!requiresSecurePublicOrigins(nodeEnv)) {
    return;
  }

  for (const origin of origins) {
    const url = new URL(origin);
    if (url.protocol !== "https:") {
      throw new Error(
        "PUBLIC_WEB_ORIGINS must use https outside development and test.",
      );
    }

    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      throw new Error(
        "PUBLIC_WEB_ORIGINS must not use a local hostname outside development and test.",
      );
    }
  }
}

function getTrustProxy(value: string | undefined): false | "loopback" {
  if (value === undefined || value.trim() === "") {
    return false;
  }

  if (value.trim() !== "loopback") {
    throw new Error('TRUST_PROXY must be "loopback" when configured.');
  }

  return "loopback";
}

export function getApiConfiguration(
  environment: NodeJS.ProcessEnv = process.env,
): ApiConfiguration {
  const nodeEnv = environment.NODE_ENV?.trim() || "development";
  const publicWebOrigins = parsePublicWebOrigins(environment.PUBLIC_WEB_ORIGINS);

  if (nodeEnv === "production" && publicWebOrigins.length === 0) {
    throw new Error("PUBLIC_WEB_ORIGINS is required in production.");
  }

  assertSecurePublicOrigins(publicWebOrigins, nodeEnv);
  const publicLeadSourceSiteOrigins = parsePublicLeadSourceSiteOrigins(
    environment.PUBLIC_LEAD_SOURCE_SITE_ORIGINS,
    publicWebOrigins,
  );

  return {
    nodeEnv,
    port: getPort(environment.PORT),
    publicWebOrigins,
    publicLeadSourceSiteOrigins,
    trustProxy: getTrustProxy(environment.TRUST_PROXY),
  };
}
