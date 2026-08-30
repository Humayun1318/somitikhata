# database-design.md

Target database: **MongoDB** (per the project's stated production architecture). Collections and field shapes below are written to translate directly into Mongoose schemas in Phase 14, and into the mock data fixtures now (Phase 1–13) — the shapes should match exactly so nothing changes when the mock data is replaced by real documents.

## 1. Entities and Why Each Exists

| Entity | Why it exists as its own entity (not folded into another) |
|---|---|
| **User** | The *login identity* (email/phone + password hash + role). Kept separate from Member because not every future user is necessarily a member (e.g. staff-only accounts), and because the pre-approval flow specifically requires checking "does a User already exist for this contact" separately from "does a Member record exist for this contact." |
| **Member** | The *cooperative membership* record — deposits, loans, and asset shares all belong to a Member, not directly to a User. This separation is what allows a member's financial history to exist and be entered by admin *before* that person ever creates a login. |
| **MemberPreRegistration** | The admin-created "this phone/email is allowed to register" record — this is the entity that makes the whole authentication requirement enforceable server-side (see `authentication.md`). It is intentionally *not* the same record as Member, because a phone/email can be pre-approved before all of a member's profile details are known. |
| **DepositPeriod** | Represents "January 2027," "February 2027," etc. as a first-class record (not just a date field on Deposit) so admin can see "is this month's entry complete for all 500 members" as a query against one entity, and so a period can be explicitly marked closed once finalized. |
| **Deposit** | One member's amount for one period. Kept append-only (see `business-rules.md` §2) — corrections create a new linked record rather than mutating history, which is why `correctionOf` exists as a field. |
| **Asset** | The organization's owned asset(s) (land, property) and their valuation history. Plural-capable from day one (`Asset`, not a single hardcoded "the land") because a real cooperative often ends up owning more than one thing over time. |
| **AssetShare** | A *cached, recomputable* snapshot of each member's share of a given Asset, not the source of truth (the source of truth is the sum of a member's Deposits — see `business-rules.md`). Stored so the admin/member dashboards don't recompute this on every page load, but always regenerable from Deposit data if it drifts. |
| **Loan** | One loan instance for one member — status, principal, terms. |
| **LoanPayment** | One installment/repayment record against a Loan — kept separate from Loan (rather than an embedded array) because repayments need independent querying (e.g. "all installments due this week across all loans," for SMS reminders). |
| **LoanEligibilityRule** | Configurable rule set (not hardcoded), because loan rules are explicitly not finalized yet (see `client-questions.md`) and will need to change without a code deployment. |
| **Notification** | A log of every SMS/in-app notification sent — required both for debugging ("did this member actually get their deposit SMS") and for the admin Notifications module. |
| **Role** | Admin / Staff / Member — kept as a defined set now, structured so a future finer-grained permission system doesn't require a schema rewrite. |
| **AuditLog** | Every admin action that touches money or membership status — non-negotiable for a financial system. This is not optional scope; it's what protects both the organization and you (the developer) if a dispute ever arises about "who changed this deposit and why." |

## 2. Schema Outline

```typescript
User {
  _id
  email?: string          // one of email or phone required
  phone?: string
  passwordHash: string
  provider: 'credentials' | 'google'
  role: 'admin' | 'staff' | 'member'
  memberId?: ObjectId      // ref Member — set once linked
  createdAt, updatedAt
}

Member {
  _id
  memberCode: string       // human-readable ID, e.g. "SK-0042"
  name: string
  phone?: string
  email?: string
  joinDate: Date
  status: 'active' | 'inactive'
  createdAt, updatedAt
}

MemberPreRegistration {
  _id
  contact: string          // phone or email, whichever admin entered
  contactType: 'phone' | 'email'
  addedBy: ObjectId        // ref User (admin)
  status: 'pending' | 'claimed'
  memberId?: ObjectId      // ref Member — linked once admin also creates the Member record
  createdAt, claimedAt?
}

DepositPeriod {
  _id
  label: string            // "2027-01"
  status: 'open' | 'closed'
  openedAt, closedAt?
}

Deposit {
  _id
  memberId: ObjectId       // ref Member
  periodId: ObjectId       // ref DepositPeriod
  amount: number
  enteredBy: ObjectId      // ref User (admin/staff)
  enteredAt: Date
  note?: string
  correctionOf?: ObjectId  // ref Deposit — set only on a correction entry
  status: 'active' | 'superseded'  // superseded when a correction replaces it in calculations
}

Asset {
  _id
  name: string
  currentValue: number
  valuationDate: Date
  valuationHistory: [{ value: number, date: Date, note?: string }]
}

AssetShare {                // cached snapshot, regenerable
  _id
  assetId: ObjectId
  memberId: ObjectId
  shareAmount: number
  sharePercentage: number
  calculatedAt: Date
  basisTotal: number         // the total-contribution figure used for this calculation, kept for audit
}

LoanEligibilityRule {
  _id
  name: string
  active: boolean
  // fields intentionally generic — see client-questions.md before finalizing
  minMembershipMonths?: number
  maxLoanMultipleOfSavings?: number
  maxActiveLoans?: number
}

Loan {
  _id
  memberId: ObjectId
  principal: number
  serviceChargeOrInterest?: number   // pending client answer, see client-questions.md
  durationMonths: number
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'closed' | 'overdue'
  appliedAt: Date
  approvedBy?: ObjectId
  approvedAt?: Date
  disbursedAt?: Date
}

LoanPayment {
  _id
  loanId: ObjectId
  installmentNumber: number
  dueDate: Date
  amountDue: number
  amountPaid: number
  paidAt?: Date
  status: 'upcoming' | 'paid' | 'overdue'
  recordedBy?: ObjectId
}

Notification {
  _id
  memberId: ObjectId
  type: 'deposit_recorded' | 'loan_approved' | 'installment_due' | 'installment_overdue' | ...
  channel: 'sms' | 'in_app'
  message: string
  status: 'sent' | 'failed' | 'pending'
  sentAt?: Date
}

AuditLog {
  _id
  actorId: ObjectId          // ref User
  action: string             // e.g. "deposit.correct", "loan.approve", "member.deactivate"
  entityType: string
  entityId: ObjectId
  before?: object             // snapshot before change
  after?: object               // snapshot after change
  timestamp: Date
}
```

## 3. Relationships Summary

```
User (1) ──── (0..1) Member
Member (1) ──── (many) Deposit
Member (1) ──── (many) Loan
Member (1) ──── (many) AssetShare
Loan (1) ──── (many) LoanPayment
Asset (1) ──── (many) AssetShare
DepositPeriod (1) ──── (many) Deposit
MemberPreRegistration (0..1) ──── (0..1) Member   [linked once claimed]
```

## 4. Indexing Notes (for Phase 14, noted now so the schema design accounts for them)

- `Deposit`: compound index on `(memberId, periodId)` — the most common query is "this member's deposits" and "this period's deposits for all members."
- `MemberPreRegistration`: unique index on `contact` — prevents the same phone/email being pre-approved twice.
- `LoanPayment`: index on `dueDate` + `status` — powers the overdue/upcoming-installment queries used both by the admin dashboard and the SMS reminder job.
- `AuditLog`: index on `entityType, entityId` — powers "show me the full history of this specific deposit/loan."
