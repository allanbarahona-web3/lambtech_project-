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

const nextConfig: NextConfig = {
  ...(mediaPattern ? { images: { remotePatterns: [mediaPattern] } } : {}),
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
