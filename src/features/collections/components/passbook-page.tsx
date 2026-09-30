"use client";

import { useTranslations } from "next-intl";
import { UserSearch } from "lucide-react";

import { ListEmpty, ListError, ListLoading } from "@/components/shared/list-states";

import { useCashAccounts, useLedger, useMemberBalances, useMemberLookup, useTransactionTypes } from "../hooks/use-collection-queries";
import { useTransactionDialogs } from "../hooks/use-transaction-dialogs";
import { useTransactionListParams } from "../hooks/use-transaction-list-params";

import { CollectionsHeader } from "./collections-header";
import { MemberBalances } from "./member-balances";
import { MemberLookupForm } from "./member-lookup-form";
import { TransactionDialogs } from "./transaction-dialogs";
import { TransactionList } from "./transaction-list";

// A member's passbook (?member=LBKS-0001): balances + every transaction.
export function PassbookPage() {
  const t = useTranslations("Passbook");
  const tCollections = useTranslations("Collections");
  const list = useTransactionListParams("member");
  const memberNo = list.scope;

  const lookup = useMemberLookup(memberNo);
  const member = lookup.data;
  const balances = useMemberBalances(member ? memberNo : "");
  const ledger = useLedger(member ? memberNo : "", list.params);
  const catalog = useTransactionTypes();
  const dialogs = useTransactionDialogs();
  const accounts = useCashAccounts();
  const firstActiveAccount = accounts.data?.find((account) => account.status === "active");

  const isNotFound = lookup.error?.status === 404 || lookup.error?.status === 400;
  const showLookupError = !!lookup.error && !isNotFound;
  const retryLookup = () => void lookup.refetch();
  const openRecord = () => dialogs.openRecord({ memberNo: member?.memberNo, cashAccountId: firstActiveAccount?._id });

  return (
    <div className="space-y-5">
      <CollectionsHeader title={t("title")} subtitle={t("subtitle")} />

      <MemberLookupForm key={memberNo} memberNo={memberNo} onLookup={list.setScope} isLooking={lookup.isFetching && !member} />

      {!!memberNo && lookup.isPending && <ListLoading rows={3} />}
      {!memberNo && <ListEmpty icon={UserSearch} title={t("prompt")} />}
      {isNotFound && <ListEmpty icon={UserSearch} title={t("notFound", { memberNo })} />}
      {showLookupError && (
        <ListError title={t("lookupError")} retryLabel={tCollections("retry")} onRetry={retryLookup} isRetrying={lookup.isFetching} />
      )}

      {member && (
        <MemberBalances member={member} balances={balances.data} isBalancesError={balances.isError} onRecord={openRecord} />
      )}

      {member && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-app-text">{t("ledgerTitle")}</h2>
          <TransactionList
            variant="ledger"
            query={ledger}
            params={list.params}
            setParams={list.setParams}
            hasFilters={list.hasFilters}
            onClearFilters={list.clearFilters}
            catalog={catalog}
            onView={dialogs.openDetails}
          />
        </section>
      )}

      <TransactionDialogs dialogs={dialogs} catalog={catalog} />
    </div>
  );
}
