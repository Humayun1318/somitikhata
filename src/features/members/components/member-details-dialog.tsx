"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Pencil, RefreshCw } from "lucide-react";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { DialogActions } from "@/components/ui/dialog-actions";
import { DHAKA_TIME_ZONE } from "@/lib/dhaka-date";

import type { AuditUser, Member } from "../types";

import { MemberStatusBadge } from "./member-status-badge";

type MemberDetailsDialogProps = {
  open: boolean;
  onClose: () => void;
  member: Member;
  onEdit: () => void;
  onChangeStatus: () => void;
};

type DetailRow = { key: string; label: string; value: string; mono?: boolean };

const auditName = (user: AuditUser | string | undefined) =>
  typeof user === "object" ? user.name : undefined;

// Read-only view. Uses the row from the list: GET /member already returns
// every member field (plus who added/updated it), so no extra request.
export function MemberDetailsDialog({
  open,
  onClose,
  member,
  onEdit,
  onChangeStatus,
}: MemberDetailsDialogProps) {
  const t = useTranslations("MemberDetails");
  const format = useFormatter();
  const empty = "—";

  const formatDay = (value?: string) =>
    value ? format.dateTime(new Date(value), { dateStyle: "long", timeZone: DHAKA_TIME_ZONE }) : empty;
  const formatMoment = (value?: string) =>
    value
      ? format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short", timeZone: DHAKA_TIME_ZONE })
      : empty;
  const withBy = (when: string, user: AuditUser | string | undefined) => {
    const name = auditName(user);
    return name ? t("by", { when, name }) : when;
  };

  const guardianRelation = member.guardianRelation ? t(`relation.${member.guardianRelation}`) : "";
  const guardian = member.guardianName
    ? [member.guardianName, guardianRelation && `(${guardianRelation})`].filter(Boolean).join(" ")
    : empty;

  const rows: DetailRow[] = [
    { key: "guardian", label: t("fields.guardian"), value: guardian },
    { key: "phone", label: t("fields.phone"), value: member.phone, mono: true },
    { key: "nid", label: t("fields.nid"), value: member.nid, mono: true },
    { key: "dob", label: t("fields.dob"), value: formatDay(member.dob) },
    { key: "joinDate", label: t("fields.joinDate"), value: formatDay(member.joinDate) },
    ...(member.status === "exited"
      ? [{ key: "exitDate", label: t("fields.exitDate"), value: formatDay(member.exitDate) }]
      : []),
    { key: "admissionFormNo", label: t("fields.admissionFormNo"), value: member.admissionFormNo || empty },
    { key: "createdAt", label: t("fields.createdAt"), value: withBy(formatMoment(member.createdAt), member.createdBy) },
    { key: "updatedAt", label: t("fields.updatedAt"), value: withBy(formatMoment(member.updatedAt), member.updatedBy) },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("title")}
      closeLabel={t("close")}
      size="lg"
      footer={
        <DialogActions
          cancelLabel={t("close")}
          onCancel={onClose}
          actionLabel={t("edit")}
          actionIcon={Pencil}
          onAction={onEdit}
        >
          <Button type="button" variant="outline" onClick={onChangeStatus} className="w-full gap-2 sm:w-auto">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {t("changeStatus")}
          </Button>
        </DialogActions>
      }
    >
      <div className="flex items-center gap-4 rounded-2xl bg-app-surface-muted/60 p-4">
        <UserAvatar name={member.nameEn || member.nameBn} size="md" className="bg-app-surface" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-app-text">{member.nameBn}</p>
          {member.nameEn && <p className="truncate text-sm text-app-text-muted">{member.nameEn}</p>}
          <p className="mt-1 font-mono text-sm font-medium text-app-text">{member.memberNo}</p>
        </div>
        <MemberStatusBadge status={member.status} />
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map(({ key, label, value, mono }) => (
          <div key={key} className="min-w-0 border-b border-app-border pb-3">
            <dt className="text-xs font-medium text-app-text-muted">{label}</dt>
            <dd
              className={`mt-1 break-words text-sm ${value === empty ? "text-app-text-muted" : "text-app-text"} ${mono ? "font-mono" : ""}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
