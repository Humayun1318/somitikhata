import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/layout/footer";
import { PublicNavbar } from "@/components/layout/public-navbar";
import {
  HomeAudience,
  HomeCallToAction,
  HomeFaq,
  HomeHero,
  HomeModules,
  HomeSafeguards,
  HomeYear,
} from "@/features/home/components/home-sections";

// The public home page. Everything it describes is a working part of the app;
// it shows no figures, because the real ones are behind sign-in.
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // Statically rendered per locale: the sections read their texts for this one.
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-app-background text-app-text">
      <PublicNavbar />
      <main>
        <HomeHero />
        <HomeModules />
        <HomeAudience />
        <HomeYear />
        <HomeSafeguards />
        <HomeFaq />
        <HomeCallToAction />
      </main>
      <Footer />
    </div>
  );
}
