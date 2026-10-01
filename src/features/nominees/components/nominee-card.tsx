"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Pencil, ShieldCheck, Trash2 } from "lucide-react";

import { formatAddress } from "@/lib/address";
import { cn } from "@/lib/cn";
import { DHAKA_TIME_ZONE, toDhakaDateString } from "@/lib/dhaka-date";

import { isMinorDob } from "../schemas";
import type { Nominee } from "../types";

type NomineeCardProps = {
  nominee: Nominee;
  /** 0 = main nominee, 1 = alternative (the backend lists the oldest first). */
  index: number;
  /** Admin only. Without these the card is read only (member's own profile). */
  onEdit?: () => void;
  onDelete?: () => void;
  /** Why delete is turned off (the last nominee can't be deleted). */
  deleteDisabledReason?: string;
};

type Row = { key: string; label: string; value: string; mono?: boolean };

// One nominee as a compact card: who, relation, contact, ID, address, guardian.
export function NomineeCard({ nominee, index, onEdit, onDelete, deleteDisabledReason }: NomineeCardProps) {
  const t = useTranslations("Nominees");
  const format = useFormatter();
  const empty = "—";

  const relation =
    nominee.relation === "other" && nominee.relationNote ? nominee.relationNote : t(`relation.${nominee.relation}`);
  const isMinor = !!nominee.dob && isMinorDob(toDhakaDateString(nominee.dob));
  const dob = nominee.dob
    ? format.dateTime(new Date(nominee.dob), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE })
    : empty;
  // The ID row is labelled with its type ("Birth certificate"), the number is the value.
  const idLabel = nominee.idType ? t(`idType.${nominee.idType}`) : t("fields.id");
  const guardian = nominee.guardian;

  const rows: Row[] = [
    { key: "phone", label: t("fields.phone"), value: nominee.phone || empty, mono: !!nominee.phone },
    { key: "dob", label: t("fields.dob"), value: dob },
    { key: "id", label: idLabel, value: nominee.idNumber || empty, mono: !!nominee.idNumber },
    { key: "address", label: t("fields.address"), value: formatAddress(nominee.address) || empty },
  ];
  const hasActions = !!onEdit || !!onDelete;
  const isDeleteDisabled = !!deleteDisabledReason;

  return (
    <article className="rounded-2xl border border-app-border bg-app-surface p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-app-primary">
            {index === 0 ? t("card.main") : t("card.alternative")}
          </p>
          <h4 className="mt-0.5 truncate text-base font-semibold text-app-text">{nominee.name}</h4>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-app-surface-muted px-2 py-0.5 text-xs font-medium text-app-text">
              {relation}
            </span>
            {isMinor && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {t("card.minor")}
              </span>
            )}
          </div>
        </div>
        {hasActions && (
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                aria-label={t("card.editFor", { name: nominee.name })}
                title={t("card.edit")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-app-surface-muted hover:text-app-text focus-visible:outline-2 focus-visible:outline-app-focus"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleteDisabled}
                aria-label={t("card.deleteFor", { name: nominee.name })}
                title={deleteDisabledReason ?? t("card.delete")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-app-text-muted transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-app-focus disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-app-text-muted"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </header>

      <dl className="mt-3 grid gap-x-5 gap-y-2.5 border-t border-app-border pt-3 sm:grid-cols-2">
        {rows.map(({ key, label, value, mono }) => (
          <div key={key} className={cn("min-w-0", key === "address" && "sm:col-span-2")}>
            <dt className="text-xs text-app-text-muted">{label}</dt>
            <dd
              className={cn(
                "mt-0.5 break-words text-sm",
                value === empty ? "text-app-text-muted" : "text-app-text",
                mono && "font-mono",
              )}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {guardian && (
        <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-app-surface-muted/60 p-3 text-sm">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-app-primary" />
          <div className="min-w-0">
            <p className="text-xs text-app-text-muted">{t("fields.guardian")}</p>
            <p className="break-words text-app-text">
              {guardian.name} <span className="text-app-text-muted">({guardian.relation})</span>
            </p>
            {guardian.phone && <p className="font-mono text-xs text-app-text-muted">{guardian.phone}</p>}
          </div>
        </div>
      )}
    </article>
  );
}
