import { toDhakaDateString } from "./dhaka-date";

// The samiti's year runs 1 July – 30 June, the same fixed start the backend
// uses for transaction numbers (utils/fiscalYear.ts).
const FISCAL_YEAR_START_MONTH = 7;

// First day (YYYY-MM-DD) of the fiscal year a Dhaka day falls in.
// "2026-10-04" -> "2026-07-01", "2027-03-15" -> "2026-07-01".
export function fiscalYearStart(day: string = toDhakaDateString()): string {
  const [year, month] = day.split("-").map(Number);
  const startYear = month >= FISCAL_YEAR_START_MONTH ? year : year - 1;
  return `${startYear}-${String(FISCAL_YEAR_START_MONTH).padStart(2, "0")}-01`;
}
