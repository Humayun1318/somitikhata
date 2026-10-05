import type { HeadBalance, HeadKind, HeadRole, HeadSection } from "@/features/collections/types";

// Shapes from the backend ledgerHead module. A head never stores a balance:
// the list comes from GET /transactions/head-balances (head + its balance).
export type LedgerHead = Omit<HeadBalance, "balance">;

export const HEAD_KINDS: HeadKind[] = ["income", "expense", "asset", "liability", "fund"];

// Same rule as SECTIONS_BY_KIND in the backend: only asset and liability
// heads sit under a section (the উদ্বৃত্ত পত্র groups them).
export const SECTIONS_BY_KIND: Partial<Record<HeadKind, HeadSection[]>> = {
  asset: ["fixed_asset", "current_asset"],
  liability: ["current_liability", "non_current_liability"],
};

// A role marks a fund head as a year-end appropriation target. Only fund
// heads take one, and each role sits on one head at most.
export const HEAD_ROLES: HeadRole[] = ["reserve_fund", "coop_dev_fund", "welfare_fund", "undistributed_profit"];

// POST /ledger-heads/create (super admin)
export type CreateLedgerHeadPayload = {
  nameBn: string;
  nameEn?: string;
  kind: HeadKind;
  section?: HeadSection;
  displayOrder?: number;
  role?: HeadRole;
};

// PATCH /ledger-heads/update/:id (super admin). The kind never changes;
// role: null takes the role off.
export type UpdateLedgerHeadPayload = Partial<Omit<CreateLedgerHeadPayload, "kind" | "role">> & {
  role?: HeadRole | null;
};
