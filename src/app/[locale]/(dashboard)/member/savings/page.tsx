import { memberDepositHistory } from '@/lib/mock-data';
import { formatCurrency } from '@/utils/currency';

export default function MemberSavingsPage() {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-app-text">My savings</h1>
        <span className="text-sm text-app-text-muted">Current total: ৳81,500</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-app-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-app-surface-muted text-app-text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Month</th>
              <th className="px-4 py-3 font-medium">Deposit</th>
              <th className="px-4 py-3 font-medium">Balance</th>
            </tr>
          </thead>
          <tbody>
            {memberDepositHistory.map((row) => (
              <tr key={row.month} className="border-t border-app-border">
                <td className="px-4 py-3 text-app-text">{row.month}</td>
                <td className="px-4 py-3 text-app-text">{formatCurrency(row.amount)}</td>
                <td className="px-4 py-3 text-app-text">{formatCurrency(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
