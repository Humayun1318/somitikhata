import { AppShell } from '@/components/shared/app-shell';
import { StatusBadge } from '@/components/shared/status-badge';
import { adminMembers } from '@/lib/mock-data';

export default function AdminMembersPage() {
  return (
    <AppShell variant="admin" title="Members" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Add pre-registration</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Member list</h2>
          <span className="text-sm text-[var(--color-text-muted)]">482 total</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-background)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Member</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Savings</th>
              </tr>
            </thead>
            <tbody>
              {adminMembers.map((member) => (
                <tr key={member.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[var(--color-text)]">{member.name}</div>
                    <div className="text-xs text-[var(--color-text-muted)]">{member.id}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{member.phone}</td>
                  <td className="px-4 py-3"><StatusBadge label={member.status} /></td>
                  <td className="px-4 py-3 font-semibold text-[var(--color-text)]">৳{member.totalSavings.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
