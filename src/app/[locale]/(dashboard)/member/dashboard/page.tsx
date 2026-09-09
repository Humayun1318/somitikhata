import {
  memberAssetShare,
  memberDepositHistory,
  memberLoanSummary,
  memberMetrics,
} from "@/lib/mock-data";
import { formatCurrency } from "@/utils/currency";

export default function MemberDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-app-primary">
            Member workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-app-text">
            Welcome back, Member User
          </h1>
          <p className="mt-1 text-sm text-app-text-muted">
            Here is a quick view of your cooperative account.
          </p>
        </div>
        <button className="w-fit rounded-lg border border-app-border bg-app-surface px-4 py-2.5 text-sm font-semibold text-app-text">
          Download statement
        </button>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Total savings",
            formatCurrency(memberMetrics.totalSavings),
            "Your current balance",
          ],
          [
            "This month",
            formatCurrency(memberMetrics.thisMonthDeposit),
            "September deposit",
          ],
          [
            "Previous balance",
            formatCurrency(memberMetrics.previousBalance),
            "Before this month",
          ],
          [
            "Asset share",
            formatCurrency(memberAssetShare.value),
            memberAssetShare.basis,
          ],
        ].map(([label, value, meta]) => (
          <article
            key={label}
            className="rounded-2xl border border-app-border bg-app-surface p-5"
          >
            <p className="text-sm text-app-text-muted">{label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-app-text">
              {value}
            </p>
            <p className="mt-2 text-xs text-app-primary">{meta}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-app-text">
                Savings growth
              </h2>
              <p className="mt-1 text-sm text-app-text-muted">
                Your last four deposits
              </p>
            </div>
            <span className="text-sm font-semibold text-app-primary">
              +12.5%
            </span>
          </div>
          <div className="mt-8 flex h-44 items-end gap-3">
            {memberDepositHistory.map((row) => (
              <div
                key={row.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-lg bg-app-primary/80"
                  style={{ height: `${Math.max(25, row.amount / 70)}%` }}
                />
                <span className="text-xs text-app-text-muted">
                  {row.month.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <h2 className="text-lg font-semibold text-app-text">Loan status</h2>
          <p className="mt-1 text-sm text-app-text-muted">
            Your current repayment plan
          </p>
          <div className="mt-5 rounded-xl bg-app-primary/10 p-4">
            <p className="text-sm text-app-text-muted">Remaining balance</p>
            <p className="mt-2 text-2xl font-bold text-app-text">
              {formatCurrency(memberLoanSummary.remaining)}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-app-text-muted">Next installment</span>
            <span className="font-semibold text-app-text">
              {formatCurrency(memberLoanSummary.nextInstallment)}
            </span>
          </div>
          <p className="mt-2 text-xs text-app-text-muted">
            Due {memberLoanSummary.dueDate}
          </p>
        </article>
      </section>
    </div>
  );
}
