// Dashboards and the member's own pages. Money actions on the admin side
// invalidate overviewKeys.all, so the dashboards never lag behind.
export const overviewKeys = {
  all: ["overview"] as const,
  admin: (fiscalYear: string) => [...overviewKeys.all, "admin", fiscalYear] as const,
  mine: () => [...overviewKeys.all, "mine"] as const,
  myLedger: (page: number, limit: number) => [...overviewKeys.all, "my-ledger", page, limit] as const,
  myLoans: () => [...overviewKeys.all, "my-loans"] as const,
};
