// Shapes from the backend dashboard module. Money is PAISA; dates are ISO strings.
import type { CashAccountKind, HeadRole, Transaction } from "@/features/collections/types";
import type { LoanStatus } from "@/features/loans/types";
import type { MemberStatus } from "@/features/members/types";
import type { IncomeExpenseTotals, YearEndKind } from "@/features/year-end/types";

export type FlowKey =
  | "shareDeposits"
  | "shareRefunds"
  | "amanotDeposits"
  | "amanotWithdrawals"
  | "stayiDeposits"
  | "stayiRefunds"
  | "serviceCharge"
  | "dividend"
  | "loanDisbursed"
  | "loanPrincipalRepaid"
  | "loanInterest";

// GET /dashboard/overview?fiscalYear= (admins)
export type AdminOverview = {
  fiscalYear: string;
  from: string;
  asOf: string;
  members: { total: number; byStatus: Record<MemberStatus, number>; joinedThisYear: number };
  memberBalances: { share: number; amanot: number; stayi: number; loanOutstanding: number };
  cash: {
    cashInHand: number;
    bank: number;
    total: number;
    accounts: { _id: string; name: string; accountKind: CashAccountKind; balance: number }[];
  };
  flows: Record<FlowKey, number>;
  incomeExpense: IncomeExpenseTotals;
  funds: { headId: string; nameBn: string; role: HeadRole | null; balance: number }[];
  monthly: { month: string; deposits: number; withdrawals: number }[];
  loans: { applied: number; approved: number; active: number; outstanding: number; overdueInstallments: number; overdueAmount: number };
  fiscalYearStatus: { hasEnded: boolean; isClosed: boolean; lockUntil: string | null; completedSteps: YearEndKind[] };
  pendingActions: {
    loanApplications: number;
    loansToDisburse: number;
    overdueInstallments: number;
    serviceChargeDue: { members: number; amount: number };
    yearEnd: { fiscalYear: string; nextStep: YearEndKind } | null;
  };
};

// GET /dashboard/my-overview (a member, own numbers only)
export type MyOverview = {
  member: { memberNo: string; nameBn: string; status: MemberStatus; joinDate: string };
  balances: { share: number; amanot: number; stayi: number; loanOutstanding: number };
  loan: {
    loanNo: string;
    status: LoanStatus;
    principal: number;
    nextInstallment: { installmentNo: number; dueDate: string; amount: number } | null;
    overdueInstallments: number;
    remainingInstallments: number;
  } | null;
  lastDividend: { fiscalYear: string; transactionDate: string; amount: number; base: number } | null;
  serviceChargeDue: number;
  recentTransactions: Transaction[];
};
