import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/metadata";

// The public pages, each with its other-language versions.
const PUBLIC_PATHS = ["", "/login", "/register"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  const url = (locale: string, path: string) => new URL(`/${locale}${path}`, site).toString();

  return PUBLIC_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: url(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((item) => [item, url(item, path)])),
      },
    })),
  );
}
