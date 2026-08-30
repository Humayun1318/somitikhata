import { AppShell } from '@/components/shared/app-shell';
import { memberLoanSummary } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/currency';

export default function MemberLoansPage() {
  return (
    <AppShell variant="member" title="Loans" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text)]">Apply loan</button>}>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Active loan</h2>
          <div className="mt-4 rounded-xl bg-[rgba(15,107,79,0.08)] p-4">
            <div className="text-sm text-[var(--color-text-muted)]">Outstanding</div>
            <div className="mt-2 text-3xl font-bold text-[var(--color-text)]">{formatCurrency(memberLoanSummary.remaining)}</div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center justify-between"><span>Next installment</span><span className="font-semibold text-[var(--color-text)]">{formatCurrency(memberLoanSummary.nextInstallment)}</span></div>
            <div className="flex items-center justify-between"><span>Due date</span><span className="font-semibold text-[var(--color-text)]">15 Sep 2026</span></div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Eligibility</h2>
          <div className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">Minimum membership: 6 months</div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">Loan cap: 2x savings balance</div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">Current status: eligible</div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
