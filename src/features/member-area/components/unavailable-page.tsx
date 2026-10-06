"use client";

import { useTranslations } from "next-intl";
import { ArrowUpRight, FilePlus, Settings, UserPlus, type LucideIcon } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";
import { PageHeader } from "@/components/shared/page-header";

// Pages the backend does not support yet. Each says what it will do and
// what to do today, and links back somewhere that works.
const PAGES = {
  depositRequest: { icon: ArrowUpRight, titleKey: "depositRequest", backHref: "/member/savings" },
  applyLoan: { icon: FilePlus, titleKey: "applyLoan", backHref: "/member/loans" },
  memberSettings: { icon: Settings, titleKey: "settings", backHref: "/member/profile" },
  pendingMembers: { icon: UserPlus, titleKey: "pendingMembers", backHref: "/admin/members" },
} satisfies Record<string, { icon: LucideIcon; titleKey: string; backHref: string }>;

export type UnavailablePageName = keyof typeof PAGES;

export function UnavailablePage({ name }: { name: UnavailablePageName }) {
  const t = useTranslations("Unavailable");
  const page = PAGES[name];

  return (
    <div className="space-y-6">
      <PageHeader titleKey={page.titleKey} />
      <ComingSoon icon={page.icon} body={t(`${name}.body`)} hint={t(`${name}.hint`)} backHref={page.backHref} backLabel={t(`${name}.back`)} />
    </div>
  );
}
