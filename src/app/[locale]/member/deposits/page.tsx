import { AppShell } from '@/components/shared/app-shell';
import { memberDepositHistory } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/currency';

export default function MemberDepositsPage() {
  return (
    <AppShell variant="member" title="Deposits" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Add deposit</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">My deposit history</h2>
          <span className="text-sm text-[var(--color-text-muted)]">Current total: ৳81,500</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Month</th>
                <th className="px-4 py-3 font-medium">Deposit</th>
                <th className="px-4 py-3 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {memberDepositHistory.map((row) => (
                <tr key={row.month} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 text-[var(--color-text)]">{row.month}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
