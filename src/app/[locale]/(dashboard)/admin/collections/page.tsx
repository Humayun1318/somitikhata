import { adminDeposits } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";

export default function AdminCollectionsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-app-primary">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold text-app-text">
            Monthly collections
          </h1>
          <p className="mt-1 text-sm text-app-text-muted">
            Record and review member savings for August 2026.
          </p>
        </div>
        <button className="w-fit rounded-lg bg-app-primary px-4 py-2.5 text-sm font-semibold text-white">
          Save collection
        </button>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Expected total", "৳18,500"],
          ["Recorded", "৳12,700"],
          ["Completion", "68.6%"],
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
        <div className="flex flex-col justify-between gap-3 border-b border-app-border p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-app-text">
              Member collection register
            </h2>
            <p className="mt-1 text-sm text-app-text-muted">
              Update amounts before closing the month.
            </p>
          </div>
          <input
            className="h-10 rounded-lg border border-app-border bg-white px-3 text-sm"
            placeholder="Search member"
          />
        </div>
        <div className="divide-y divide-app-border">
          {adminDeposits.map((row) => (
            <div
              key={row.member}
              className="grid gap-3 p-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr_0.5fr] sm:items-center"
            >
              <div>
                <p className="font-medium text-app-text">{row.member}</p>
                <p className="text-xs text-app-text-muted">{row.month}</p>
              </div>
              <input
                value={`৳${row.amount.toLocaleString()}`}
                readOnly
                className="h-10 rounded-lg border border-app-border bg-app-background px-3 text-sm text-app-text"
              />
              <span className="text-sm text-app-text-muted">
                Monthly deposit
              </span>
              <StatusBadge label={row.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
