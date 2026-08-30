# information-architecture.md

## 1. Public Landing Page

This page must build trust for a financial product without ever exposing real member/financial data — it's marketing/informational only, viewed by people who are not logged in.

| Section | Purpose | Notes |
|---|---|---|
| **Navbar** | Logo, language switcher (EN/বাংলা), Login button | Language switcher is here specifically because a Bangladeshi committee member evaluating this for their somiti needs to see it works in Bangla before they trust it |
| **Hero** | One sentence on what this is, one sentence on who it's for, single primary CTA | Headline: *"Your somiti's savings, loans, and shared assets — in one trusted place."* / *"সমিতির সঞ্চয়, ঋণ ও যৌথ সম্পদ — একটি জায়গায়।"* Subhead: *"Built for Bangladeshi cooperative societies. No online payment required — your committee enters deposits, members see everything instantly."* CTA: "Contact us to set up your somiti" (this is not a self-serve SaaS signup — a new somiti onboarding is an admin-mediated process, so the CTA should not promise instant self-registration) |
| **How It Works** | 3–4 steps: committee adds members → members register with their approved phone/email → committee enters monthly deposits → members see their balance, share, and loan status anytime | Directly defuses the most likely committee objection: "how is this different/harder than our paper khata?" |
| **Core Features** | Savings tracking, Loan management, Shared asset tracking, Bilingual — four cards, not a long feature-dump list | Keep to what's actually built; do not list features that don't exist yet in a given release |
| **Security & Trust** | Plain-language reassurance: data is private to your somiti, admin actions are logged, no online payment handling (so no card/payment data risk at all) | This section matters more for this audience than flashy feature marketing — trust is the actual purchase driver here |
| **FAQ** | 4–6 real questions: "Do members need internet access?" / "What if a member doesn't have a smartphone?" / "Can we still keep a paper record?" / "What does it cost?" | Answer honestly, including the offline/SMS fallback story |
| **CTA (repeat)** | Same contact CTA as hero | |
| **Footer** | Contact, language switcher (again, mobile users may scroll past navbar), organization info | |

**Explicitly excluded from the landing page:** any live numbers, member counts, deposit totals, testimonials naming real people, or a public self-registration form. All of these either leak information or contradict the "admin pre-approves membership" model.

---

## 2. Admin Dashboard

| Module | Pages | Key actions | Key tables/lists | Important metrics shown | Relates to |
|---|---|---|---|---|---|
| **Dashboard (home)** | 1 page | — | Recent deposits (last 10), pending loan applications, overdue installments | Total members, total savings across all members, active loans count, this month's deposit completion (X of 500 members recorded) | All modules |
| **Members** | List, Detail, Add Pre-registration | Add phone/email pre-approval, edit member info, deactivate member | Member list (filter: active/inactive/pending registration) | Total active members, pending registrations | Deposits, Loans (a member's detail page links to their deposit history and loan status) |
| **Deposits** | Monthly entry grid, History/search | Enter this month's deposits (bulk entry grid — see note below), correct a past entry | Deposit entry grid (one row per member, one column = current period), searchable history | This month's total collected, members not yet recorded this month | Members, Assets (asset share recalculates from deposit totals) |
| **Loans** | Applications queue, Active loans, Loan detail, Eligibility rules config | Approve/reject application, record a repayment, configure eligibility rules | Pending applications, active loans (with next-installment-due sorted first), overdue loans | Total outstanding loan amount, overdue count | Members, Deposits (eligibility rules reference savings) |
| **Assets** | Asset list, Asset detail (share breakdown) | Add/edit an asset and its current value, trigger share recalculation | Per-member share table for a selected asset | Total asset value, last valuation date | Deposits (share formula input — see `business-rules.md`) |
| **Reports** | Financial summary, Member statement generator | Generate/export a period summary or a single member's statement | — | Monthly collection trend, loan portfolio health | All modules |
| **Notifications** | Log/history | Resend a failed SMS, view delivery status | SMS log (sent, failed, pending) | Delivery success rate | Deposits, Loans (SMS triggers originate from these actions) |
| **Settings** | Org settings, Roles/staff | Manage staff accounts and permissions, edit organization name/logo | Staff list | — | — |

**Note on the deposit entry grid:** with 400–500 members, a form-per-member for monthly entry would be unusable. The primary admin deposit workflow should be a spreadsheet-like grid (one row per member, an amount input per cell, a "save all" or per-row auto-save), not a list of individual "add deposit" buttons. This is a Phase 7 UX decision, flagged here because it materially affects the deposit module's design from the start.

**Desktop-first, mobile-usable:** admin nav is a left sidebar on desktop, collapsing to a hamburger/drawer on mobile. The bulk deposit-entry grid is the one screen admins may realistically still prefer on a laptop, but nothing should be desktop-*only*.

---

## 3. Member Dashboard

Designed mobile-first — this is the screen 400–500 people will actually open, mostly on a phone. The seven numbers listed in the brief must be visible without scrolling on a typical phone screen, prioritized by what a member checks first.

**Top of screen (always visible, card layout, largest type on the page):**
1. **Current Total Savings** — the single number a member opens the app to check
2. **This Month's Deposit** — recently entered amount, with the date it was recorded
3. **Previous Balance** (secondary/smaller, shown as "was ৳X before this month's ৳Y deposit" rather than a separate competing number)

**Below the fold (scroll or a second section):**
4. **Asset/Share Value** — one card: this member's current share of the organization's asset(s)
5. **Active Loan** — if none, this card is replaced by "You have no active loan" (not hidden — a member checking loan eligibility should still see this section)
6. **Loan Remaining** + **Next Installment (amount + due date)** — only shown if an active loan exists
7. **Deposit History** — a simple table/list (month, amount, running total), not a chart. A chart of month-to-month deposits is not more informative than the table here, since amounts vary and there's no trend a member needs decoded visually.

**One chart, used deliberately:** a single cumulative-savings-over-time line chart, above the deposit history table. This is the one place a visual genuinely adds something the numbers don't — seeing the balance grow — everything else stays as cards and tables per the "avoid unnecessary charts" instruction.

**Navigation (mobile):** bottom nav bar, 4 items — Dashboard, Deposits (full history), Loans, Profile. Assets is reached from the Dashboard card, not given its own bottom-nav slot (it's checked far less often than the other four).

**Navigation (desktop, same member):** left sidebar with the same 4 items plus Assets promoted to its own link, since desktop has room and desktop users tend to be checking things more thoroughly.

**Profile page:** view/edit contact info, change password, language preference (also changeable from anywhere via the persistent language switcher — this is a convenience duplicate, not the only place to change it), notification preferences (which events trigger SMS).
