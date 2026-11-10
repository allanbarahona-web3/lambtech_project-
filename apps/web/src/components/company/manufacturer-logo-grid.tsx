import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import type { PublicPartnerLogo } from "@/config/public-company";

type ManufacturerLogoGridProps = {
  fallbackLabel: string;
  logos: readonly PublicPartnerLogo[];
  slotCount?: number;
  variant?: "full" | "preview";
};

export function ManufacturerLogoGrid({
  fallbackLabel,
  logos,
  slotCount = 8,
  variant = "full",
}: ManufacturerLogoGridProps) {
  const className = `manufacturer-logo-grid manufacturer-logo-grid--${variant}`;

  return (
    <div aria-label={!logos.length ? fallbackLabel : undefined} className={className} role={logos.length ? "list" : "img"}>
      {logos.length ? logos.map((logo) => (
        <PublicMediaFrame
          alt={logo.name}
          aspectRatio="3 / 2"
          className="manufacturer-logo-grid__logo"
          fallbackLabel={fallbackLabel}
          key={logo.src}
          src={logo.src}
        />
      )) : Array.from({ length: slotCount }, (_, index) => (
        <div aria-hidden="true" className="manufacturer-logo-grid__slot" key={index} />
      ))}
    </div>
  );
}
