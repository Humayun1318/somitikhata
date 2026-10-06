"use client";

import { useTranslations } from "next-intl";
import { HandCoins, Landmark, PiggyBank, Scale } from "lucide-react";

import { Money } from "@/components/shared/money";
import { StatCard, StatGrid } from "@/components/shared/stat-card";

import type { MyOverview } from "@/features/overview/types";

// The member's four balances, as the samiti's books hold them today.
export function MyBalances({ balances }: { balances: MyOverview["balances"] }) {
  const t = useTranslations("Collections.buckets");

  return (
    <StatGrid>
      <StatCard icon={PiggyBank} label={t("amanot")} value={<Money paisa={balances.amanot} />} />
      <StatCard icon={Scale} label={t("share")} value={<Money paisa={balances.share} />} />
      <StatCard icon={Landmark} label={t("stayi")} value={<Money paisa={balances.stayi} />} />
      <StatCard
        icon={HandCoins}
        tone={balances.loanOutstanding > 0 ? "warning" : "default"}
        label={t("loan")}
        value={<Money paisa={balances.loanOutstanding} />}
      />
    </StatGrid>
  );
}
