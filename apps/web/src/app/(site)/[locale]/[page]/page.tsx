import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/company/whatsapp-button";
import { CorporateFooter } from "@/components/site/corporate-footer";
import { CorporateHeader } from "@/components/site/corporate-header";
import { LegalPage } from "@/components/site/legal-page";
import { publicCompany } from "@/config/public-company";
import { AboutPage, type AboutPageContent } from "@/features/about/about-page";
import { ContactPage, type ContactPageContent } from "@/features/contact/contact-page";
import { LatamPage, type LatamPageContent } from "@/features/latam/latam-page";
import { ManufacturersPage, type ManufacturersPageContent } from "@/features/manufacturers/manufacturers-page";
import { TechnologyPage, type TechnologyPageContent } from "@/features/technology/technology-page";
import { WhatWeDoPage, type WhatWeDoPageContent } from "@/features/what-we-do/what-we-do-page";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/server";
import { getLegalContent } from "@/lib/legal";
import { publicMedia } from "@/lib/media";
import {
  corporateRouteIds,
  isCorporateRoute,
  isLegalRoute,
  legalRouteIds,
  type CorporateRouteId,
} from "@/lib/site-navigation";
import { getLocaleMetadata } from "@/lib/seo";

type LocalizedPageProps = { params: Promise<{ locale: string; page: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.flatMap((locale) => [
    ...corporateRouteIds.map((page) => ({ locale, page })),
    ...legalRouteIds.map((page) => ({ locale, page })),
  ]);
}

function headerLabels(common: Awaited<ReturnType<typeof getTranslation>>) {
  return {
    about: common("header.navigation.about"),
    contact: common("header.navigation.contact"),
    english: common("languageSwitcher.english"),
    language: common("languageSwitcher.label"),
    home: common("header.navigation.home"),
    latam: common("header.navigation.latam"),
    logoAlt: common("header.logoAlt"),
    manufacturers: common("header.navigation.manufacturers"),
    menuClose: common("header.menu.close"),
    menuOpen: common("header.menu.open"),
    navigation: common("header.navigation.label"),
    spanish: common("languageSwitcher.spanish"),
    technology: common("header.navigation.technology"),
    whatWeDo: common("header.navigation.whatWeDo"),
  };
}

function footerLabels(footer: Awaited<ReturnType<typeof getTranslation>>) {
  return {
    about: footer("about"),
    contact: footer("contact"),
    contactDetails: footer("contactDetails", { returnObjects: true }) as { address: string; email: string; fax: string; phone: string; whatsapp: string },
    disclaimer: footer("disclaimer"),
    copyright: footer("copyright"),
    footerLogoMissing: footer("footerLogoMissing"),
    legalTitle: footer("legalTitle"),
    logoAlt: footer("logoAlt"),
    navigationTitle: footer("navigationTitle"),
    privacy: footer("privacy"),
    social: footer("social", { returnObjects: true }) as Record<"facebook" | "instagram" | "linkedin" | "tiktok", string>,
    socialTitle: footer("socialTitle"),
    tagline: footer("tagline"),
    technology: footer("technology"),
    terms: footer("terms"),
    whatWeDo: footer("whatWeDo"),
  };
}

export async function generateMetadata({ params }: LocalizedPageProps): Promise<Metadata> {
  const { locale, page } = await params;
  if (!isLocale(locale) || (!isCorporateRoute(page) && !isLegalRoute(page))) return {};

  if (isLegalRoute(page)) {
    const content = getLegalContent(locale, page);
    return getLocaleMetadata(locale, content.title, content.description, page, { noIndex: true });
  }

  if (page === "what-we-do") {
    const t = await getTranslation(locale, "whatWeDoPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  if (page === "technology") {
    const t = await getTranslation(locale, "technologyPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  if (page === "manufacturers") {
    const t = await getTranslation(locale, "manufacturersPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  if (page === "latam") {
    const t = await getTranslation(locale, "latamPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  if (page === "about") {
    const t = await getTranslation(locale, "aboutPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  if (page === "contact") {
    const t = await getTranslation(locale, "contactPage");
    return getLocaleMetadata(locale, t("metadata.title"), t("metadata.description"), page, { noIndex: true });
  }

  return {};
}

function isRoute(locale: string, page: string): locale is Locale {
  return isLocale(locale) && (isCorporateRoute(page) || isLegalRoute(page));
}

export default async function LocalizedPage({ params }: LocalizedPageProps) {
  const { locale, page } = await params;
  if (!isRoute(locale, page)) notFound();

  const [aboutPage, common, contactPage, footer, latamPage, manufacturersPage, technologyPage, whatWeDoPage] = await Promise.all([
    getTranslation(locale, "aboutPage"),
    getTranslation(locale, "common"),
    getTranslation(locale, "contactPage"),
    getTranslation(locale, "footer"),
    getTranslation(locale, "latamPage"),
    getTranslation(locale, "manufacturersPage"),
    getTranslation(locale, "technologyPage"),
    getTranslation(locale, "whatWeDoPage"),
  ]);
  const currentPage: CorporateRouteId | undefined = isCorporateRoute(page) ? page : undefined;
  const whatsappLabel = footer("contactDetails.whatsapp");

  return (
    <>
      <CorporateHeader currentLocale={locale} currentPage={currentPage} localePath={page} labels={headerLabels(common)} />
      {isLegalRoute(page) ? (
        <LegalPage content={getLegalContent(locale, page)} locale={locale} />
      ) : page === "what-we-do" ? (
        <WhatWeDoPage
          content={{
            cta: whatWeDoPage("cta", { returnObjects: true }) as unknown as WhatWeDoPageContent["cta"],
            introduction: whatWeDoPage("introduction", { returnObjects: true }) as unknown as WhatWeDoPageContent["introduction"],
            marketDevelopment: whatWeDoPage("marketDevelopment", { returnObjects: true }) as unknown as WhatWeDoPageContent["marketDevelopment"],
            partnerships: whatWeDoPage("partnerships", { returnObjects: true }) as unknown as WhatWeDoPageContent["partnerships"],
            process: whatWeDoPage("process", { returnObjects: true }) as unknown as WhatWeDoPageContent["process"],
            procurement: whatWeDoPage("procurement", { returnObjects: true }) as unknown as WhatWeDoPageContent["procurement"],
            solutions: whatWeDoPage("solutions", { returnObjects: true }) as unknown as WhatWeDoPageContent["solutions"],
            trading: whatWeDoPage("trading", { returnObjects: true }) as unknown as WhatWeDoPageContent["trading"],
          }}
          currentLocale={locale}
          media={{
            introduction: publicMedia.whatWeDoIntroduction,
            supporting: publicMedia.whatWeDoSupporting,
          }}
        />
      ) : page === "technology" ? (
        <TechnologyPage
          content={{
            categories: technologyPage("categories", { returnObjects: true }) as unknown as TechnologyPageContent["categories"],
            cta: technologyPage("cta", { returnObjects: true }) as unknown as TechnologyPageContent["cta"],
            introduction: technologyPage("introduction", { returnObjects: true }) as unknown as TechnologyPageContent["introduction"],
          }}
          currentLocale={locale}
          media={{
            connected: publicMedia.technologyConnected,
            gas: publicMedia.technologyGas,
            industrial: publicMedia.technologyIndustrial,
            introduction: publicMedia.technologyIntroduction,
            water: publicMedia.technologyWater,
          }}
        />
      ) : page === "manufacturers" ? (
        <ManufacturersPage
          content={{
            channels: manufacturersPage("channels", { returnObjects: true }) as unknown as ManufacturersPageContent["channels"],
            cta: manufacturersPage("cta", { returnObjects: true }) as unknown as ManufacturersPageContent["cta"],
            introduction: manufacturersPage("introduction", { returnObjects: true }) as unknown as ManufacturersPageContent["introduction"],
            network: manufacturersPage("network", { returnObjects: true }) as unknown as ManufacturersPageContent["network"],
            opportunities: manufacturersPage("opportunities", { returnObjects: true }) as unknown as ManufacturersPageContent["opportunities"],
            process: manufacturersPage("process", { returnObjects: true }) as unknown as ManufacturersPageContent["process"],
          }}
          currentLocale={locale}
          logos={publicMedia.manufacturerLogos}
        />
      ) : page === "latam" ? (
        <LatamPage
          content={{
            collaboration: latamPage("collaboration", { returnObjects: true }) as unknown as LatamPageContent["collaboration"],
            cta: latamPage("cta", { returnObjects: true }) as unknown as LatamPageContent["cta"],
            introduction: latamPage("introduction", { returnObjects: true }) as unknown as LatamPageContent["introduction"],
            procurement: latamPage("procurement", { returnObjects: true }) as unknown as LatamPageContent["procurement"],
            process: latamPage("process", { returnObjects: true }) as unknown as LatamPageContent["process"],
            requirements: latamPage("requirements", { returnObjects: true }) as unknown as LatamPageContent["requirements"],
            technology: latamPage("technology", { returnObjects: true }) as unknown as LatamPageContent["technology"],
          }}
          currentLocale={locale}
          media={{
            introduction: publicMedia.latamIntroduction,
            supporting: publicMedia.latamSupporting,
          }}
        />
      ) : page === "about" ? (
        <AboutPage
          content={{
            cta: aboutPage("cta", { returnObjects: true }) as unknown as AboutPageContent["cta"],
            future: aboutPage("future", { returnObjects: true }) as unknown as AboutPageContent["future"],
            identity: aboutPage("identity", { returnObjects: true }) as unknown as AboutPageContent["identity"],
            introduction: aboutPage("introduction", { returnObjects: true }) as unknown as AboutPageContent["introduction"],
            model: aboutPage("model", { returnObjects: true }) as unknown as AboutPageContent["model"],
            principles: aboutPage("principles", { returnObjects: true }) as unknown as AboutPageContent["principles"],
          }}
          currentLocale={locale}
          media={{ introduction: publicMedia.aboutIntroduction }}
        />
      ) : page === "contact" ? (
        <ContactPage
          content={{
            details: contactPage("details", { returnObjects: true }) as ContactPageContent["details"],
            form: contactPage("form", { returnObjects: true }) as unknown as ContactPageContent["form"],
            information: contactPage("information", { returnObjects: true }) as ContactPageContent["information"],
            introduction: contactPage("introduction", { returnObjects: true }) as ContactPageContent["introduction"],
            paths: contactPage("paths", { returnObjects: true }) as unknown as ContactPageContent["paths"],
            pathsHeading: contactPage("pathsHeading", { returnObjects: true }) as ContactPageContent["pathsHeading"],
          }}
        />
      ) : (
        notFound()
      )}
      <CorporateFooter currentLocale={locale} labels={footerLabels(footer)} />
      <WhatsAppButton label={whatsappLabel} url={publicCompany.whatsappUrl} />
    </>
  );
}
