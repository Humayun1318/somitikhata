import { adminLoans } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AdminLoansPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-app-primary">
            Credit operations
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-app-text">
            Loan management
          </h1>
          <p className="mt-1 text-sm text-app-text-muted">
            Monitor active balances, due dates, and approval decisions.
          </p>
        </div>

        <button className="w-fit rounded-lg border border-app-border bg-app-surface px-4 py-2.5 text-sm font-semibold text-app-text">
          Export portfolio
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Portfolio balance", "৳92,000"],
          ["Active accounts", "38"],
          ["Needs attention", "7"],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-2xl border border-app-border bg-app-surface p-5"
          >
            <p className="text-sm text-app-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-app-text">{value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-app-border bg-app-surface">
        <div className="flex items-center justify-between border-b border-app-border p-5">
          <div>
            <h2 className="font-semibold text-app-text">Loan portfolio</h2>
            <p className="mt-1 text-sm text-app-text-muted">
              Latest member loan accounts
            </p>
          </div>

          <button className="text-sm font-semibold text-app-primary">
            Filter
          </button>
        </div>

        <div className="divide-y divide-app-border">
          {adminLoans.map((loan) => (
            <div
              key={loan.member}
              className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-app-text">{loan.member}</p>
                <p className="mt-1 text-sm text-app-text-muted">
                  Principal ৳{loan.principal.toLocaleString()} · Due {loan.due}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge label={loan.status} />
                <button className="rounded-lg bg-app-primary px-3 py-2 text-xs font-semibold text-white">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
