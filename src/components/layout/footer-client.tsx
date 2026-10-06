"use client";

import { useTranslations } from "next-intl";

import { useMe } from "@/features/auth/hooks/use-me";
import { getPostLoginRoute } from "@/features/auth/role-routes";
import { Link } from "@/i18n/navigation";

// The two footer parts that depend on the browser: who is signed in, and today's year.
// The rest of the footer is rendered on the server.

export function FooterAccountLinks({ linkClassName }: { linkClassName: string }) {
  const t = useTranslations("Footer");
  const { data: user } = useMe();

  if (user) {
    return (
      <li>
        <Link href={getPostLoginRoute(user)} className={linkClassName}>
          {t("myDashboard")}
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link href="/login" className={linkClassName}>
          {t("login")}
        </Link>
      </li>
      <li>
        <Link href="/register" className={linkClassName}>
          {t("join")}
        </Link>
      </li>
    </>
  );
}

// The page is built ahead of time, so the year comes from the visitor's clock.
export function CurrentYear() {
  return <span suppressHydrationWarning>{new Date().getFullYear()}</span>;
}
