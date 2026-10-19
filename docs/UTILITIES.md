# Utilities, Hooks and Shared Components

Every reusable piece of the web app: where it lives, what it does, its signature, an example and
the usual mistakes. **Look here before writing something new.**

Imports use the `@/` alias for `src/`.

## Contents

- [Money](#money)
- [Dates and fiscal year](#dates-and-fiscal-year)
- [Forms and input helpers](#forms-and-input-helpers)
- [HTTP and errors](#http-and-errors)
- [Query helpers](#query-helpers)
- [Hooks](#hooks)
- [Metadata](#metadata)
- [i18n helpers](#i18n-helpers)
- [Auth helpers](#auth-helpers)
- [Cross-feature helpers](#cross-feature-helpers)
- [UI primitives](#ui-primitives)
- [Shared components](#shared-components)
- [Document and avatar components](#document-and-avatar-components)
- [Types](#types)

---

## Money

`src/lib/money.ts`

| Export | Signature | Purpose |
|---|---|---|
| `formatPaisa` | `(paisa: number, locale: string, options?: { signed?: boolean }) => string` | `৳1,23,456.50` / `৳১,২৩,৪৫৬.৫০`: two decimals, lakh/crore grouping (`en-IN` / `bn-BD`), `−` for negatives, `+` for positives when `signed` |
| `takaToPaisa` | `(taka: string \| number) => number` | `Math.round(Number(taka) × 100)`; for **amount filters** sent in paisa |
| `TAKA_INPUT_PATTERN` | `RegExp` | `^\d+(\.\d{1,2})?$`: taka with at most 2 decimals |

Component: `<Money paisa={150050} signed className="…" />` (`components/shared/money.tsx`) uses
the current locale.

```tsx
<Money paisa={row.amount} signed />
formatPaisa(balance, locale)            // in a string
amount: z.string().regex(TAKA_INPUT_PATTERN, t("validation.amount"))
payload.amount = Number(values.amount)  // request bodies take taka
```

Mistakes: dividing by 100 in a component; sending paisa in a request body (bodies take taka; only
range filters take paisa); recomputing balances.

## Dates and fiscal year

`src/lib/dhaka-date.ts`

| Export | Signature | Purpose |
|---|---|---|
| `DHAKA_TIME_ZONE` | `"Asia/Dhaka"` | Use as `timeZone` when formatting day dates |
| `toDhakaDateString` | `(date?: Date \| string) => string` | `YYYY-MM-DD` as seen in Dhaka (default: today). For `<input type="date">` defaults and prefills. |
| `dhakaDayStart` | `(date: string) => string` | `${date}T00:00:00.000+06:00`, start of a range filter |
| `dhakaDayEnd` | `(date: string) => string` | `${date}T23:59:59.999+06:00`, end of a range filter |

```ts
new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: DHAKA_TIME_ZONE }).format(new Date(member.joinDate));
```

Mistake: formatting a day date without `timeZone: DHAKA_TIME_ZONE` (shows the previous day).

`src/lib/fiscal-year.ts` (1 July – 30 June, same fixed start as the backend)

| Export | Signature | Example |
|---|---|---|
| `fiscalYearStart` | `(day?: string) => string` | `"2026-10-04"` → `"2026-07-01"` |
| `fiscalYearLabel` | `(day?: string) => string` | `"2026-10-04"` → `"2026-27"` |
| `previousFiscalYear` | `(label: string) => string` | `"2026-27"` → `"2025-26"` |
| `fiscalYearRange` | `(label: string) => { from: string; to: string }` | `"2025-26"` → `2025-07-01` … `2026-06-30` |
| `recentFiscalYears` | `(count = 5) => string[]` | current year first |

## Forms and input helpers

`src/lib/address.ts` (matches the backend's address schema: 50 characters per part)

| Export | Signature | Purpose |
|---|---|---|
| `addressSchema` | `(t, required = false) => ZodObject` | Five string parts; `required` makes `upazila` and `district` mandatory (present address) |
| `toAddressFormValues` | `(address?: Address) => AddressInput` | Empty strings for missing parts |
| `toAddressPayload` | `(values: AddressInput) => Address \| undefined` | Only filled parts (the backend rejects empty strings); nothing filled → `undefined` |
| `formatAddress` | `(address?: Address) => string` | `"Chunati, Lohagara, Chattogram"` |

On edit a changed address is sent whole (the backend replaces it), and an emptied one as `{}`.
Use with `<AddressFields>`.

`src/lib/password-rules.ts` (mirrors the backend's `passwordValidationSchema`)

| Export | Purpose |
|---|---|
| `PASSWORD_MIN_LENGTH` | 8 (update `PasswordRules.minLength` texts in both locales if it changes) |
| `PASSWORD_RULES` | `{ key, test(value) }[]`: `minLength`, `uppercase`, `lowercase`, `number`, `special` (`@$!%*?&`) |
| `meetsPasswordRules` | `(value: string) => boolean` |

`src/lib/get-initials.ts`: `getInitials(name: string): string` — first letter of the first two
words, Bangla-safe (`Array.from`).

`src/lib/cn.ts`: `cn(...inputs: ClassValue[]): string` — `clsx` + `tailwind-merge`; use for
conditional and overridable class names.

`src/lib/env.ts`: `getPublicEnv(): { NEXT_PUBLIC_API_BASE_URL: string }` — validated with Zod
(`z.url()`); throws if missing or not a URL. Read each variable by its full name so Next.js can
inline it.

## HTTP and errors

| Export | Path | Purpose |
|---|---|---|
| `httpKit` | `lib/http/http-kit.ts` | The only axios instance (`baseURL`, `withCredentials`, refresh) |
| `attachAuthRefresh(http)` | `lib/http/auth-refresh.ts` | Installs the 401 → refresh → retry interceptor (called once by `http-kit`) |
| `registerSessionExpiredHandler(handler) => unregister` | `lib/http/session-events.ts` | Used by `SessionExpiredListener` only |
| `notifySessionExpired()` | same | Called by the interceptor when the refresh is refused |
| `toApiError(error: AxiosError) => ApiError` | `lib/http/to-api-error.ts` | Normalizes every failure |
| `ApiError` | `lib/api-errors.ts` | `{ status, message, code?, details? }`; `status` 0 = no response |

See [API.md](API.md) and [ERROR_HANDLING.md](ERROR_HANDLING.md).

## Query helpers

| Export | Path | Purpose |
|---|---|---|
| `makeQueryClient()` | `lib/query/make-query-client.ts` | The app's `QueryClient` defaults |
| `TanstackQueryProvider` (default) | `lib/query/query-provider.tsx` | One client per browser session |
| `keepPreviousInScope(queryKey, scopeIndex)` | `lib/query/keep-previous.ts` | `placeholderData` that keeps old rows only while the thing at `queryKey[scopeIndex]` is the same |
| `AppMutationMeta` | `lib/query/mutation-meta.ts` | Types `useMutation({ meta: { loadingMessage } })` |

From `features/collections/hooks/use-collection-queries.ts`:

```ts
// Old rows stay while another page/filter of the SAME member loads (index 2 = memberNo).
export function useLedger(memberNo: string, params: TransactionListParams) {
  const queryKey = collectionKeys.ledger(memberNo, params);
  return useQuery<PaginatedResult<Transaction>, ApiError>({
    queryKey,
    queryFn: () => transactionApi.ledger(memberNo, params),
    enabled: !!memberNo,
    placeholderData: keepPreviousInScope(queryKey, 2),
    staleTime: MONEY_STALE_TIME,
  });
}
```

## Hooks

| Hook | Path | Signature | Purpose |
|---|---|---|---|
| `useSubmitLock` | `lib/use-submit-lock.ts` | `() => (task: () => Promise<void>) => Promise<void>` | Blocks a second submit while one runs (a ref, immediate) |
| `useDebouncedValue` | `lib/use-debounced-value.ts` | `<T>(value: T, delay = 400) => T` | Debounce lookups while typing |
| `useToast` | `components/shared/toast/toast-provider.tsx` | `() => { success, error, info, loading(msg) => id, dismiss(id) }` | Toasts |
| `useMe` | `features/auth/hooks/use-me.ts` | `() => UseQueryResult<CurrentUser \| null, ApiError>` | The signed-in user |
| `useLogin`, `useLogout`, `useChangePassword` | `features/auth/hooks/` | mutations | See [AUTHENTICATION.md](AUTHENTICATION.md) |
| `useMyAvatar` | `features/documents/hooks/use-my-avatar.ts` | `(version?: number, size = "thumb")` | The signed-in user's avatar as a data URL |
| `use<Thing>ListParams` | e.g. `features/members/hooks/use-member-list-params.ts` | | List state in the URL |

```tsx
const runLocked = useSubmitLock();
const onSubmit = (values: FormInput) => runLocked(() => save(values));
```

## Metadata

`src/lib/metadata.ts`

| Export | Use |
|---|---|
| `pageTitleMetadata(key: PageTitleKey)` | `export const generateMetadata = pageTitleMetadata("members");` in signed-in and utility pages |
| `publicPageMetadata(key, path, describe?)` | Public pages: canonical, hreflang, share card |
| `siteMetadata(locale)` | Root layout only |
| `localeAlternates(locale, path)` | Canonical + `en`/`bn`/`x-default` links |
| `getSiteUrl()` | `NEXT_PUBLIC_SITE_URL`, else `VERCEL_PROJECT_PRODUCTION_URL`, else `http://localhost:3000` |
| `PageTitleKey` | Union of page keys; titles in `messages/<locale>/common.json` → `Metadata.pages` |

A new page: add its key to `PageTitleKey` and to `Metadata.pages` in both locales.

## i18n helpers

| Export | Path | Purpose |
|---|---|---|
| `routing` | `i18n/routing.ts` | Locales `en`, `bn`; default `bn`; prefix always |
| `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` | `i18n/navigation.ts` | Locale-aware navigation (use these, not `next/link`/`next/navigation` routing) |
| `loadMessages(locale)` | `i18n/messages.ts` | Merges `MESSAGE_FILES` |
| `PUBLIC_CLIENT_MESSAGES`, `pickMessages(messages, paths)` | `i18n/client-messages.ts` | Namespaces sent to the browser on public pages |

## Auth helpers

`src/features/auth/role-routes.ts`: `getRoleArea(role)`, `getAreaFromPathname(pathname)`,
`getDashboardRoute(area)`, `getProfileRoute(area)`, `getSettingsRoute(area)`,
`getPostLoginRoute(user)`, `LOGIN_ROUTE`, type `AppArea` (`"admin" | "member"`).

`src/features/auth/end-session.ts`: `endSession(queryClient)` — use in every sign-out path.

`src/features/auth/login-errors.ts`: `getLoginError(error, t)`.

Components: `AuthGate`, `GuestGate` (not mounted today), `SessionExpiredListener`,
`AccountNav`, `AccessDenied`, `AuthLoading`, `LoginForm`.

## Cross-feature helpers

| Export | Path | Purpose |
|---|---|---|
| `invalidateSummaries(queryClient)` | `features/overview/invalidate-summaries.ts` | Refresh dashboards, reports, year-end status after any money/member/loan/head/setting change |
| `invalidateMemberViews(queryClient)` | `features/members/invalidate-member-views.ts` | Refresh everything that shows a member's name or status |
| `memberRowEffect(code)` | `features/member-area/ledger-direction.ts` | A member's passbook row effect (`{ bucket, sign }`) from its system type code (members cannot read the type catalog) |
| `typeOf`, `cashEffectOf`, `memberEffectsOf`, `isSocietyType`, `isReversalEntry`, `typeName`, `sumByCashEffect`, `balanceOf` | `features/collections/transaction-effects.ts` | Read a ledger row's effect from the transaction-type catalog |
| `formatSettingValue`, `toSettingInput`, `toStoredSettingValue` | `features/settings/setting-values.ts` | Convert setting strings (percent, paisa, date) for display and input |
| `SETTING_GROUPS`, `SETTING_DEFINITIONS` | `features/settings/setting-keys.ts` | Which settings exist and their format |
| `isMinorDob(dob)` | `features/nominees/schemas.ts` | Under 18 in Dhaka time (guardian required) |
| `filterSidebarItemsByRole({ items, userRole, userPermissions? })` | `features/dashboard/filter-sidebar-items.ts` | Sidebar items for an area |

## UI primitives

`src/components/ui/`

| Component | Key props | Notes |
|---|---|---|
| `Button` | `variant?: "primary" \| "secondary" \| "outline" \| "danger"`, `isLoading?`, all `<button>` props | Min height 44 px; `isLoading` shows a spinner and disables |
| `Input` | `error?: boolean`, all `<input>` props | `inputBaseClass`, `inputErrorClass` exported for custom inputs |
| `PasswordInput` | `Input` props without `type` | Show/hide toggle |
| `Textarea` | `error?`, `rows = 3` | |
| `FormField` | `id`, `label`, `labelHint?`, `error?`, `footer?`, `children` | Error gets id `${id}-error` |
| `Dialog` | `open`, `onClose`, `title`, `description?`, `closeLabel`, `dismissible?`, `size?: "md" \| "lg"`, `footer?`, `onSubmit?`, `busy?`, `children` | Native `<dialog>`; bottom sheet on phones; renders a `<form>` when `onSubmit` is given |
| `DialogActions` | `cancelLabel`, `onCancel`, `actionLabel?`, `onAction?`, `actionIcon?`, `tone?: "primary" \| "danger"`, `isBusy?`, `actionDisabled?`, `children?` | Footer buttons |
| `ConfirmDialog` | `open`, `onCancel`, `onConfirm`, `title`, `description?`, `confirmLabel?`, `busyLabel?`, `cancelLabel?`, `confirmIcon?`, `tone?: "danger" \| "primary"` (default danger), `isBusy?`, `error?`, `children?` | The shared "Are you sure?" dialog (see DESIGN.md); the caller runs the action and closes it on success |
| `SelectMenu` | `value`, `onChange`, `options: { value, label, group?, disabled?, dot? }[]`, `placeholder?`, `searchable?`, `disabled?`, `error?`, `highlighted?`, `size?: "md" \| "sm"`, `id?`, `onBlur?` | Popover dropdown; use with RHF `Controller` |
| `SegmentedControl` | `value`, `onChange`, `options: { value, label, dot? }[]`, `disabled?`, `fullWidth?` | Few visible choices |
| `Spinner` | `className?` | |

From `features/users/components/reset-password-dialog.tsx`:

```tsx
<Dialog
  open={open}
  onClose={onClose}
  title={t("reset.title")}
  description={t("reset.description", { name })}
  closeLabel={t("close")}
  dismissible={!isBusy}
  onSubmit={submitForm}
  busy={isBusy}
  footer={
    <DialogActions
      cancelLabel={t("cancel")}
      onCancel={onClose}
      actionLabel={isBusy ? t("reset.submitting") : t("reset.submit")}
      actionIcon={KeyRound}
      tone="danger"
      isBusy={isBusy}
      actionDisabled={!isConfirmed}
    />
  }
>
  {/* body */}
</Dialog>
```

## Shared components

`src/components/shared/`

| Component | Props | Purpose |
|---|---|---|
| `PageContainer` | `size?: "content" \| "wide" \| "full"` + div props | Page width |
| `PageHeader` | `{ titleKey }` or `{ title, subtitle?, children? }` | Page title + main action |
| `Money` | `paisa`, `signed?`, `className?` | Amounts |
| `SearchInput` | `id`, `label`, `placeholder`, `search`, `onSearchChange` | Debounced, URL-synced search |
| `SortableHeader` | `label`, `sortLabel`, `field`, `sort`, `onSortChange` | Table header with sort; `getAriaSort(field, sort)` |
| `Pagination` | `meta`, `onPageChange`, `onLimitChange` | Uses the backend's `meta`; `PAGE_SIZE_OPTIONS` 10/20/50/100 |
| `ListLoading` | `rows = 5` | Skeleton rows |
| `ListEmpty` | `icon`, `title`, `body?` | Empty state |
| `ListError` | `title`, `retryLabel`, `onRetry`, `isRetrying` | Error with Retry |
| `ListUpdatingHint` | `show`, `label` | "Updating…" while a new page loads |
| `QueryState` | `query`, `errorTitle`, `retryLabel`, `loading?`, `children(data)` | Loading / error-without-data / content |
| `StatCard`, `StatGrid` | `label`, `value`, `hint?`, `icon?`, `tone?: "default" \| "positive" \| "negative" \| "warning"` | Dashboard numbers |
| `FormSection` | `title`, `hint?`, `action?`, `children` | Group fields |
| `FormAlert` | `message` | Form-level error |
| `AddressFields` | `name`, `register`, `errors?`, `readOnly`, `required?` | The five address inputs |
| `PasswordRulesChecklist` | `id`, `title`, `metLabel`, `notMetLabel`, `rules`, `highlightUnmet` | Live password rules |
| `UserAvatar` | `name?`, `size?: "sm" \| "md" \| "lg"` | Initials avatar |
| `BrandLogo` | `variant?`, `legalName`, `location`, `shortName?`, `registration?`, `showLegalName?` | Logo with name |
| `ComingSoon` | `icon`, `body`, `hint?`, `backHref?`, `backLabel?` | Not-yet-supported pages |
| `DynamicIcon` | `name` + lucide props | Icon by name (sidebar config) |
| `LanguageSwitcher` | — | bn ↔ en |
| `ToastProvider`, `useToast` | | Toasts (`toast/`) |
| `MutationLoadingToasts` | — | Mounted once in `AppProviders` |

`src/components/layout/`: `PublicNavbar`, `Footer`, `FooterAccountLinks`, `CurrentYear` (public
pages).

## Document and avatar components

`src/features/documents/components/`

| Component | Props | Purpose |
|---|---|---|
| `DocumentsGrid` | `owner`, `documents?`, `canUpload`, `canRemove?`, `compact?`, `hint?` | The four document slots of a member or nominee |
| `DocumentSlot` | `owner`, `kind`, `label`, `file`, `canUpload`, `canRemove`, `onView`, `onRemove` | One slot with upload / view / remove |
| `DocumentImage` | `owner`, `kind`, `file`, `size`, `alt`, `className?` | Loads one image through the API |
| `DocumentViewerDialog`, `DocumentRemoveDialog` | `open`, `onClose`, `owner`, `kind`, … | Full view; confirm removal (on `ConfirmDialog`) |
| `MemberPhotoAvatar` | `owner`, `photo`, `name`, `size: "md" \| "lg"` | A member's photo; initials when there is none or it fails to load |
| `CurrentUserAvatar` | `size?`, `className?` | The signed-in user's avatar (photo or initials) |
| `MyPhotoControls` | `isStaff` | Upload / remove own photo (staff) or a link to the membership page (member) |

`owner` is `{ type: "member", memberNo }` or `{ type: "nominee", nomineeId }` (see
`features/documents/types.ts`).

`shrinkImageForUpload(file)` (`features/documents/prepare-image.ts`) shrinks a photo to the
longest side the backend keeps (`STORED_MAX_SIDE`, 1600 px) before it is sent; returns the original
file when it is already small or anything fails. Used by the member form.

`MemberDocumentsField` (`features/members/components/member-documents-field.tsx`) is the image part
of the add / edit member form: choose, replace, remove (undo until saved). Nothing is uploaded by it;
the files go with the form.

## Types

| Type | Path |
|---|---|
| `ApiEnvelope<T>`, `PaginationMeta`, `PaginatedResult<T>` | `types/api.ts` |
| `Address`, `AddressPart`, `ADDRESS_PARTS` | `types/address.ts` |
| `CurrentUser`, `UserRole`, `LoginPayload`, `ChangePasswordPayload` | `features/auth/types.ts` |
| Feature shapes | `features/<name>/types.ts` |
