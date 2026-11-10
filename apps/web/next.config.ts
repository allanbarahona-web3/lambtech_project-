import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

function remotePatternFromPublicUrl(value: string | undefined): RemotePattern | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return undefined;

    return {
      hostname: url.hostname,
      pathname: url.pathname,
      port: url.port,
      protocol: "https",
    };
  } catch {
    return undefined;
  }
}

const footerLogoPattern = remotePatternFromPublicUrl(process.env.NEXT_PUBLIC_FOOTER_LOGO_URL);

const nextConfig: NextConfig = {
  ...(footerLogoPattern ? { images: { remotePatterns: [footerLogoPattern] } } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
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
