import { DHAKA_TIME_ZONE, toDhakaDateString } from "@/lib/dhaka-date";
import { formatPaisa, takaToPaisa } from "@/lib/money";

import type { SettingFormat } from "./types";

const numberFormat = (locale: string) =>
  new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-IN", { maximumFractionDigits: 2 });

// A stored value as the screen shows it: "95%", "৳1,928.00", "July", "30 Jun 2026".
export function formatSettingValue(format: SettingFormat, value: string, locale: string): string {
  const intlLocale = locale === "bn" ? "bn-BD" : "en-GB";
  if (format === "percent") return `${numberFormat(locale).format(Number(value))}%`;
  if (format === "money") return formatPaisa(Number(value), locale);
  if (format === "month") {
    return new Intl.DateTimeFormat(intlLocale, { month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2000, Number(value) - 1, 1)),
    );
  }
  return new Intl.DateTimeFormat(intlLocale, { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }).format(new Date(value));
}

// Stored value -> what the edit form starts with ("192800" -> "1928").
export function toSettingInput(format: SettingFormat, value: string | null): string {
  if (value === null) return "";
  if (format === "money") return String(Number(value) / 100);
  if (format === "date") return toDhakaDateString(value);
  return value;
}

// What the form sends: money in paisa, the rest as typed.
export function toStoredSettingValue(format: SettingFormat, input: string): string {
  const text = input.trim();
  return format === "money" ? String(takaToPaisa(text)) : text;
}
