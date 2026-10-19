# API Communication and Data Layer

How the web app calls the SomitiKhata API and keeps server data on screen: the HTTP client,
the feature API pattern, query keys, caching, invalidation and list state.

The API itself (every endpoint, field and error) is documented in the backend repository:
[`docs/API.md`](https://github.com/Humayun1318/bottolisomobai-server/blob/main/docs/API.md) and
Swagger UI at `<backend>/api-docs`. The backend repository is private, so those links need access.

## Contents

- [Layers](#layers)
- [The HTTP client: httpKit](#the-http-client-httpkit)
- [Response shapes](#response-shapes)
- [Feature API files](#feature-api-files)
- [Query keys](#query-keys)
- [Reading data: useQuery](#reading-data-usequery)
- [Writing data: useMutation](#writing-data-usemutation)
- [Invalidation after a change](#invalidation-after-a-change)
- [List pages and URL state](#list-pages-and-url-state)
- [Money, dates and query parameters](#money-dates-and-query-parameters)
- [Images](#images)
- [Which feature calls which endpoints](#which-feature-calls-which-endpoints)
- [Rules](#rules)

## Layers

```text
Component
  └─ hook (features/<f>/hooks)        useQuery / useMutation, query keys, invalidation
       └─ api (features/<f>/api.ts)    plain async functions, params mapping, unwraps data.data
            └─ httpKit (lib/http)      axios: baseURL, cookies, 401 → refresh → retry, ApiError
                 └─ SomitiKhata API
```

Each layer has one job. Components never call `api.ts` directly for server state, and `api.ts`
never uses React.

## The HTTP client: httpKit

`src/lib/http/http-kit.ts`:

```ts
export const httpKit: AxiosInstance = axios.create({
  baseURL: getPublicEnv().NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});
attachAuthRefresh(httpKit);
```

- **The only axios instance.** Never use `fetch` or a new axios instance for the API.
- `withCredentials: true` makes the browser send and store the API's HttpOnly cookies.
- No global `Content-Type`: axios sends JSON for objects and multipart for `FormData`.
- `attachAuthRefresh` (`auth-refresh.ts`) adds the 401 → refresh → retry-once interceptor and
  converts every failure to an `ApiError` (`to-api-error.ts`). Details in
  [AUTHENTICATION.md](AUTHENTICATION.md#refreshing-the-session).

## Response shapes

`src/types/api.ts` mirrors the backend:

```ts
type ApiEnvelope<T> = { statusCode: number; success: boolean; message: string; data: T };
type PaginatedResult<T> = { meta: PaginationMeta; data: T[] };   // lists: data = { meta, data }
type PaginationMeta = {
  page: number; limit: number; skip: number; total: number; totalPages: number;
  hasNextPage: boolean; hasPreviousPage: boolean; nextPage: number | null; previousPage: number | null;
};
```

Errors arrive as `ApiError { status, message, code?, details? }`; `details` is the backend's
error body (with `errorSources`). See [ERROR_HANDLING.md](ERROR_HANDLING.md).

## Feature API files

One `api.ts` per feature, exporting an object of async functions. They map params, call
`httpKit`, and return `data.data`:

```ts
// src/features/members/api.ts (excerpt)
function toQueryParams(params: MemberListParams) {
  const search = params.search.trim();
  return {
    page: params.page,
    limit: params.limit,
    ...(search && { search }),
    ...(params.status && { status: params.status }),
    ...(params.sort && { sort: params.sort }),
    ...(params.startJoinDate && { startJoinDate: dhakaDayStart(params.startJoinDate) }),
    ...(params.endJoinDate && { endJoinDate: dhakaDayEnd(params.endJoinDate) }),
  };
}

export const memberApi = {
  list: async (params: MemberListParams): Promise<PaginatedResult<Member>> => {
    const { data } = await httpKit.get<ApiEnvelope<PaginatedResult<Member>>>("/member", {
      params: toQueryParams(params),
    });
    return data.data;
  },
  create: async (payload: CreateMemberPayload): Promise<Member> => {
    const { data } = await httpKit.post<ApiEnvelope<Member>>("/member/create", payload);
    return data.data;
  },
  // ...
};
```

Rules:

- Send **only** parameters the backend accepts (check the module's `*.builder.config.ts` or Zod
  query schema in the backend). Leave out empty values so the backend uses its defaults.
- Encode path parameters (`encodeURIComponent(memberNo)`).
- Comment each function with its method, path and what `data` holds.
- Types in `types.ts` describe the API's JSON as it is (amounts in paisa, dates as ISO strings).

## Query keys

Each feature has `query-keys.ts` with a hierarchical factory, so a prefix invalidates everything
below it:

```ts
export const memberKeys = {
  all: ["members"] as const,
  lists: () => [...memberKeys.all, "list"] as const,
  list: (params: MemberListParams) => [...memberKeys.lists(), params] as const,
};
```

| Root | Feature |
|---|---|
| `["auth", "me"]` | the signed-in user (`authKeys.me`) |
| `["members"]`, `["nominees"]`, `["users"]` (admins: `["users", "admins"]`) | people |
| `["collections"]` | passbooks, cash books, balances, samiti entries, types, accounts |
| `["loans"]`, `["settings"]`, `["year-end"]`, `["reports"]`, `["overview"]` | money areas and summaries |
| `["documents"]` | images; the image **version** is part of the key, so a replaced image is fetched again and an unchanged one never twice |

## Reading data: useQuery

```ts
export function useMembers(params: MemberListParams) {
  return useQuery<PaginatedResult<Member>, ApiError>({
    queryKey: memberKeys.list(params),
    queryFn: () => memberApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}
```

Defaults (`src/lib/query/make-query-client.ts`):

| Option | Value | Why |
|---|---|---|
| `staleTime` | 60 s (lists often override with 30 s) | Other admins change data too |
| `gcTime` | 30 min | |
| `retry` | up to 2 times, only for status 0, 408, 429, 5xx | A 4xx will not change on retry |
| `refetchOnWindowFocus` | `false` | Staff switch tabs often; refetching dimmed every list |
| `refetchOnReconnect` | `true` | |
| mutations `retry` | `false` | A payment must never be sent twice |

Rules:

- `placeholderData: keepPreviousData` keeps the old rows while the next page or search loads.
- For a list that belongs to **one thing** (a member's passbook, an account's cash book) use
  `keepPreviousInScope(queryKey, scopeIndex)` instead, so member B never shows member A's rows.
- Show the error card only when there is no data (`isError && !data`); render from `data`, not
  `isSuccess`.
- A disabled query stays `isPending`; gate skeletons on the same condition as `enabled`.
- The signed-in user: `useMe()` (`staleTime` 5 min). Under a protected layout it is already loaded.

## Writing data: useMutation

```ts
export function useCreateMember() {
  const queryClient = useQueryClient();
  return useMutation<Member, ApiError, CreateMemberPayload>({
    meta: { loadingMessage: "createMember" },
    mutationFn: memberApi.create,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: memberKeys.lists() }),
        invalidateSummaries(queryClient),
      ]),
  });
}
```

- `meta.loadingMessage` names the automatic loading toast (key under `ApiLoading` in
  `messages/<locale>/common.json`; default "Please wait…"). Typed by `AppMutationMeta`.
- Success and error toasts are shown by the **component** (it knows the right words).
- The form uses `useSubmitLock()` and `isBusy = isSubmitting || mutation.isPending`.
- Return the invalidation promise from `onSuccess` so `isPending` stays true until fresh data is
  requested.

## Invalidation after a change

Invalidate **every** key that shows the changed data. Invalidation refetches only queries on
screen and marks the rest stale, so a wide prefix is cheap.

| Helper | Where | Refreshes |
|---|---|---|
| `invalidateSummaries(queryClient)` | `features/overview/invalidate-summaries.ts` | dashboards (`overview`), `reports`, `year-end` status. Call after **any** change to money, members, loans, heads or settings. |
| `invalidateMemberViews(queryClient)` | `features/members/invalidate-member-views.ts` | member lists, member lookups and passbooks, loans, summaries |
| `useRefreshCollections()` | `features/collections/hooks/use-collection-mutations.ts` (internal) | collection views after a ledger entry |
| `useRefreshLoans(movesMoney)` | `features/loans/hooks/use-loans.ts` (internal) | loans, plus collections when money moved |
| `useRefreshMemberNominees(memberNo)` | `features/nominees/hooks/use-nominee-mutations.ts` (internal) | that member's nominees |
| `endSession(queryClient)` | `features/auth/end-session.ts` | removes everything (logout / session expired) |

A year-end run invalidates every query except the signed-in user (it changes balances
everywhere and may close the books). Uploading a member's photo also invalidates `authKeys.me`
(the member's avatar comes from it).

## List pages and URL state

The members list is the reference pattern:

- Query state (page, limit, search, filters, sort) lives in the **URL search params**, read and
  written by a `use<Thing>ListParams()` hook (`useSearchParams` + the locale-aware router).
  Refresh, back and shared links keep the view.
- One `useQuery` with those params; the backend's `meta` drives `Pagination`
  (`PAGE_SIZE_OPTIONS` 10/20/50/100). No client-side paging or filtering.
- Changing search, filters or sort resets to page 1.
- Send the search text **as typed**; the backend escapes it (escaping it here would search for
  `a\.b`).
- Tables are built from a typed `columns` array.
- Pages that read search params are wrapped in `<Suspense>` in their `page.tsx`.

## Money, dates and query parameters

| Data | Rule |
|---|---|
| Amounts in responses | **paisa** integers → display with `Money` / `formatPaisa` |
| Amounts in request bodies | **taka** numbers (`Number(input)`, max 2 decimals) |
| Amount range filters (`minAmount`/`maxAmount`) | **paisa** (compared with stored values) → `takaToPaisa()` |
| Day dates in bodies | `YYYY-MM-DD` from `<input type="date">` (today: `toDhakaDateString()`) |
| Date range filters | Whole Dhaka days: `dhakaDayStart(date)` / `dhakaDayEnd(date)` |
| Report and dashboard params | Only those the backend's Zod query schema accepts; dates as `YYYY-MM-DD`, years as `2025-26` |
| Member numbers in paths | Any form (`41`, `LBKS-0041`); the backend normalizes |

## Images

`features/documents/api.ts` fetches images with `responseType: "blob"` and turns them into
`data:` URLs (no object-URL cleanup needed). Uploads send `FormData` with one field `file`.
The image `version` from the record is part of the query key. `useMyAvatar` reads
`GET /user/me/avatar` when `useMe().data.avatar` is set; otherwise initials are shown.

## Which feature calls which endpoints

| Feature | API object(s) | Endpoints |
|---|---|---|
| `auth` | `authApi` | `POST /auth/login`, `/auth/logout`, `/auth/refresh-token`; `GET /user/me`; `PATCH /user/me/change-password` |
| `members` | `memberApi` | `GET /member`, `/member/:memberNo`, `/member/me`; `POST /member/create`; `PATCH /member/update/:memberNo`, `/member/update-status/:memberNo` |
| `nominees` | `nomineeApi` | `GET /nominee/member/:memberNo`, `/nominee/my-nominees`; `POST /nominee/create/:memberNo`; `PATCH /nominee/update/:id`; `DELETE /nominee/delete/:id` |
| `documents` | `documentApi` | `/documents/member/:memberNo/:kind`, `/documents/nominee/:id/:kind` (GET/POST/DELETE); `GET /user/me/avatar`; `POST`/`DELETE /user/me/photo` |
| `users` | `userAccountApi` | `GET /user`; `PATCH /user/update-status/:id`, `/user/reset-password/:id` |
| `admins` | `adminApi` | `GET /user` (admins); `POST /user/create-admin` |
| `collections` | `transactionApi`, `cashAccountApi`, `transactionTypeApi` | `/transactions/*` (create, society, transfer, opening, reverse, ledger, balances, cash-book, cash-balances, head-balances, opening-summary); `/cash-accounts` (list, create, update-status); `GET /transaction-types` |
| `ledger-heads` | `ledgerHeadApi` | `POST /ledger-heads/create`; `PATCH /ledger-heads/update/:id`, `/ledger-heads/update-status/:id` (heads are read with balances from `/transactions/head-balances`) |
| `loans` | `loanApi` | `GET /loans`, `/loans/:loanNo`, `/loans/eligibility/:memberNo`; `POST /loans/apply`, `/:loanNo/disburse`, `/:loanNo/repay-next-installment`; `PATCH /:loanNo/approve`, `/:loanNo/reject` |
| `settings` | `settingApi` | `GET /settings`, `/settings/:key`; `PATCH /settings/:key` |
| `year-end` | `yearEndApi` | `GET /year-end/:fiscalYear`, `/year-end/:fiscalYear/:kind`; `POST /year-end/{service-charge,dividend,appropriation}/{preview,run}`; `POST /transactions/depreciation` |
| `reports` | `reportApi` | `GET /reports/receipts-payments`, `/trial-balance`, `/income-expenditure`, `/balance-sheet`, `/dividend/:fiscalYear` |
| `overview` | `overviewApi` | `GET /dashboard/overview`, `/dashboard/my-overview`, `/transactions/my-ledger`, `/loans/my-loans` |

## Rules

- Every request through `httpKit`; never store or read tokens.
- Never invent an endpoint, parameter or field; check the backend's API docs first.
- Keep `types.ts` in sync with the backend's response; when the backend changes a shape, change
  the type and every use.
- No client-side business rules beyond instant form feedback; the backend decides (limits,
  eligibility, balances).
- Invalidate what you change; call `invalidateSummaries` for anything that touches money,
  members, loans, heads or settings.
