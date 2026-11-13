import { WhatsAppIcon } from "@/components/company/brand-icons";

type WhatsAppButtonProps = {
  label: string;
  message?: string;
  url?: string;
};

function withPrefilledMessage(url: string, message?: string) {
  if (!message) return url;

  const target = new URL(url);
  target.searchParams.set("text", message);
  return target.toString();
}

export function WhatsAppButton({ label, message, url }: WhatsAppButtonProps) {
  if (!url) return null;

  return (
    <a aria-label={label} className="whatsapp-button" href={withPrefilledMessage(url, message)} rel="noopener noreferrer" target="_blank">
      <WhatsAppIcon aria-hidden="true" />
      <span className="whatsapp-button__tooltip" role="tooltip">{label}</span>
    </a>
  );
}
