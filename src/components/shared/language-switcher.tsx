"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const nextLocale = locale === "bn" ? "en" : "bn";
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-app-border bg-app-surface text-xs font-bold text-app-text transition-colors hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus"
      title={locale === "bn" ? "Switch to English" : "বাংলায় দেখুন"}
      aria-label="Language Switcher"
    >
      {locale === "bn" ? "EN" : "বাং"}
    </button>
  );
}
