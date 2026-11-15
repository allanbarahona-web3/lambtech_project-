import type { MetadataRoute } from "next";
import { isProductionSite, publicSiteUrl } from "@/config/public-company";

export default function robots(): MetadataRoute.Robots {
  const isProduction = isProductionSite();

  return {
    rules: isProduction
      ? [
          { allow: "/", userAgent: "*" },
          // OAI-SearchBot governs ChatGPT search/retrieval. GPTBot is omitted
          // deliberately so this does not change the site's training policy.
          { allow: "/", userAgent: "OAI-SearchBot" },
        ]
      : { disallow: "/", userAgent: "*" },
    sitemap: publicSiteUrl("/sitemap.xml"),
  };
}
