import i18next from "i18next";
import enAboutPage from "@/locales/en/about-page.json";
import enApproach from "@/locales/en/approach.json";
import enCommon from "@/locales/en/common.json";
import enContact from "@/locales/en/contact.json";
import enContactPage from "@/locales/en/contact-page.json";
import enFooter from "@/locales/en/footer.json";
import enHero from "@/locales/en/hero.json";
import enIntroduction from "@/locales/en/introduction.json";
import enLegal from "@/locales/en/legal.json";
import enLatamPage from "@/locales/en/latam-page.json";
import enManufacturersPage from "@/locales/en/manufacturers-page.json";
import enPartners from "@/locales/en/partners.json";
import enTechnology from "@/locales/en/technology.json";
import enTechnologyPage from "@/locales/en/technology-page.json";
import enWhatWeDo from "@/locales/en/what-we-do.json";
import enWhatWeDoPage from "@/locales/en/what-we-do-page.json";
import esApproach from "@/locales/es/approach.json";
import esAboutPage from "@/locales/es/about-page.json";
import esCommon from "@/locales/es/common.json";
import esContact from "@/locales/es/contact.json";
import esContactPage from "@/locales/es/contact-page.json";
import esFooter from "@/locales/es/footer.json";
import esHero from "@/locales/es/hero.json";
import esIntroduction from "@/locales/es/introduction.json";
import esLegal from "@/locales/es/legal.json";
import esLatamPage from "@/locales/es/latam-page.json";
import esManufacturersPage from "@/locales/es/manufacturers-page.json";
import esPartners from "@/locales/es/partners.json";
import esTechnology from "@/locales/es/technology.json";
import esTechnologyPage from "@/locales/es/technology-page.json";
import esWhatWeDo from "@/locales/es/what-we-do.json";
import esWhatWeDoPage from "@/locales/es/what-we-do-page.json";
import type { Locale } from "./config";

const resources = {
  en: {
    aboutPage: enAboutPage,
    approach: enApproach,
    common: enCommon,
    contact: enContact,
    contactPage: enContactPage,
    footer: enFooter,
    hero: enHero,
    introduction: enIntroduction,
    legal: enLegal,
    latamPage: enLatamPage,
    manufacturersPage: enManufacturersPage,
    partners: enPartners,
    technology: enTechnology,
    technologyPage: enTechnologyPage,
    whatWeDo: enWhatWeDo,
    whatWeDoPage: enWhatWeDoPage,
  },
  es: {
    aboutPage: esAboutPage,
    approach: esApproach,
    common: esCommon,
    contact: esContact,
    contactPage: esContactPage,
    footer: esFooter,
    hero: esHero,
    introduction: esIntroduction,
    legal: esLegal,
    latamPage: esLatamPage,
    manufacturersPage: esManufacturersPage,
    partners: esPartners,
    technology: esTechnology,
    technologyPage: esTechnologyPage,
    whatWeDo: esWhatWeDo,
    whatWeDoPage: esWhatWeDoPage,
  },
} as const;

export type TranslationNamespace = keyof (typeof resources)["en"];

export async function getTranslation(
  locale: Locale,
  namespace: TranslationNamespace = "common",
) {
  const instance = i18next.createInstance();

  await instance.init({
    defaultNS: namespace,
    fallbackLng: false,
    interpolation: {
      escapeValue: false,
    },
    lng: locale,
    ns: [namespace],
    resources,
    returnNull: false,
  });

  return instance.getFixedT(locale, namespace);
}
