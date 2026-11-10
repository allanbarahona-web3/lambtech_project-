import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";

type LocaleSwitcherProps = {
  currentLocale: Locale;
  englishAccessibleLabel?: string;
  englishLabel: string;
  label: string;
  path?: string;
  spanishLabel: string;
  spanishAccessibleLabel?: string;
};

function getLocalePath(locale: Locale, path = "") {
  const suffix = path.replace(/^\/+/, "");

  return suffix ? `/${locale}/${suffix}` : `/${locale}`;
}

export function LocaleSwitcher({
  currentLocale,
  englishAccessibleLabel,
  englishLabel,
  label,
  path,
  spanishLabel,
  spanishAccessibleLabel,
}: LocaleSwitcherProps) {
  const options: Array<{ accessibleLabel?: string; label: string; locale: Locale }> = [
    { accessibleLabel: englishAccessibleLabel, label: englishLabel, locale: "en" },
    { accessibleLabel: spanishAccessibleLabel, label: spanishLabel, locale: "es" },
  ];

  return (
    <nav aria-label={label} className="locale-switcher">
      <ul className="locale-switcher__list">
        {options.map((option) => (
          <li key={option.locale}>
            <Link
              aria-current={option.locale === currentLocale ? "page" : undefined}
              aria-label={option.accessibleLabel}
              href={getLocalePath(option.locale, path)}
              hrefLang={option.locale}
              lang={option.locale}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
