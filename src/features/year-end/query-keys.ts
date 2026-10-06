import type { YearEndKind } from "./types";

export const yearEndKeys = {
  all: ["year-end"] as const,
  status: (fiscalYear: string) => [...yearEndKeys.all, "status", fiscalYear] as const,
  run: (fiscalYear: string, kind: YearEndKind) => [...yearEndKeys.all, "run", fiscalYear, kind] as const,
  // Previews are reads too (POST, nothing written); they go stale after any run.
  preview: (fiscalYear: string, kind: YearEndKind, amount?: number) =>
    [...yearEndKeys.all, "preview", fiscalYear, kind, amount ?? null] as const,
};
