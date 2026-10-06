import type { Bucket } from "@/features/collections/types";

// A member can't read the transaction-type catalog (admin only), so their own
// passbook reads each row's effect from its system code. These codes are
// seeded by the backend (transactionType.constants.ts) and never change.
const REVERSAL_SUFFIX = "_REVERSAL";

const EFFECTS: Record<string, { bucket: Bucket; sign: 1 | -1 }> = {
  SHARE_DEPOSIT: { bucket: "share", sign: 1 },
  OPENING_SHARE: { bucket: "share", sign: 1 },
  SHARE_REFUND: { bucket: "share", sign: -1 },
  AMANOT_DEPOSIT: { bucket: "amanot", sign: 1 },
  OPENING_AMANOT: { bucket: "amanot", sign: 1 },
  DIVIDEND: { bucket: "amanot", sign: 1 },
  AMANOT_WITHDRAWAL: { bucket: "amanot", sign: -1 },
  SERVICE_CHARGE: { bucket: "amanot", sign: -1 },
  STAYI_AMANOT_DEPOSIT: { bucket: "stayi", sign: 1 },
  OPENING_STAYI_AMANOT: { bucket: "stayi", sign: 1 },
  STAYI_AMANOT_REFUND: { bucket: "stayi", sign: -1 },
  LOAN_DISBURSEMENT: { bucket: "loan", sign: 1 },
  LOAN_REPAYMENT_PRINCIPAL: { bucket: "loan", sign: -1 },
};

/**
 * Which of the member's balances a row changes, and which way (+1 / -1).
 * A reversal flips its original. null: no balance changes (loan interest).
 */
export function memberRowEffect(code: string): { bucket: Bucket; sign: 1 | -1 } | null {
  const isReversal = code.endsWith(REVERSAL_SUFFIX);
  const effect = EFFECTS[isReversal ? code.slice(0, -REVERSAL_SUFFIX.length) : code];
  if (!effect) return null;
  return isReversal ? { bucket: effect.bucket, sign: effect.sign === 1 ? -1 : 1 } : effect;
}
