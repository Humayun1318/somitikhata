# design.md

## 1. Project Naming

Naming candidates evaluated for fit with a Bangladeshi cooperative/savings context, pronounceability in both languages, and domain/brand availability likelihood:

| Name | Why it could work | Concern |
|---|---|---|
| **SomitiKhata** (সমিতি খাতা) | "Khata" is the traditional ledger book every Bangladeshi somiti already keeps by hand — the name literally says "this is your digital ledger." Instantly understood by a 50-year-old committee member and a 20-year-old developer alike. | "Somiti" is generic (any cooperative can call itself that) — fine for a product name, weak as a trademark on its own, but combined with "Khata" it's specific enough. |
| Sanchay (সঞ্চয়) | Means "savings" — short, clean, brandable. | Doesn't communicate "cooperative" or "loan" at all; less specific. |
| SomobayKhata | "Somobay" = cooperative (more formal/official term than "somiti"). | Slightly harder to pronounce/type than SomitiKhata. |
| EkSathi (এক সাথী) | "Together" — warm, community-feeling name. | Doesn't communicate what the product does. |
| NijeraSomiti | "Our own cooperative" — ownership framing. | Longer, less crisp as a product name. |
| AmarSanchay | "My savings" — member-centric framing. | Undersells the admin/organizational side of the product. |
| Bhandar (ভাণ্ডার) | "Treasury/storehouse" — evokes the shared asset angle. | Doesn't communicate savings/loans; sounds more like inventory software. |
| SohojSomiti | "Easy cooperative" — usability-focused. | Generic "Sohoj-" prefix is heavily used by other BD products already (payment/logistics brands), risk of confusion. |

**Recommended: SomitiKhata**

- **GitHub repository name:** `somitikhata`
- **Short repo description:** "Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative societies (somiti) — built for admins and members, bilingual by design."
- **Tagline:** "আপনার সমিতির ডিজিটাল খাতা" / "Your cooperative's digital ledger."
- **One-line product description:** A production-grade savings, loan, and asset-management platform for small Bangladeshi cooperatives (400–500 members), with full Bangla/English support and a mobile-first, installable experience.

---

## 2. Typography

**Requirement:** one system that looks equally intentional in Bangla and English — not an English font with a Bangla font bolted on as an afterthought.

### Recommended combination

| Role | Font | Why |
|---|---|---|
| **English (Latin) — UI & body** | **Inter** | The de facto standard for clean, legible product UI at small sizes; huge weight range; free (OFL). |
| **Bangla — UI & body** | **Hind Siliguri** | Designed specifically for UI use (not just editorial text) — noticeably better x-height and word-spacing at small sizes than Noto Sans Bengali, which reads better in long-form paragraphs but slightly looser in compact tables/forms. Free (OFL), actively maintained. |
| **Fallback (both)** | **Noto Sans, Noto Sans Bengali** | Universal Unicode coverage — guarantees no missing-glyph boxes (□) if a name, note, or SMS log contains a rare character. |
| **Numerals / currency** | Latin numerals (0–9) with the ৳ symbol, **not** Bangla numerals (০–৯) | See §5 (Currency) — this is a deliberate readability decision, not an oversight. |

CSS font stack:
```css
--font-en: 'Inter', 'Noto Sans', system-ui, sans-serif;
--font-bn: 'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif;
```
The active locale sets `--font-body` to whichever stack matches it; components never hardcode a font family directly.

### Typography tokens

