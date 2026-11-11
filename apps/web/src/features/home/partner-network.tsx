import { ManufacturerLogoGrid } from "@/components/company/manufacturer-logo-grid";
import { Container } from "@/components/design-system/container";
import { SectionHeading } from "@/components/design-system/section-heading";
import { publicMedia } from "@/lib/media";

type PartnerNetworkProps = {
  title: string;
};

export function PartnerNetwork({ title }: PartnerNetworkProps) {
  return (
    <section aria-labelledby="partner-network-title" className="content-section partner-network" id="partners">
      <Container>
        <SectionHeading title={title} titleId="partner-network-title" />
        <ManufacturerLogoGrid logos={publicMedia.manufacturerLogos} variant="preview" />
      </Container>
    </section>
  );
}
