import { WhatsAppIcon } from "@/components/company/brand-icons";

type WhatsAppButtonProps = {
  label: string;
  url?: string;
};

export function WhatsAppButton({ label, url }: WhatsAppButtonProps) {
  if (!url) return null;

  return (
    <a aria-label={label} className="whatsapp-button" href={url} rel="noopener noreferrer" target="_blank">
      <WhatsAppIcon aria-hidden="true" />
      <span className="whatsapp-button__tooltip" role="tooltip">{label}</span>
    </a>
  );
}
