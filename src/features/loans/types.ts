// Shapes from the backend loan module. Money is PAISA; dates are ISO strings.

export type LoanStatus = "applied" | "approved" | "rejected" | "active" | "closed";
export const LOAN_STATUSES: LoanStatus[] = ["applied", "approved", "active", "closed", "rejected"];

export type Loan = {
  _id: string;
  loanNo: string;
  member: { _id: string; memberNo: string; nameBn: string; phone?: string };
  principal: number;
  interestRatePercent: number; // yearly, flat
  tenureMonths: number;
  status: LoanStatus;
  appliedAt: string;
  approvedAt?: string; // also set when rejected (the decision date)
  disbursedAt?: string;
  closedAt?: string;
  decisionNote?: string;
  eligibleAmountAtApproval?: number;
  createdAt?: string;
};

export type LoanInstallment = {
  _id: string;
  installmentNo: number;
  dueDate: string;
  principalDue: number;
  interestDue: number;
  status: "pending" | "paid";
  paidAt?: string;
};

// GET /loans/:loanNo
export type LoanDetail = { loan: Loan; installments: LoanInstallment[]; outstandingPrincipal: number };

// GET /loans/eligibility/:memberNo
export type LoanEligibility = { memberNo: string; eligibleAmount: number; currentOutstandingLoan: number };

// GET /loans (loan.builder.config.ts). Empty string = not set.
export type LoanListParams = {
  page: number;
  limit: number;
  search: string; // loan no
  status: LoanStatus | "";
  memberNo: string;
  sort: string;
};

// POST /loans/apply (principal in TAKA)
export type ApplyLoanPayload = { memberNo: string; principal: number; interestRatePercent: number; tenureMonths: number };
// PATCH /loans/:loanNo/approve | reject
export type LoanDecisionPayload = { decisionNote?: string };
// POST /loans/:loanNo/disburse | repay-next-installment
export type LoanCashPayload = { cashAccountId: string; transactionDate: string };
