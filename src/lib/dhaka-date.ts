// The backend stores day-only dates (join date, date of birth, exit date) as
// midnight in Dhaka (UTC+6, no daylight saving). Older records may be stored
// as UTC midnight. Reading them in the Asia/Dhaka zone gives the right day for both.
export const DHAKA_TIME_ZONE = "Asia/Dhaka";

// "YYYY-MM-DD" of a moment as seen in Dhaka. Default: today in Dhaka.
// This is the format <input type="date"> uses.
export function toDhakaDateString(date: Date | string = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DHAKA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

// The whole Dhaka day as exact moments, for range filters (startX / endX).
// A plain "2026-03-01" would be read as UTC midnight and miss the first 6 hours.
export const dhakaDayStart = (date: string) => `${date}T00:00:00.000+06:00`;
export const dhakaDayEnd = (date: string) => `${date}T23:59:59.999+06:00`;
