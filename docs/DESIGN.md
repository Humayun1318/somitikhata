# Design System and UI Rules

The visual language and UI behaviour of SomitiKhata: tokens, typography, components, states,
accessibility and internationalization. The aim is **one consistent, calm interface** that office
staff use all day and members use on their phones.

Component APIs (props, examples) are in [UTILITIES.md](UTILITIES.md#ui-primitives).

## Contents

- [Principles](#principles)
- [Design tokens](#design-tokens)
- [Typography](#typography)
- [Layout and spacing](#layout-and-spacing)
- [Components](#components)
- [Dialogs and dropdowns](#dialogs-and-dropdowns)
- [Forms](#forms)
- [UI states: loading, empty, error, busy](#ui-states-loading-empty-error-busy)
- [Feedback: toasts](#feedback-toasts)
- [Money, numbers and dates](#money-numbers-and-dates)
- [Responsive design](#responsive-design)
- [Accessibility](#accessibility)
- [Internationalization](#internationalization)
- [Branding](#branding)
- [Print](#print)

## Principles

1. **Clarity over decoration.** Financial data must be easy to read and hard to misread.
2. **One pattern per job.** Every modal is `Dialog`, every dropdown is `SelectMenu`, every amount
   is `Money`. Do not build a second version.
3. **Mobile first.** Members mostly use phones; staff use desktops and phones.
4. **Bangla first.** Bangla is the default language; layouts must fit Bangla text.
5. **Honest UI.** No sample data, no figures that are not from the API, no form that cannot be
   sent. Unsupported features show a "coming soon" notice.

## Design tokens

Defined in `src/app/globals.css`: raw values on `:root`, exposed to Tailwind through
`@theme inline` as `app-*` utilities. **Use the semantic utilities, never raw hex values** in
components.

| Token (Tailwind) | CSS variable | Value | Use |
|---|---|---|---|
| `app-primary` | `--color-primary` | `#0f6b4f` | Primary actions, links, active navigation |
| `app-primary-hover` | `--color-primary-hover` | `#0c5a42` | Hover of primary |
| `app-secondary` | `--color-secondary` | `#1e3a5f` | Secondary buttons, accents |
| `app-background` | `--color-background` | `#f7f8f7` | Page background |
| `app-surface` | `--color-surface` | `#ffffff` | Cards, dialogs, tables |
| `app-surface-muted` | `--color-surface-muted` | `#eef2ef` | Subtle fills, hover rows, stat icons |
| `app-border` | `--color-border` | `#e3e6e4` | Borders and dividers |
| `app-text` | `--color-text` | `#111827` | Main text |
| `app-text-muted` | `--color-text-muted` | `#5b6660` | Secondary text, hints |
| `app-focus` | `--color-focus-ring` | `rgba(15, 107, 79, 0.4)` | Focus rings |
| `brand-maroon` | (direct) | `#740616` | Logo arrow; brand accents only |
| `brand-blue` | (direct) | `#1655b6` | Logo roof; brand accents only |
| `max-w-app-wide` | `--max-width-app-wide` | `75rem` | Wide page container |

Also defined on `:root` (not exposed as `app-*` utilities): `--color-success` `#1a8a5f`,
`--color-warning` `#b8860b`, `--color-error` `#b3261e`, `--color-info` `#2563eb`,
`--color-disabled` `#9ca3af`. Status colours in components currently use Tailwind's palette
(`emerald`, `red`, `amber`, as in `StatCard` tones and toasts); keep using the same shades the
existing components use.

The theme is **light only** (`color-scheme: light`). Adding a token or a dark theme is a
design-system decision; ask first.

Other globals: `animate-fade-in-up`, the `no-scrollbar` utility, a `:focus-visible` outline in
the focus colour, pointer cursors for all interactive roles, no page scroll behind an open modal,
smooth scrolling unless the user prefers reduced motion.

## Typography

| Language | Font | Loaded in |
|---|---|---|
| English | Inter (`--font-inter`, preloaded) | `src/app/fonts.ts` |
| Bangla | Hind Siliguri 400/500/600/700 (`--font-hind-siliguri`) | `src/app/fonts.ts` |

The body font follows `html[lang]`. Body line-height is 1.5. Use Tailwind's type scale
(`text-sm` for most UI, `text-xl`/`text-2xl` for page titles). Do not add fonts.

## Layout and spacing

- Pages use `PageContainer` (`size`: `content` = `max-w-3xl`, `wide` = `max-w-app-wide`,
  `full`) and start with `PageHeader` (title, subtitle, main action).
- The signed-in area uses `DashboardShell`: desktop sidebar, header with profile menu, mobile
  drawer and bottom navigation. Sidebar items come from
  `features/dashboard/config/sidebar.ts`, filtered by area.
- Cards: `rounded-2xl border border-app-border bg-app-surface`, soft shadow.
- Use Tailwind spacing; keep vertical rhythm with `space-y-*` / `gap-*`.

## Components

| Need | Use | Not |
|---|---|---|
| Button | `Button` (`primary`, `secondary`, `outline`, `danger`; `isLoading`) — min height 44 px | raw `<button>` styling |
| Text input | `Input`, `PasswordInput`, `Textarea` inside `FormField` | unlabelled inputs |
| Dropdown | `SelectMenu` (searchable for long lists) | native `<select>` |
| Few visible choices | `SegmentedControl` | radio rows built by hand |
| Modal | `Dialog` + `DialogActions` | custom overlays |
| Amount | `Money` / `formatPaisa` | `amount / 100` in a component |
| Avatar | `CurrentUserAvatar`, `MemberPhotoAvatar`, `UserAvatar` (initials) | ad-hoc circles |
| Stats | `StatCard`, `StatGrid` | |
| Lists | `SearchInput`, `SortableHeader`, `Pagination`, `ListLoading`/`ListEmpty`/`ListError`, `ListUpdatingHint` | client-side paging |
| Section of a read | `QueryState` | hand-written loading/error branches |
| Form grouping | `FormSection`, `FormAlert`, `AddressFields`, `PasswordRulesChecklist` | |
| Not supported yet | `ComingSoon` (via the member-area `UnavailablePage`) | sample data |
| Icons | `lucide-react` (`DynamicIcon` by name for config-driven menus) | other icon sets |

Create a new shared component only when a **second real use** exists; until then keep it in the
feature.

## Dialogs and dropdowns

- Every modal is `Dialog` (native `<dialog>` with `showModal()`): sticky header (title, short
  description, close), a body that is the only scrolling part, sticky footer. On phones it is a
  **bottom sheet**; from `sm` up a centred card (`size` `md` or `lg`).
- Forms pass `onSubmit` and `busy` to `Dialog` (it renders the `<form>`), and put
  `<DialogActions>` in `footer`: Cancel + the primary action (`tone="danger"` for destructive
  actions such as Reverse). Do not build button rows by hand.
- A dialog cannot be closed while its request runs: `dismissible={!isBusy}`.
- Every dropdown is `SelectMenu`. Its panel is a native popover: never clipped, flips up near the
  bottom, becomes a bottom sheet on phones, scrolls inside (max 320 px), and shows a search box
  when `searchable`. With react-hook-form use a `Controller`.
- A few visible choices (status filters, Cash / Bank) use `SegmentedControl`.
- Destructive or irreversible actions (reset password, year-end runs) require a ticked
  confirmation in the dialog.

## Forms

- react-hook-form + `zodResolver`; schemas are built with translation functions so messages are
  localized (`createMemberSchema({ t, … })`).
- Labels via `FormField` (`id`, `label`, optional `labelHint`, `error`).
- `const isBusy = isSubmitting || mutation.isPending` drives the button, the inputs (`readOnly`)
  and the dialog.
- Submit through `useSubmitLock()` so a double tap cannot send twice.
- Server errors: map the `ApiError` with the feature's `*-errors.ts` helper, then `setError` on the
  field (focus the first) or show a `FormAlert` inside the form. Success gets a toast.
- Taka inputs: text inputs with `inputMode="decimal"`, checked with `TAKA_INPUT_PATTERN`; send
  `Number(value)`.
- Date inputs: `<input type="date">`, default and prefill with `toDhakaDateString()`.
- Rules shared with the backend (password rules, address limits, nominee guardian under 18) are
  mirrored on the client for instant feedback; the backend remains the real check.

## UI states: loading, empty, error, busy

| State | Show |
|---|---|
| First load of a read | Skeleton rows (`ListLoading`, or the page's own skeleton); route-level `loading.tsx` in the signed-in area |
| Next page / new search | Keep the old rows (`keepPreviousData`) + `ListUpdatingHint` |
| Empty result | `ListEmpty` with an icon, a title and a hint |
| Error with no data | `ListError` with Retry (or `QueryState`) |
| Error during a background refetch | Keep showing the data; no error card |
| Mutation running | Automatic loading toast + button spinner (`isLoading`) + disabled inputs |
| Mutation done | Success toast with a specific message; refreshed data |
| Not supported by the API | `ComingSoon` page |

Render content from `data`, not `isSuccess` (a failed refetch flips the status but keeps the
data). A disabled query stays `isPending`; gate skeletons with the same condition as `enabled`.

## Feedback: toasts

- `const toast = useToast()`: `success(message)`, `error(message)`, `info(message)`,
  `loading(message) → id`, `dismiss(id)`.
- Pass already translated text.
- Loading toasts for mutations are automatic (`MutationLoadingToasts`); set
  `meta: { loadingMessage: "<key>" }` on the mutation to name the action (keys in
  `common.json` → `ApiLoading`).
- No toast for reads (searching and paging would spam toasts).
- Toasts live in a popover in the browser's top layer, so they stay above open dialogs; errors use
  `role="alert"`, others `role="status"`, in an `aria-live="polite"` region.

## Money, numbers and dates

- Amounts come from the API in **paisa**. Show them only with `<Money paisa={…} />` or
  `formatPaisa(paisa, locale)`: taka sign, two decimals, lakh/crore grouping (`en-IN`), Bangla
  digits in Bangla (`bn-BD`). `signed` adds `+` for credits; negatives use a real minus sign.
- Never recompute balances or limits on the client; show what the API returns. A page may add up
  the rows it shows if it labels that total as such.
- Day-only dates (join date, date of birth, transaction date) are stored as Dhaka midnight. Show
  them with `timeZone: DHAKA_TIME_ZONE`, never UTC (UTC shows them one day early).
- Fiscal years are labelled `2025-26` (`lib/fiscal-year.ts`).

## Responsive design

- Build for phone → tablet → desktop. No horizontal page overflow.
- Touch targets around 44 px (`Button` has `min-h-[44px]`).
- Tables need a mobile strategy (stacked rows or a horizontally scrolling table inside its card,
  never the whole page).
- Dialogs become bottom sheets and dropdowns become sheets on phones.
- The signed-in area has a bottom navigation on phones.
- Keep important actions reachable on small screens.

## Accessibility

- Semantic HTML first (`main`, `nav`, `section`, headings in order, real `button`/`a`); ARIA only
  where HTML has no equivalent.
- Every input has a label (`FormField`). `FormField` renders the error with the id `${id}-error`;
  the input should point at it with `aria-describedby` and set `aria-invalid` when it has an error.
- Visible focus (`:focus-visible` outline, `focus:ring-app-focus`).
- Icons that carry no meaning get `aria-hidden="true"`; icon-only buttons get a translated
  `aria-label`.
- Sortable headers expose `aria-sort` (`getAriaSort`).
- Status messages: alerts use `role="alert"`; loading hints use `role="status"`.
- Respect `prefers-reduced-motion` (smooth scroll and the home page animation are disabled).
- Contrast: use the token colours on their intended backgrounds.

## Internationalization

- Locales `bn` (default) and `en`; the locale is always in the URL.
- **No hard-coded user-facing text**, including `aria-label`, `alt`, `title` and toast text.
  Everything comes from `messages/<locale>/<area>.json`.
- Add every key to **both** locales with the same structure.
- Client components on public pages may only read namespaces listed in `PUBLIC_CLIENT_MESSAGES`
  (`src/i18n/client-messages.ts`); add new ones there.
- Server components use `getTranslations({ locale, namespace })` or `useTranslations` with
  `setRequestLocale()` in the layout/page.
- Interpolate values (`t("success", { memberNo })`); do not concatenate translated fragments.
- Numbers and money in Bangla use Bangla digits (via `Intl` with `bn-BD`).
- Backend error messages are English. Map the ones the user must understand to translated text
  (feature `*-errors.ts`); otherwise show the backend's message for 4xx and a translated generic
  message for anything else.
- `LanguageSwitcher` switches between `bn` and `en` on the same path (search params are not carried
  over). Known gap: its `aria-label` ("Language Switcher") and `title` texts are hard-coded rather than
  translated.

## Branding

`public/branding/` holds every logo and icon, generated from one transparent master at the size
each name says: favicons 16/32/48, PWA icons 192/512 and maskable variants, apple-touch-icon 180,
`logo-mark`, `logo-horizontal`, `logo-vertical`, `logo-badge`, and `og-image.png` (1200×630).
`src/app/favicon.ico` serves `/favicon.ico`. Keep the file names: metadata and the manifest
reference them. `BrandLogo` renders the logo with the society's legal name and location.

## Print

Reports are printed with the browser. `DashboardShell` hides its navigation in print
(`print:hidden`) and the content uses a white background. Check print preview when you change a
report layout.
