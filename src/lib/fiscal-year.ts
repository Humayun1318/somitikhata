import { toDhakaDateString } from "./dhaka-date";

// The samiti's year runs 1 July – 30 June, the same fixed start the backend
// uses (utils/fiscalYear.ts). Labels look like "2025-26".
const FISCAL_YEAR_START_MONTH = 7;

function startYearOf(day: string): number {
  const [year, month] = day.split("-").map(Number);
  return month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
}

const labelFor = (startYear: number) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

// First day (YYYY-MM-DD) of the fiscal year a Dhaka day falls in.
// "2026-10-04" -> "2026-07-01", "2027-03-15" -> "2026-07-01".
export function fiscalYearStart(day: string = toDhakaDateString()): string {
  return `${startYearOf(day)}-${String(FISCAL_YEAR_START_MONTH).padStart(2, "0")}-01`;
}

// "2026-10-04" -> "2026-27". Default: the year today is in.
export function fiscalYearLabel(day: string = toDhakaDateString()): string {
  return labelFor(startYearOf(day));
}

// The year before a label: "2026-27" -> "2025-26".
export function previousFiscalYear(label: string): string {
  return labelFor(Number(label.slice(0, 4)) - 1);
}

// First and last day of a label: "2025-26" -> 2025-07-01 … 2026-06-30.
export function fiscalYearRange(label: string): { from: string; to: string } {
  const startYear = Number(label.slice(0, 4));
  return { from: `${startYear}-07-01`, to: `${startYear + 1}-06-30` };
}

// The current year and the `count - 1` years before it, newest first.
export function recentFiscalYears(count = 5): string[] {
  const current = startYearOf(toDhakaDateString());
  return Array.from({ length: count }, (_, index) => labelFor(current - index));
}
