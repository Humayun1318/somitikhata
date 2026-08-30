# client-questions.md

These are decisions the architecture deliberately does not make on its own — guessing at them and hardcoding a guess would mean rebuilding Phase 8 or 9 later. Get real answers from the Somiti committee before either phase starts.

## Asset / Share Questions (blocks Phase 8)

1. Is a member's "contribution basis" their **lifetime total deposits**, or deposits within a specific period (e.g., only since the asset was acquired)?
2. If a member has an **outstanding loan**, does that reduce their effective contribution basis for share purposes, or is share calculated purely from deposits regardless of loan status?
3. If a member **leaves** the Somiti, is their historical contribution removed from the total basis (increasing everyone else's share), or does it remain counted (their share effectively becomes unclaimed/reverts to the organization)?
4. If the Somiti acquires a **second asset** in the future, is share calculated separately per asset, or pooled across all assets combined?

## Loan Questions (blocks Phase 9)

1. Is the cost of borrowing an **interest rate** (percentage-based) or a **flat service charge** (fixed amount regardless of loan size/duration)? If interest, is it flat or reducing-balance?
2. What determines **maximum loan amount** — a multiple of the member's current savings, a flat cap, or committee discretion on a case-by-case basis?
3. Is there a **minimum membership duration** before a member becomes loan-eligible (e.g., must have been depositing for at least 6 months)?
4. Can a member have **more than one active loan** at a time?
5. What are the available **loan durations/tenures** — fixed options (e.g., 6/12/24 months) or admin-set per loan?
6. Is a **guarantor** (another member vouching) required, optional, or not used at all in this Somiti's practice?
7. Is **early repayment** allowed, and if so, is there any penalty or benefit for doing so?
8. What happens on **default/serious overdue** — is it deducted from the member's savings or asset share, referred to the committee for manual resolution, or something else?
9. Who can **initiate** a loan — does the member formally apply through the system, or does the committee decide and record loans top-down without a member-facing application step?
10. Is there a **grace period** after the due date before an installment is marked overdue (e.g., 3 days), or is it overdue immediately past the due date?

## How to Use This List

Bring these to the committee as a single conversation, not 14 separate messages — most Bangladeshi somitis already have informal versions of these rules (how they've handled loans on paper for years); the goal is usually to *document* existing practice accurately, not invent new rules. Phase 9 should not begin until at least questions 1–4 (the ones that change the data model's calculation logic, not just UI copy) have real answers.
