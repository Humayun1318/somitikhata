"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CircleAlert, KeyRound, LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import { useMemberAccount } from "../hooks/use-member-account";
import type { AccountTarget } from "../types";

import { AccountStatusBadge } from "./account-status-badge";
import { ResetPasswordDialog } from "./reset-password-dialog";

type MemberLoginSectionProps = {
  /** The Member _id (the login account is found by it). */
  memberId: string;
  memberNo: string;
  name: string;
  /** Load only while the details dialog is open. */
  enabled?: boolean;
};

// "Login account" part of Member details (admin): the member's sign-in status
// and the Reset password action for a member who forgot their password.
// The account status follows the member status, so it is changed there.
export function MemberLoginSection({ memberId, memberNo, name, enabled = true }: MemberLoginSectionProps) {
  const t = useTranslations("UserAccount");
  const format = useFormatter();
  const { data: account, isPending, isError, isFetching, refetch } = useMemberAccount(memberId, enabled);
  const [resetKey, setResetKey] = useState(0);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const lastLogin = account?.lastLogin
    ? format.dateTime(new Date(account.lastLogin), { dateStyle: "medium", timeStyle: "short", timeZone: DHAKA_TIME_ZONE })
    : t("login.never");
  const target: AccountTarget | null = account
    ? { id: account._id, name, identifier: memberNo, status: account.status, kind: "member" }
    : null;

  const openReset = () => {
    setResetKey((key) => key + 1);
    setIsResetOpen(true);
  };
  const closeReset = () => setIsResetOpen(false);
  const retry = () => void refetch();

  return (
    <section aria-labelledby="member-login-title" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <LockKeyhole aria-hidden="true" className="h-4 w-4 text-app-primary" />
          <h3 id="member-login-title" className="text-sm font-semibold text-app-text">
            {t("login.title")}
          </h3>
        </div>
        {account && (
          <Button type="button" variant="outline" onClick={openReset} className="min-h-9 gap-1.5 px-3 text-xs">
            <KeyRound aria-hidden="true" className="h-3.5 w-3.5" />
            {t("reset.open")}
          </Button>
        )}
      </div>

      {isPending && <div aria-busy="true" className="h-20 animate-pulse rounded-2xl bg-app-surface-muted" />}

      {isError && account === undefined && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <span className="inline-flex items-center gap-2">
            <CircleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
            {t("login.error")}
          </span>
          <Button type="button" variant="outline" onClick={retry} isLoading={isFetching} className="min-h-9 px-3 text-xs">
            {t("login.retry")}
          </Button>
        </div>
      )}

      {account === null && (
        <p className="rounded-2xl border border-dashed border-app-border p-4 text-sm text-app-text-muted">{t("login.none")}</p>
      )}

      {account && (
        <dl className="grid gap-x-6 gap-y-3 rounded-2xl border border-app-border p-4 sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs font-medium text-app-text-muted">{t("login.status")}</dt>
            <dd className="mt-1">
              <AccountStatusBadge status={account.status} />
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs font-medium text-app-text-muted">{t("login.lastLogin")}</dt>
            <dd className={account.lastLogin ? "mt-1 text-sm text-app-text" : "mt-1 text-sm text-app-text-muted"}>
              {lastLogin}
            </dd>
          </div>
          <div className="min-w-0 sm:col-span-2">
            <dt className="text-xs font-medium text-app-text-muted">{t("login.password")}</dt>
            <dd className="mt-1 text-sm text-app-text">
              {account.mustChangePassword ? t("login.firstPassword") : t("login.ownPassword")}
            </dd>
          </div>
        </dl>
      )}

      {target && <ResetPasswordDialog key={resetKey} open={isResetOpen} onClose={closeReset} account={target} />}
    </section>
  );
}
