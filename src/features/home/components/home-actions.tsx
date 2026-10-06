"use client";

import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

import { useMe } from "@/features/auth/hooks/use-me";
import { getPostLoginRoute } from "@/features/auth/role-routes";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const PRIMARY =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus";

type HomeActionsProps = {
  /** "hero": on the light page. "band": on the green call-to-action band. */
  tone: "hero" | "band";
};

// The page's main buttons. A guest gets Sign in (+ how to join); a signed-in
// user gets their dashboard, straight from the same GET /user/me the navbar uses.
export function HomeActions({ tone }: HomeActionsProps) {
  const t = useTranslations("HomePage");
  const { data: user, isLoading } = useMe();
  const onBand = tone === "band";

  const primaryClass = cn(
    PRIMARY,
    onBand ? "bg-white text-app-primary hover:bg-app-surface-muted" : "bg-app-primary text-white hover:bg-app-primary-hover",
  );

  if (isLoading) {
    return <span aria-hidden="true" className={cn("block h-12 w-56 animate-pulse rounded-xl", onBand ? "bg-white/20" : "bg-app-surface-muted")} />;
  }

  if (user) {
    return (
      <Link href={getPostLoginRoute(user)} className={primaryClass}>
        <LayoutDashboard aria-hidden="true" className="h-5 w-5" />
        {onBand ? t("cta.userButton") : t("hero.dashboard")}
      </Link>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link href="/login" className={primaryClass}>
        <LogIn aria-hidden="true" className="h-5 w-5" />
        {onBand ? t("cta.guestButton") : t("hero.login")}
      </Link>
      {!onBand && (
        <Link
          href="/register"
          className={cn(PRIMARY, "border border-app-border bg-app-surface text-app-text hover:border-app-primary hover:text-app-primary")}
        >
          <UserPlus aria-hidden="true" className="h-5 w-5" />
          {t("hero.join")}
        </Link>
      )}
    </div>
  );
}

// The band's heading follows the same signed-in state as its button.
export function HomeBandText() {
  const t = useTranslations("HomePage.cta");
  const { data: user } = useMe();

  return (
    <div>
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{user ? t("userTitle") : t("guestTitle")}</h2>
      <p className="mt-2 text-base text-white/80">{user ? t("userBody") : t("guestBody")}</p>
    </div>
  );
}