| Token | Size | Weight | Line height | Letter spacing | Use |
|---|---|---|---|---|---|
| Display | 36px | 700 | 1.15 | -0.02em | Landing page hero only |
| H1 | 28px | 700 | 1.2 | -0.01em | Page titles |
| H2 | 22px | 600 | 1.25 | 0 | Section headers |
| H3 | 18px | 600 | 1.3 | 0 | Card/module headers |
| H4 | 16px | 600 | 1.35 | 0 | Sub-section headers |
| Body Large | 16px | 400 | 1.5 | 0 | Primary reading text |
| Body | 14px | 400 | 1.5 | 0 | Default UI text |
| Body Small | 13px | 400 | 1.45 | 0 | Secondary/meta text |
| Caption | 12px | 400 | 1.4 | 0.01em | Table footnotes, timestamps |
| Label | 13px | 500 | 1.3 | 0.01em | Form field labels |
| Button | 14px | 600 | 1 | 0.01em | Button text |
| Input | 14px | 400 | 1.4 | 0 | Text typed into fields |
| Table | 13px | 400 | 1.4 | 0 | Table cell content |

Bangla text at the same pixel size visually reads slightly larger due to the script's shape — do not shrink Bangla sizes to "compensate"; keep tokens identical across locales so the layout grid doesn't shift when a user switches language. Line-height is intentionally generous (1.4–1.5 for body) because Bangla conjuncts need more vertical breathing room than Latin text.

---

## 3. Design Tokens (Color, Spacing, Shape)

The product handles other people's money. The palette is deliberately restrained — this is not a consumer app competing for attention; it's a record book people need to trust.

### Color

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#0F6B4F` (deep teal-green) | Primary actions, active nav, links. Green reads as "money/growth" without being the loud green of a betting app. |
| `--color-primary-hover` | `#0C5A42` | |
| `--color-secondary` | `#1E3A5F` (deep navy) | Secondary emphasis, admin-only accents (visually distinguishes admin surfaces from member surfaces) |
| `--color-background` | `#F7F8F7` | App background |
| `--color-surface` | `#FFFFFF` | Cards, modals, tables |
| `--color-border` | `#E3E6E4` | Dividers, input borders |
| `--color-text` | `#111827` | Primary text |
| `--color-text-muted` | `#5B6660` | Secondary text, placeholders |
| `--color-success` | `#1A8A5F` | Deposit confirmed, loan approved |
| `--color-warning` | `#B8860B` | Pending review, upcoming installment due |
| `--color-error` | `#B3261E` | Overdue loan, rejected, validation errors |
| `--color-info` | `#2563EB` | Neutral informational banners |
| `--color-focus-ring` | `#0F6B4F` at 40% opacity, 2px | Keyboard focus outline — never remove focus rings |
| `--color-disabled` | `#9CA3AF` on `#F3F4F6` | |

### Shape & spacing

| Token | Value |
|---|---|
| Border radius (default) | 8px |
| Border radius (small — badges, chips) | 6px |
| Border radius (large — cards, modals) | 12px |
| Shadow (card resting) | `0 1px 2px rgba(0,0,0,0.06)` |
| Shadow (modal/dropdown) | `0 8px 24px rgba(0,0,0,0.12)` |
| Spacing scale | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 (px, multiples of 4) |
| Container max-width (desktop) | 1200px |
| Breakpoints | `sm` 375px · `md` 768px · `lg` 1024px · `xl` 1280px |
| Icon sizing | 16px (inline), 20px (buttons/nav), 24px (empty states/section headers) |
| Button height | 40px (default), 36px (small), 44px (large / primary mobile CTA) |
| Input height | 40px |
| Card padding | 16px (mobile), 24px (desktop) |
| Table row height | 44px (desktop), 52px (mobile — larger touch target) |

Design should feel: **trustworthy, clean, calm, professional** — closer to a well-designed bank statement than a startup dashboard. Avoid gradients, avoid more than one accent color competing for attention on a single screen, avoid decorative illustrations on data screens (fine on the landing page only).

---

## 4. Component Rules

