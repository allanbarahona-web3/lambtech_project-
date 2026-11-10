import { publicCompany, telephoneHref } from "@/config/public-company";

type ContactDetailsProps = {
  className?: string;
  includeWhatsApp?: boolean;
  labels: { address: string; email: string; fax: string; phone: string; whatsapp: string };
};

export function ContactDetails({ className, includeWhatsApp = true, labels }: ContactDetailsProps) {
  const hasDetails = publicCompany.email || publicCompany.phone || publicCompany.fax || publicCompany.address || (includeWhatsApp && publicCompany.whatsappUrl);
  if (!hasDetails) return null;

  return (
    <address className={["contact-details", className].filter(Boolean).join(" ")}>
      {publicCompany.email ? <a href={`mailto:${publicCompany.email}`}>{labels.email}: {publicCompany.email}</a> : null}
      {publicCompany.phone ? <a href={telephoneHref(publicCompany.phone.e164)}>{labels.phone}: {publicCompany.phone.display}</a> : null}
      {publicCompany.fax ? <p>{labels.fax}: {publicCompany.fax.display}</p> : null}
      {publicCompany.address ? <p>{labels.address}: {publicCompany.address}</p> : null}
      {includeWhatsApp && publicCompany.whatsappUrl ? (
        <a href={publicCompany.whatsappUrl} rel="noopener noreferrer" target="_blank">{labels.whatsapp}</a>
      ) : null}
    </address>
  );
}
