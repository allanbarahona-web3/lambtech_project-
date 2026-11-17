import { publicCompany, publicSiteUrl } from "@/config/public-company";

const organizationId = publicSiteUrl("/#organization");
const websiteId = publicSiteUrl("/#website");

export function SiteStructuredData() {
  const sameAs = Object.values(publicCompany.social).filter((url): url is string => Boolean(url));
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": organizationId,
        "@type": "Organization",
        email: publicCompany.email,
        faxNumber: publicCompany.fax.e164,
        legalName: publicCompany.name,
        name: publicCompany.name,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        telephone: publicCompany.phone.e164,
        url: publicCompany.website,
      },
      {
        "@id": websiteId,
        "@type": "WebSite",
        name: publicCompany.name,
        publisher: { "@id": organizationId },
        url: publicCompany.website,
      },
    ],
  };

  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
      type="application/ld+json"
    />
  );
}
