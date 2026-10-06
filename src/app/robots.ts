import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getSiteUrl } from "@/lib/metadata";

// Public pages may be indexed; the signed-in area is private.
export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: routing.locales.flatMap((locale) => [`/${locale}/admin`, `/${locale}/member`, `/${locale}/unauthorized`]),
    },
    sitemap: new URL("/sitemap.xml", site).toString(),
    host: site.origin,
  };
}
