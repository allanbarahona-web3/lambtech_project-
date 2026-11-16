import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function remotePatternFromMediaBaseUrl(value: string | undefined): RemotePattern | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return undefined;

    const basePath = url.pathname.replace(/\/+$/, "");

    return {
      hostname: url.hostname,
      pathname: `${basePath || ""}/**`,
      port: url.port,
      protocol: "https",
    };
  } catch {
    return undefined;
  }
}

const mediaPattern = remotePatternFromMediaBaseUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL);

function originFromPublicUrl(value: string | undefined, allowedProtocols: readonly string[]) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return allowedProtocols.includes(url.protocol) ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

const mediaOrigin = originFromPublicUrl(process.env.NEXT_PUBLIC_MEDIA_BASE_URL, ["https:"]);
const apiOrigin = originFromPublicUrl(process.env.NEXT_PUBLIC_API_BASE_URL, ["http:", "https:"]);
const isProductionSite = process.env.NEXT_PUBLIC_SITE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  // Next's statically rendered hydration payload includes inline scripts. A
  // nonce would force request-time rendering and undermine the site's caching.
  "script-src 'self' 'unsafe-inline'" + (isDevelopment ? " 'unsafe-eval'" : ""),
  // Component styles set approved CSS custom properties inline.
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data:${mediaOrigin ? ` ${mediaOrigin}` : ""}`,
  "font-src 'self'",
  `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
  "manifest-src 'self'",
  ...(isProductionSite ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  ...(mediaPattern ? { images: { remotePatterns: [mediaPattern] } } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          ...(isProductionSite ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
