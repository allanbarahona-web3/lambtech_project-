import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../../globals.css";
import { instrumentSans } from "@/lib/fonts";
import { getLocaleStaticParams, getLocaleMetadata } from "@/lib/seo";
import { getTranslation } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n/config";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return getLocaleStaticParams();
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const t = await getTranslation(locale);

  return getLocaleMetadata(
    locale,
    t("metadata.title"),
    t("metadata.description"),
  );
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const t = await getTranslation(locale);

  return (
    <html lang={locale}>
      <body className={instrumentSans.variable}>
        <a className="skip-link" href="#main-content">
          {t("accessibility.skipToContent")}
        </a>
        {children}
      </body>
    </html>
  );
}
