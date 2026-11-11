import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/company/whatsapp-button";
import { CorporateFooter } from "@/components/site/corporate-footer";
import { CorporateHeader } from "@/components/site/corporate-header";
import { CorporateHero } from "@/components/site/corporate-hero";
import { HomeClosingCta } from "@/features/home/home-closing-cta";
import { OurApproach } from "@/features/home/our-approach";
import { PartnerNetwork } from "@/features/home/partner-network";
import { HomeReveal } from "@/features/home/home-reveal";
import { TechnologyMarkets } from "@/features/home/technology-markets";
import { WhatWeDo } from "@/features/home/what-we-do";
import { isLocale } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/server";
import { publicMedia } from "@/lib/media";
import { publicCompany } from "@/config/public-company";

type LocalePageProps = { params: Promise<{ locale: string }> };
type ProcessStep = { copy: string; number: string; title: string };
type TechnologyArea = { copy: string; mediaAlt: string; title: string };
type WhatWeDoService = { description: string; linkLabel: string; number: string; scope: string[]; title: string };

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [common, hero, whatWeDo, technology, partners, approach, homeCta, contact, footer] = await Promise.all([
    getTranslation(locale, "common"), getTranslation(locale, "hero"),
    getTranslation(locale, "whatWeDo"), getTranslation(locale, "technology"), getTranslation(locale, "partners"), getTranslation(locale, "approach"),
    getTranslation(locale, "homeCta"),
    getTranslation(locale, "contact"), getTranslation(locale, "footer"),
  ]);

  return (
    <>
      <CorporateHeader currentLocale={locale} currentPage="home" labels={{
        about: common("header.navigation.about"), contact: common("header.navigation.contact"),
        english: common("languageSwitcher.english"), language: common("languageSwitcher.label"),
        home: common("header.navigation.home"), latam: common("header.navigation.latam"),
        logoAlt: common("header.logoAlt"), menuClose: common("header.menu.close"), menuOpen: common("header.menu.open"),
        manufacturers: common("header.navigation.manufacturers"), navigation: common("header.navigation.label"), spanish: common("languageSwitcher.spanish"),
        technology: common("header.navigation.technology"), whatWeDo: common("header.navigation.whatWeDo"),
      }} />
      <main id="main-content">
        <CorporateHero currentLocale={locale} labels={{
          eyebrow: hero("eyebrow"), headline: hero("headline"), mediaAlt: hero("mediaAlt"),
          primaryCta: hero("primaryCta"), secondaryCta: hero("secondaryCta"),
        }} />
        <HomeReveal>
          <WhatWeDo currentLocale={locale} description={whatWeDo("description")} eyebrow={whatWeDo("eyebrow")} items={whatWeDo("items", { returnObjects: true }) as unknown as WhatWeDoService[]} title={whatWeDo("title")} />
        </HomeReveal>
        <HomeReveal>
          <TechnologyMarkets
            areas={technology("areas", { returnObjects: true }) as unknown as TechnologyArea[]}
            currentLocale={locale}
            eyebrow={technology("eyebrow")}
            images={[publicMedia.technologyWater, publicMedia.technologyGas, publicMedia.technologyIndustrial, publicMedia.technologyConnected]}
            linkLabel={technology("linkLabel")}
            title={technology("title")}
          />
        </HomeReveal>
        <HomeReveal><PartnerNetwork title={partners("title")} /></HomeReveal>
        <HomeReveal><OurApproach steps={approach("steps", { returnObjects: true }) as unknown as ProcessStep[]} title={approach("title")} /></HomeReveal>
        <HomeReveal>
          <HomeClosingCta
            currentLocale={locale}
            description={homeCta("description")}
            primaryAction={homeCta("primaryAction")}
            secondaryAction={homeCta("secondaryAction")}
            title={homeCta("title")}
            whatsappUrl={publicCompany.whatsappUrl}
          />
        </HomeReveal>
      </main>
      <CorporateFooter currentLocale={locale} labels={{
        about: footer("about"), contact: footer("contact"), contactDetails: footer("contactDetails", { returnObjects: true }) as { address: string; email: string; fax: string; phone: string; whatsapp: string }, disclaimer: footer("disclaimer"), copyright: footer("copyright"), footerLogoMissing: footer("footerLogoMissing"),
        legalTitle: footer("legalTitle"), logoAlt: footer("logoAlt"), navigationTitle: footer("navigationTitle"),
        privacy: footer("privacy"), social: footer("social", { returnObjects: true }) as Record<"facebook" | "instagram" | "linkedin" | "tiktok", string>, socialTitle: footer("socialTitle"), tagline: footer("tagline"), technology: footer("technology"), terms: footer("terms"), whatWeDo: footer("whatWeDo"),
      }} />
      <WhatsAppButton label={contact("details.whatsapp")} url={publicCompany.whatsappUrl} />
    </>
  );
}
