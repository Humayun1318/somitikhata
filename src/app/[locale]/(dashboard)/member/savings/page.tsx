import { memberDepositHistory } from '@/lib/mock-data';
import { formatCurrency } from '@/utils/currency';

export default function MemberSavingsPage() {
  return (
    <div className="space-y-6"><header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-app-primary">Savings account</p><h1 className="mt-1 text-2xl font-semibold text-app-text">My savings</h1><p className="mt-1 text-sm text-app-text-muted">Your complete monthly savings history.</p></div><a href="/member/savings/deposit-request" className="w-fit rounded-lg bg-app-primary px-4 py-2.5 text-sm font-semibold text-white">Request deposit</a></header><section className="grid gap-4 sm:grid-cols-3">{[['Current balance', '৳81,500'], ['This month', '৳6,500'], ['Average deposit', '৳4,875']].map(([label, value]) => <article key={label} className="rounded-2xl border border-app-border bg-app-surface p-5"><p className="text-sm text-app-text-muted">{label}</p><p className="mt-2 text-2xl font-bold text-app-text">{value}</p></article>)}</section><section className="overflow-hidden rounded-2xl border border-app-border bg-app-surface"><div className="border-b border-app-border p-5"><h2 className="font-semibold text-app-text">Deposit history</h2><p className="mt-1 text-sm text-app-text-muted">Every recorded contribution to your savings account.</p></div>
      <div className="overflow-x-auto">
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
    </section></div>
  );
}
