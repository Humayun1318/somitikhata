"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeftRight, Building2, HandCoins, Landmark, ReceiptText, X, type LucideIcon } from "lucide-react";

import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import {
  useCashAccounts,
  useHeadBalances,
  useSocietyEntries,
  useTransactionTypes,
} from "../hooks/use-collection-queries";
import { useTransactionDialogs } from "../hooks/use-transaction-dialogs";
import { useTransactionListParams } from "../hooks/use-transaction-list-params";
import { typeName } from "../transaction-effects";

import { CollectionsHeader } from "./collections-header";
import { SocietyEntryDialog, type SocietyEntryKind } from "./society-entry-dialog";
import { TransactionDialogs } from "./transaction-dialogs";
import { TransactionList } from "./transaction-list";
import { TransferDialog } from "./transfer-dialog";

type EntryAction = { kind: SocietyEntryKind | "transfer"; icon: LucideIcon };

const ACTIONS: EntryAction[] = [
  { kind: "income", icon: HandCoins },
  { kind: "expense", icon: ReceiptText },
  { kind: "asset", icon: Building2 },
  { kind: "liability", icon: Landmark },
  { kind: "transfer", icon: ArrowLeftRight },
];

type OpenEntry = { kind: SocietyEntryKind | "transfer"; key: number };

// The samiti's own money (no member): income, expense, assets/receivables,
// liabilities and transfers between its accounts, with the list below.
// ?head=<id> (from the ledger heads page) shows one head's entries.
export function SocietyPage() {
  const t = useTranslations("Society");
  const tKinds = useTranslations("LedgerHeads.kinds");
  const locale = useLocale();
  const list = useTransactionListParams();
  const entries = useSocietyEntries(list.params);
  const heads = useHeadBalances();
  const accounts = useCashAccounts();
  const catalog = useTransactionTypes();
  const dialogs = useTransactionDialogs();
  const [entry, setEntry] = useState<OpenEntry | null>(null);
  const [isEntryOpen, setIsEntryOpen] = useState(false);

  const headList = heads.data ?? [];
  const selectedHead = headList.find((head) => head._id === list.params.head);
  const actions = ACTIONS.map(({ kind, icon }) => ({ kind, icon, label: t(`actions.${kind}`) }));
  const entryKind = entry?.kind;

  const openEntry = (kind: SocietyEntryKind | "transfer") => {
    setEntry((current) => ({ kind, key: (current?.key ?? 0) + 1 }));
    setIsEntryOpen(true);
  };
  const closeEntry = () => setIsEntryOpen(false);
  const clearHead = () => list.setParams({ head: "" });

  return (
    <div className="space-y-5">
      <CollectionsHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {actions.map(({ kind, icon: Icon, label }) => (
          <Button
            key={kind}
            type="button"
            variant={kind === "transfer" ? "outline" : "primary"}
            onClick={() => openEntry(kind)}
            className="gap-2 px-4 last:col-span-2 sm:last:col-span-1"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {selectedHead && (
        <section className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-xs font-medium text-app-text-muted">{t("headFilterTitle")}</p>
            <p className="truncate text-lg font-semibold text-app-text">{typeName(selectedHead, locale)}</p>
            <p className="text-xs text-app-text-muted">{tKinds(selectedHead.kind)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="sm:text-right">
              <p className="text-[11px] font-medium text-app-text-muted">{t("headBalance")}</p>
              <Money paisa={selectedHead.balance} className="text-xl font-bold text-app-text" />
            </div>
            <Button type="button" variant="outline" onClick={clearHead} className="min-h-9 gap-1.5 px-3 py-1.5 text-xs">
              <X aria-hidden="true" className="h-3.5 w-3.5" />
              {t("allHeads")}
            </Button>
          </div>
        </section>
      )}

      <TransactionList
        variant="society"
        query={entries}
        params={list.params}
        setParams={list.setParams}
        hasFilters={list.hasFilters}
        onClearFilters={list.clearFilters}
        catalog={catalog}
        onView={dialogs.openDetails}
        heads={headList}
        accounts={accounts.data ?? []}
      />

      <p className="text-xs text-app-text-muted">
        {t("headsHint")}{" "}
        <Link href="/admin/collections/heads" className="font-semibold text-app-primary hover:underline">
          {t("headsLink")}
        </Link>
      </p>

      {entry && entryKind !== "transfer" && entryKind && (
        <SocietyEntryDialog
          key={entry.key}
          open={isEntryOpen}
          onClose={closeEntry}
          kind={entryKind}
          catalog={catalog}
          defaultHeadId={list.params.head}
        />
      )}
      {entry && entryKind === "transfer" && <TransferDialog key={entry.key} open={isEntryOpen} onClose={closeEntry} />}
      <TransactionDialogs dialogs={dialogs} catalog={catalog} />
    </div>
  );
}