| Component | Variants | States | Accessibility notes |
|---|---|---|---|
| **Button** | Primary, Secondary, Outline, Ghost, Destructive | default, hover, active, disabled, loading (spinner replaces label, width doesn't jump) | Minimum 44×44px touch target on mobile even if visual height is 40px (use padding) |
| **Input** | Text, Number, Currency, Search | default, focus, error, disabled, read-only | Error state always pairs a red border with visible text (never color alone) |
| **Currency Input** | — | — | Numeric keypad on mobile (`inputMode="decimal"`), formats with commas on blur, not while typing |
| **Select** | Single, searchable | default, open, disabled | Full keyboard navigation (Radix handles this) |
| **Date Picker** | Single date, month picker (for deposit period selection) | — | Bangla month names available when locale is `bn` |
| **Cards** | Stat card, list-item card, form card | default, hover (only if clickable) | Stat cards are never clickable-looking unless they actually navigate somewhere |
| **Tables** | Data table (admin), simple list table (member) | loading (skeleton rows), empty, error, populated | Sticky header on scroll; horizontally scrollable on mobile rather than silently truncated |
| **Modal** | Confirmation, form | open/closing animation, loading (submit in progress) | Focus trapped inside; Esc closes unless a destructive action is mid-submit |
| **Drawer** | Mobile filter/detail panel | — | Used on mobile instead of side-by-side panels |
| **Tabs** | Underline style | active, disabled | Used for switching between report periods, not as primary navigation |
| **Badge** | Status (Active/Inactive, Pending/Approved/Rejected/Overdue) | — | Color + text label together, never color-only |
| **Alert / Toast** | Success, warning, error, info | auto-dismiss (toast), persistent (alert banner) | Toasts for transient confirmations ("Deposit saved"); alerts for anything requiring acknowledgment |
| **Pagination** | Numbered (desktop), Load-more (mobile) | — | |
| **Breadcrumb** | Admin only | — | Not used on member side (navigation is shallow enough not to need it) |
| **Sidebar (desktop)** | Admin: full nav; Member: minimal nav | collapsed/expanded | |
| **Bottom nav (mobile, member only)** | 4–5 icons max | active state | See `information-architecture.md` for exact items |
| **Empty state** | Icon + one sentence + primary action if applicable | — | Never a bare "No data" |
| **Loading state** | Skeleton matching final layout shape, not a generic spinner, for anything above ~300ms | — | |
| **Error state** | What happened + a retry action | — | Never a raw error code shown to a member; log the real error, show a plain-language message |
| **Confirmation dialog** | Used before: loan approve/reject, deposit correction, member deactivation | — | Destructive actions require typing/confirming, not just one click |

---

## 5. Currency Formatting

| Context | Format | Example |
|---|---|---|
| Amounts in UI (cards, tables, statements) | `৳` symbol + Latin numerals + comma grouping | ৳25,000 |
| Amounts in SMS/plain-text contexts (where the ৳ glyph might not render on all handsets) | `Tk` or `BDT` prefix | Tk 500 / BDT 500 |
| Formal reports/statements (PDF-style exports later) | `BDT 25,000.00` | with two decimal places for auditability |
| Negative amounts (e.g. shortfall) | Red text + parentheses, never a bare minus sign | (৳500) |

**Numerals:** Latin numerals (0–9), not Bangla numerals (০–৯), even in the `bn` locale. This is a deliberate call, not an oversight — Bangladeshi banking, mobile banking (bKash/Nagad), and most financial apps already standardized on Latin numerals for money specifically, because they're faster to scan and less error-prone when read aloud or copied. Bangla numerals are fine for dates and other non-monetary counts if desired, but money amounts stay Latin-numeral for consistency with what members already see on their phone's mobile banking app.

**Number grouping:** Bangladesh uses the lakh/crore grouping system (৳12,50,000 rather than ৳1,250,000), but this system almost certainly never exceeds a few thousand taka per member per month or a few lakh in total assets — using standard international comma grouping (৳1,250,000-style, adapted to realistic amounts like ৳25,000) keeps the number formatting library simple (`Intl.NumberFormat` default) without a custom lakh/crore formatter, and is still completely legible to Bangladeshi users, who read both formats daily. If total asset values later grow into the crore range, this should be revisited — flagged here as a low-priority future decision, not a blocker.
