import { AppShell } from '@/components/shared/app-shell';

export default function AdminSettingsPage() {
  return (
    <AppShell variant="admin" title="Settings" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text)]">Save changes</button>}>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Organization settings</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Organization name</label>
              <input value="Bashabo Somiti" className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)]" readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Phone</label>
              <input value="01711-223344" className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)]" readOnly />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Staff permissions</h2>
          <div className="space-y-3">
            {['Deposit entry', 'Loan review', 'Member management', 'Asset valuation'].map((permission) => (
              <div key={permission} className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3">
                <span className="text-sm text-[var(--color-text)]">{permission}</span>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Enabled</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
