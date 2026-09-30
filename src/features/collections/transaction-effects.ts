import type { CashEffect, MemberEffect, Transaction, TransactionType } from "./types";

type Catalog = Map<string, TransactionType>;

// A row's type as the catalog knows it (undefined for an unknown/inactive type).
export const typeOf = (transaction: Transaction, byCode: Catalog) =>
  byCode.get(transaction.transactionType.code);

// Did cash come in or go out? "none" for entries that don't touch cash.
export function cashEffectOf(transaction: Transaction, byCode: Catalog): CashEffect | undefined {
  return typeOf(transaction, byCode)?.cashEffect;
}

// Which member balances this entry moves, and which way.
export function memberEffectsOf(transaction: Transaction, byCode: Catalog): MemberEffect[] {
  return typeOf(transaction, byCode)?.memberEffects ?? [];
}

export const isReversalEntry = (transaction: Transaction, byCode: Catalog) =>
  !!transaction.reversalOf || typeOf(transaction, byCode)?.typeGroup === "reversal";

// Bangla name in Bangla, English name (if any) in English.
export function typeName(type: { nameBn: string; nameEn?: string }, locale: string) {
  return locale === "bn" ? type.nameBn : type.nameEn || type.nameBn;
}

// Sum of the cash in / cash out amounts in a list of rows (paisa).
export function sumByCashEffect(transactions: Transaction[], byCode: Catalog) {
  return transactions.reduce(
    (totals, transaction) => {
      const effect = cashEffectOf(transaction, byCode);
      if (effect === "in") totals.in += transaction.amount;
      if (effect === "out") totals.out += transaction.amount;
      return totals;
    },
    { in: 0, out: 0 },
  );
}

// A member's balance in one bucket (0 when the backend sent no row for it).
export const balanceOf = (balances: { bucket: string; total: number }[] | undefined, bucket: string) =>
  balances?.find((row) => row.bucket === bucket)?.total ?? 0;
