import { z } from "zod";

import type { HeadKind, HeadRole, HeadSection } from "@/features/collections/types";

import { SECTIONS_BY_KIND, type CreateLedgerHeadPayload, type LedgerHead, type UpdateLedgerHeadPayload } from "./types";

type Translate = (key: string) => string;

// Mirrors ledgerHead.validation.ts. `t` is useTranslations("LedgerHeads").
export function ledgerHeadSchema(t: Translate) {
  return z
    .object({
      nameBn: z.string().trim().min(2, t("validation.nameBnShort")).max(60, t("validation.nameTooLong")),
      nameEn: z.string().trim().max(60, t("validation.nameTooLong")),
      kind: z.string().min(1, t("validation.kind")),
      section: z.string(),
      // "" = no role. Only offered for a fund head.
      role: z.string(),
      displayOrder: z
        .string()
        .trim()
        .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) <= 9999), t("validation.order")),
    })
    .superRefine((values, context) => {
      const allowed = SECTIONS_BY_KIND[values.kind as HeadKind];
      if (allowed && !allowed.includes(values.section as HeadSection)) {
        context.addIssue({ code: "custom", path: ["section"], message: t("validation.section") });
      }
    });
}

export type LedgerHeadInput = z.infer<ReturnType<typeof ledgerHeadSchema>>;

export const LEDGER_HEAD_FIELDS: (keyof LedgerHeadInput)[] = ["nameBn", "nameEn", "kind", "section", "role", "displayOrder"];

export function toCreateLedgerHeadPayload(values: LedgerHeadInput): CreateLedgerHeadPayload {
  const kind = values.kind as HeadKind;
  return {
    nameBn: values.nameBn.trim(),
    ...(values.nameEn.trim() && { nameEn: values.nameEn.trim() }),
    kind,
    ...(SECTIONS_BY_KIND[kind] && { section: values.section as HeadSection }),
    ...(values.displayOrder.trim() && { displayOrder: Number(values.displayOrder) }),
    ...(kind === "fund" && values.role && { role: values.role as HeadRole }),
  };
}

// Only what changed. The backend can't clear a name, so an emptied English
// name is sent as "" (allowed: max 60, no minimum).
export function toUpdateLedgerHeadPayload(values: LedgerHeadInput, head: LedgerHead): UpdateLedgerHeadPayload {
  const payload: UpdateLedgerHeadPayload = {};
  const nameBn = values.nameBn.trim();
  const nameEn = values.nameEn.trim();
  const order = values.displayOrder.trim() === "" ? 0 : Number(values.displayOrder);

  if (nameBn !== head.nameBn) payload.nameBn = nameBn;
  if (nameEn !== (head.nameEn ?? "")) payload.nameEn = nameEn;
  if (SECTIONS_BY_KIND[head.kind] && values.section !== head.section) payload.section = values.section as HeadSection;
  if (order !== head.displayOrder) payload.displayOrder = order;
  if (head.kind === "fund" && values.role !== (head.role ?? "")) {
    payload.role = values.role ? (values.role as HeadRole) : null;
  }
  return payload;
}
