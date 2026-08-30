import { AppShell } from '@/components/shared/app-shell';

export default function MemberProfilePage() {
  return (
    <AppShell variant="member" title="Profile" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">Save</button>}>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Contact info</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Full name</label>
              <input value="Rahim Uddin" className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)]" readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Phone</label>
              <input value="01711-222333" className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)]" readOnly />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email</label>
              <input value="rahim@email.com" className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text)]" readOnly />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
          <h2 className="mb-4 text-xl font-semibold text-[var(--color-text)]">Preferences</h2>
          <div className="space-y-3">
            {['Deposit reminders via SMS', 'Loan due alerts', 'Language preference: English'].map((pref) => (
              <div key={pref} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-3 text-sm text-[var(--color-text)]">{pref}</div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
