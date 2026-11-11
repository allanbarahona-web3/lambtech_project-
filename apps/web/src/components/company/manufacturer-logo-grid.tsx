import { PublicMediaFrame } from "@/components/design-system/public-media-frame";
import type { ManufacturerLogo } from "@/lib/media";

type ManufacturerLogoGridProps = {
  logos: readonly ManufacturerLogo[];
  variant?: "full" | "preview";
};

export function ManufacturerLogoGrid({
  logos,
  variant = "full",
}: ManufacturerLogoGridProps) {
  const className = `manufacturer-logo-grid manufacturer-logo-grid--${variant}`;

  return (
    <div className={className} role="list">
      {logos.map((logo) => (
        <div data-logo={logo.name.toLowerCase()} key={logo.name} role="listitem">
          <PublicMediaFrame
            alt={`${logo.name} logo`}
            aspectRatio="3 / 2"
            className="manufacturer-logo-grid__logo"
            fallbackLabel={`${logo.name} logo`}
            mobileSrc={logo.mobileSrc}
            src={logo.desktopSrc}
          />
        </div>
      ))}
    </div>
  );
}
