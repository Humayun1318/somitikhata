# business-rules.md

## 1. Deposits

Different members deposit different, independently-set amounts each month — there is no fixed monthly amount assumed anywhere in the system. Every calculation below operates per-member.

### Balance calculation

```
New Total = Previous Total + Current Month's Deposit
```

This is **not** stored as a running-total field that gets overwritten each month. It's *computed* on read, as the sum of all active (non-superseded) Deposit records for that member, ordered by period. Storing a mutable running total is a common shortcut that causes exactly the kind of silent drift a financial system can't afford (one missed update and every subsequent month's "total" is wrong with no way to detect it). Computing it from the full deposit history is slightly more work per page load, at this scale (a few hundred rows per member, at most) that cost is irrelevant, and it means the total is always provably correct from the underlying records.

### Corrections

A deposit entry is never edited or deleted in place. A correction:
1. Marks the original `Deposit` record's status as `superseded`.
2. Creates a new `Deposit` record with the corrected amount and `correctionOf` pointing to the original.
3. Logs the change in `AuditLog` with the before/after amounts and which admin/staff made the change.

This means "what did we originally enter, and what did we change it to, and who did that, and when" is always answerable — a requirement for a system multiple committee members will need to trust, not just the one who happens to be looking at the code.

## 2. Asset / Land Share

Three possible models, evaluated:

| Model | How it works | Fit for this Somiti |
|---|---|---|
| **Contribution-based ownership** | A member's share = their total deposits ÷ total deposits across all members, applied to the asset's current value | Matches how the client described it ("if a member's contribution represents 1% of the total contribution basis") almost exactly — **recommended** |
| **Equal ownership** | Every active member gets an identical share regardless of how much they've deposited | Simple, but contradicts the client's own description of proportional share, and would likely feel unfair to long-time/high-contributing members |
| **Share-unit based** | Members buy fixed-price "units" (like cooperative shares), share = units owned ÷ total units issued | More common in formal cooperative societies with a share-purchase mechanism distinct from savings deposits — adds a whole additional concept (share units, separate from deposits) that hasn't been described as part of this Somiti's actual practice |

**Recommendation: Contribution-based ownership**, calculated as:
```
Member's Share % = Member's Total Contribution Basis ÷ Sum of All Members' Contribution Basis
Member's Share Value = Share % × Asset's Current Value
```

**This must be confirmed with the client before Phase 8 is built** — specifically, three open sub-questions (also listed in `client-questions.md`):
1. Is "contribution basis" *lifetime total deposits*, or deposits within a defined period (e.g. "since the asset was acquired")?
2. Does a loan reduce a member's effective contribution basis while outstanding, or is share purely deposit-based regardless of loan status?
3. If a member leaves the Somiti, does their historical contribution still count toward the *denominator* (total across all members) for everyone else's share calculation, or is it removed?

The architecture (`AssetShare` as a recomputable cache, per `database-design.md`) supports whichever answer comes back — nothing about the schema needs to change once these are answered, only the calculation function.

## 3. Loan System — Flexible Architecture, Not Final Rules

Per the brief, loan business rules have **not** been provided by the client and must not be invented as final. What's built now is architecture that can hold any reasonable answer without a schema change:

- `LoanEligibilityRule` is a configurable record, not a hardcoded `if` statement — eligibility criteria (minimum membership duration, maximum loan as a multiple of savings, maximum concurrent active loans) can be added or changed by an admin later without a code deployment.
- `Loan.serviceChargeOrInterest` is a plain number field, deliberately not labeled definitively as "interest rate" vs. "flat service charge" in the schema, since which of those two models applies is one of the open questions.
- `Loan.status` includes every state a real approval-and-repayment workflow needs (`pending → approved/rejected → active → closed`, plus `overdue` as a derived/monitored state) so the workflow doesn't need re-modeling once rules are confirmed.
- `LoanPayment` is a fully separate, queryable collection (not embedded in `Loan`) specifically so installment schedules of any shape (fixed monthly, custom due dates, irregular repayment) can be represented without changing how `Loan` itself is structured.

**Phase 9 (Loans) should not be started until the questions in `client-questions.md` are answered** — the UI and workflow states can be built against the flexible schema now, but the actual eligibility formula and interest/service-charge calculation must wait for real answers, or they'll need to be rebuilt once the client corrects a wrong assumption.
