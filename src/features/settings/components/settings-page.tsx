"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarClock, Info, Pencil } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { ListError, ListLoading } from "@/components/shared/list-states";
import { Button } from "@/components/ui/button";
import { useMe } from "@/features/auth/hooks/use-me";

import { useSettings } from "../hooks/use-settings";
import { SETTING_GROUPS } from "../setting-keys";
import { formatSettingValue } from "../setting-values";
import type { SettingFormat, SettingSummary } from "../types";

import { SettingEditDialog } from "./setting-edit-dialog";

type EditTarget = { setting: SettingSummary; format: SettingFormat; min: number; key: number };

// Seeded values start at 1970-01-01 ("always"), shown as "from the start".
const isFromStart = (date: string) => new Date(date).getUTCFullYear() < 2000;

// GET /settings: every rule the app calculates with. Only a super admin can
// change one; a change is a new version from a chosen date.
export function SettingsPage() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const { data: user } = useMe();
  const isSuperAdmin = user?.role === "super_admin";
  const settings = useSettings();
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const byKey = new Map((settings.data ?? []).map((setting) => [setting.key, setting]));
  const dateFormat = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeZone: "Asia/Dhaka",
  });
  const sinceText = (setting: SettingSummary) => {
    if (!setting.effectiveFrom) return "";
    return isFromStart(setting.effectiveFrom)
      ? t("fromStart")
      : t("since", { date: dateFormat.format(new Date(setting.effectiveFrom)) });
  };

  // Everything a row shows, worked out before rendering.
  const groups = SETTING_GROUPS.map((group) => ({
    id: group.id,
    rows: group.settings.map(({ key, format, min = 0, readOnly = false }) => {
      const setting = byKey.get(key);
      const value = setting?.value ?? null;
      const upcoming = setting?.upcoming;
      return {
        key,
        format,
        min,
        readOnly,
        setting,
        valueText: value === null ? null : formatSettingValue(format, value, locale),
        sinceText: setting && value !== null ? sinceText(setting) : "",
        upcomingText: upcoming
          ? t("upcoming", {
              value: formatSettingValue(format, upcoming.value, locale),
              date: dateFormat.format(new Date(upcoming.effectiveFrom)),
            })
          : "",
        canEdit: isSuperAdmin && !readOnly && !!setting,
      };
    }),
  }));

  const openEdit = (setting: SettingSummary | undefined, format: SettingFormat, min: number) => {
    if (!setting) return;
    setEditTarget((current) => ({ setting, format, min, key: (current?.key ?? 0) + 1 }));
    setIsEditOpen(true);
  };
  const closeEdit = () => setIsEditOpen(false);
  const retry = () => void settings.refetch();

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      {!isSuperAdmin && (
        <p className="flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {t("readOnlyNote")}
        </p>
      )}

      {settings.isPending && <ListLoading rows={4} />}
      {settings.isError && !settings.data && (
        <ListError title={t("error")} retryLabel={t("retry")} onRetry={retry} isRetrying={settings.isFetching} />
      )}

      {settings.data &&
        groups.map((group) => (
          <section key={group.id} className="rounded-2xl border border-app-border bg-app-surface">
            <div className="border-b border-app-border px-4 py-3 sm:px-5">
              <h2 className="font-semibold text-app-text">{t(`groups.${group.id}.title`)}</h2>
              <p className="mt-0.5 text-xs text-app-text-muted">{t(`groups.${group.id}.body`)}</p>
            </div>
            <ul className="divide-y divide-app-border">
              {group.rows.map((row) => (
                <li
                  key={row.key}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="min-w-0 sm:max-w-md">
                    <p className="font-medium text-app-text">{t(`keys.${row.key}.label`)}</p>
                    <p className="mt-0.5 text-xs text-app-text-muted">{t(`keys.${row.key}.help`)}</p>
                    {row.readOnly && <p className="mt-1 text-xs text-amber-700">{t(`keys.${row.key}.readOnly`)}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="text-left sm:text-right">
                      {row.valueText && (
                        <p className="text-lg font-semibold tabular-nums text-app-text">{row.valueText}</p>
                      )}
                      {!row.valueText && (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                          {t(`keys.${row.key}.unset`)}
                        </span>
                      )}
                      {row.sinceText && <p className="text-xs text-app-text-muted">{row.sinceText}</p>}
                      {row.upcomingText && (
                        <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800">
                          <CalendarClock aria-hidden="true" className="h-3 w-3" />
                          {row.upcomingText}
                        </p>
                      )}
                    </div>
                    {row.canEdit && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openEdit(row.setting, row.format, row.min)}
                        className="min-h-9 shrink-0 gap-1.5 px-3 py-1.5 text-xs"
                      >
                        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                        {t("change")}
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}

      {editTarget && (
        <SettingEditDialog
          key={editTarget.key}
          open={isEditOpen}
          onClose={closeEdit}
          setting={editTarget.setting}
          format={editTarget.format}
          min={editTarget.min}
        />
      )}
    </div>
  );
}
