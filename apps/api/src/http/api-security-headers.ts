import type { HelmetOptions } from "helmet";

/**
 * API responses are JSON only. This deliberately does not inherit browser-page
 * allowances from the frontend CSP.
 */
export function apiSecurityHeaders(nodeEnv: string): HelmetOptions {
  return {
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        baseUri: ["'none'"],
        defaultSrc: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'none'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
      },
    },
    // The API is intentionally called cross-origin by the Vercel frontend.
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "no-referrer" },
    strictTransportSecurity: nodeEnv === "production"
      ? { includeSubDomains: false, maxAge: 31_536_000, preload: false }
      : false,
    xFrameOptions: { action: "deny" },
    xPoweredBy: true,
  };
}
