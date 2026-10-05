// Shapes from the backend transaction, transactionType and cashAccount modules.
// Money is always PAISA (integer). Dates are ISO strings (Dhaka midnight for day-only dates).

export type CashEffect = "in" | "out" | "none";
export type Bucket = "share" | "amanot" | "stayi" | "loan";
export const BUCKETS: Bucket[] = ["share", "amanot", "stayi", "loan"];

export type TypeGroup =
  | "member_deposit"
  | "member_withdrawal"
  | "reversal"
  | "member_charge"
  | "loan"
  | "distribution"
  | "asset"
  | "income"
  | "expense"
  | "liability"
  | "transfer"
  | "opening";

export type EffectSign = "plus" | "minus";
export type MemberEffect = { bucket: Bucket; sign: EffectSign };

// A samiti ledger head's kind (backend ledgerHead.interface.ts)
export type HeadKind = "income" | "expense" | "asset" | "liability" | "fund";

// GET /transaction-types
export type TransactionType = {
  _id: string;
  code: string;
  nameBn: string;
  nameEn?: string;
  typeGroup: TypeGroup;
  cashEffect: CashEffect;
  memberEffects: MemberEffect[];
  memberRule: "required" | "optional" | "none";
  /** Set on types that post to a ledger head; headKinds = the head kinds it accepts. */
  headEffect?: EffectSign;
  headKinds?: HeadKind[];
  reversalTypeCode?: string;
  isActive: boolean;
};

// GET /cash-accounts
export type CashAccountKind = "cash" | "bank";
export type CashAccountStatus = "active" | "closed";
export type CashAccount = {
  _id: string;
  name: string;
  accountKind: CashAccountKind;
  bankName?: string;
  status: CashAccountStatus;
};

// GET /transactions/cash-balances/:id
export type CashAccountBalance = {
  cashAccountId: string;
  name: string;
  accountKind: CashAccountKind;
  balance: number; // paisa
};

// GET /transactions/balances/:memberNo
export type BucketBalance = { bucket: Bucket; total: number }; // paisa

// A ledger / cash book row (the backend populates these references).
export type Transaction = {
  _id: string;
  transactionNo: string;
  transactionType: { _id: string; code: string; nameBn: string; nameEn?: string };
  member?: { _id: string; memberNo: string; nameBn: string; phone?: string };
  cashAccount?: { _id: string; name: string };
  head?: { _id: string; nameBn: string; nameEn?: string; kind: HeadKind };
  /** The other half of a transfer (and of a reversed transfer). */
  linkedTransaction?: { _id: string; transactionNo: string; cashAccount?: string } | null;
  amount: number; // paisa, always > 0; direction comes from the type
  transactionDate: string;
  voucherNo?: string;
  description?: string;
  recordedBy?: { _id: string; name: string; email?: string };
  reversalOf?: { _id: string; transactionNo: string } | null;
  createdAt?: string;
};

// Query params shared by the cash book and the member ledger
// (transaction.builder.config.ts). Empty string = not set.
export type TransactionListParams = {
  page: number;
  limit: number;
  search: string;
  transactionType: string; // type _id
  startTransactionDate: string; // YYYY-MM-DD (sent as whole Dhaka days)
  endTransactionDate: string;
  minAmount: string; // taka, as typed (sent as paisa)
  maxAmount: string;
  sort: string; // "", "field" or "-field"
  head: string; // ledger head _id (samiti entries list)
  cashAccount: string; // cash account _id (samiti entries list)
};

// POST /transactions/create (amount in TAKA, max 2 decimals)
export type CreateTransactionPayload = {
  memberNo: string;
  typeCode: string;
  cashAccountId: string;
  amount: number;
  transactionDate: string;
  voucherNo?: string;
  description?: string;
};

// POST /transactions/opening (super admin)
export type CreateOpeningPayload = {
  typeCode: string;
  memberNo?: string;
  cashAccountId?: string;
  headId?: string;
  amount: number;
  transactionDate: string;
  description?: string;
};

// POST /transactions/society (amount in TAKA)
export type CreateSocietyEntryPayload = {
  typeCode: string;
  headId: string;
  cashAccountId: string;
  amount: number;
  transactionDate: string;
  voucherNo?: string;
  description?: string;
};

// POST /transactions/transfer (amount in TAKA)
export type CreateTransferPayload = {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transactionDate: string;
  voucherNo?: string;
  description?: string;
};
export type TransferResult = { transferOut: Transaction; transferIn: Transaction };

// GET /transactions/head-balances: every head with its balance (paisa)
export type HeadSection = "fixed_asset" | "current_asset" | "current_liability" | "non_current_liability";
// The fund heads the year-end profit appropriation posts to (one head each)
export type HeadRole = "reserve_fund" | "coop_dev_fund" | "welfare_fund" | "undistributed_profit";
export type HeadBalance = {
  _id: string;
  nameBn: string;
  nameEn?: string;
  kind: HeadKind;
  section?: HeadSection;
  displayOrder: number;
  role?: HeadRole;
  status: CashAccountStatus;
  balance: number;
};
/** Optional period, YYYY-MM-DD. Without it: every row up to now. */
export type HeadBalanceRange = { from?: string; asOf?: string };

// GET /transactions/opening-summary: the go-live check
export type OpeningSummary = {
  members: Record<Bucket, { total: number; memberCount: number }>;
  cashAccounts: (CashAccount & { balance: number })[];
  heads: HeadBalance[];
  totals: { cash: number; assets: number; liabilities: number; difference: number };
};

// POST /transactions/reverse
export type ReversePayload = { transactionNo: string; reason: string };

// POST /cash-accounts/create (super admin)
export type CreateCashAccountPayload = {
  name: string;
  accountKind: CashAccountKind;
  bankName?: string;
};
