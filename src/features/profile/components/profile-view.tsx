"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IdCard, KeyRound, Mail, Phone, ShieldAlert, UserRound } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/hooks/use-me";
import { getRoleArea } from "@/features/auth/role-routes";
import { cn } from "@/lib/cn";

import { ChangePasswordDialog } from "./change-password-dialog";

const CARD = "rounded-2xl border border-app-border bg-app-surface shadow-xs";
const ICON_TILE =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-surface-muted text-app-text-muted";

// Shared by /admin/profile and /member/profile. AuthGate has already loaded the
// user, so useMe() returns it from the query cache without a new request.
export function ProfileView() {
  const t = useTranslations("Profile");
  const { data: user } = useMe();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  // New key per open remounts the dialog, so its form and errors start fresh.
  const [changePasswordKey, setChangePasswordKey] = useState(0);

  const isStaff = getRoleArea(user?.role ?? "member") === "admin";
  const name = user?.name ?? "";
  const identifier = (isStaff ? user?.staffNo : user?.memberNo) ?? "";
  const identifierLabel = isStaff ? t("fields.staffNo") : t("fields.memberNo");
  const mustChangePassword = !!user?.mustChangePassword;

  // Unknown role/status strings from the API show as-is instead of breaking.
  const roleKey = `roles.${user?.role ?? ""}`;
  const statusKey = `status.${user?.status ?? ""}`;
  const roleLabel = t.has(roleKey) ? t(roleKey) : (user?.role ?? "");
  const statusLabel = t.has(statusKey) ? t(statusKey) : (user?.status ?? "");
  const isActive = user?.status === "active";

  const notProvided = t("notProvided");
  const details = [
    { key: "name", icon: UserRound, label: t("fields.name"), value: name },
    { key: "id", icon: IdCard, label: identifierLabel, value: identifier, mono: true },
    { key: "phone", icon: Phone, label: t("fields.phone"), value: user?.phone ?? "" },
    { key: "email", icon: Mail, label: t("fields.email"), value: user?.email ?? "" },
  ].map((row) => ({ ...row, isEmpty: !row.value, value: row.value || notProvided }));

  const openChangePassword = () => {
    setChangePasswordKey((key) => key + 1);
    setIsChangePasswordOpen(true);
  };
  const closeChangePassword = () => setIsChangePasswordOpen(false);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <header className="motion-safe:animate-fade-in-up">
        <p className="text-xs font-semibold uppercase tracking-wider text-app-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-app-text">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-app-text-muted">{t("subtitle")}</p>
      </header>

      {mustChangePassword && (
        <section
          role="alert"
          className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 motion-safe:animate-fade-in-up sm:flex-row sm:items-center sm:p-5"
        >
          <div className="flex flex-1 gap-3">
            <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <h2 className="text-sm font-semibold text-amber-900">{t("mustChangeTitle")}</h2>
              <p className="mt-1 text-sm text-amber-800">{t("mustChangeBody")}</p>
            </div>
          </div>
          <Button onClick={openChangePassword} className="w-full shrink-0 sm:w-auto">
            {t("mustChangeAction")}
          </Button>
        </section>
      )}

      {/* One column on mobile/tablet. From lg: profile card left, details right. */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
        <section className={cn(CARD, "overflow-hidden motion-safe:animate-fade-in-up lg:sticky lg:top-0")}>
          <div
            aria-hidden="true"
            className="h-20 bg-linear-to-br from-app-primary/15 via-app-primary/5 to-transparent sm:h-24"
          />
          <div className="-mt-10 flex flex-col gap-3 px-5 pb-5 sm:-mt-12 sm:flex-row sm:items-end sm:gap-5 sm:px-6 sm:pb-6 lg:flex-col lg:items-start lg:gap-3">
            {/* Solid backing so the tinted band doesn't show through the avatar. */}
            <span className="w-fit rounded-full bg-app-surface ring-4 ring-app-surface">
              <UserAvatar name={name} size="lg" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-semibold text-app-text sm:text-2xl">{name}</h2>
              {identifier && (
                <p className="mt-0.5 text-sm text-app-text-muted">
                  {identifierLabel}:{" "}
                  <span className="font-mono font-medium text-app-text">{identifier}</span>
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {roleLabel && (
                  <span className="inline-flex items-center rounded-full bg-app-primary/10 px-2.5 py-1 text-xs font-semibold text-app-primary">
                    {roleLabel}
                  </span>
                )}
                {statusLabel && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                      isActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-amber-500")}
                    />
                    {statusLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-4 sm:space-y-6">
          <section
            aria-labelledby="profile-personal-info"
            className={cn(CARD, "motion-safe:animate-fade-in-up")}
          >
            <div className="px-5 pt-5 sm:px-6">
              <h2 id="profile-personal-info" className="text-base font-semibold text-app-text">
                {t("personalInfo")}
              </h2>
              <p className="mt-1 text-sm text-app-text-muted">{t("personalInfoHint")}</p>
            </div>
            <dl className="mt-3 divide-y divide-app-border">
              {details.map(({ key, icon: Icon, label, value, mono, isEmpty }) => (
                <div key={key} className="flex items-center gap-3.5 px-5 py-3.5 sm:px-6">
                  <span className={ICON_TILE}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <dt className="text-xs font-medium text-app-text-muted">{label}</dt>
                    <dd
                      className={cn(
                        "mt-0.5 break-words text-sm font-medium",
                        isEmpty ? "font-normal italic text-app-text-muted" : "text-app-text",
                        mono && !isEmpty && "font-mono",
                      )}
                    >
                      {value}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          <section
            aria-labelledby="profile-security"
            className={cn(CARD, "p-5 motion-safe:animate-fade-in-up sm:p-6")}
          >
            <h2 id="profile-security" className="text-base font-semibold text-app-text">
              {t("security")}
            </h2>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3.5">
                <span className={ICON_TILE}>
                  <KeyRound aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-app-text">{t("password")}</p>
                  <p className="mt-0.5 text-sm text-app-text-muted">{t("passwordHint")}</p>
                </div>
              </div>
              <Button variant="outline" onClick={openChangePassword} className="w-full sm:w-auto">
                {t("changePassword")}
              </Button>
            </div>
          </section>
        </div>
      </div>

      <ChangePasswordDialog
        key={changePasswordKey}
        open={isChangePasswordOpen}
        onClose={closeChangePassword}
      />
    </div>
  );
}
