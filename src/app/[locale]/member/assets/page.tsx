import { AppShell } from '@/components/shared/app-shell';
import { memberAssetShare } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils/currency';

export default function MemberAssetsPage() {
  return (
    <AppShell variant="member" title="Assets" actions={<button className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-semibold text-[var(--color-text)]">Details</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 text-xl font-semibold text-[var(--color-text)]">My shared asset</div>
        <div className="rounded-2xl bg-[rgba(15,107,79,0.08)] p-5">
          <div className="text-sm text-[var(--color-text-muted)]">Current share value</div>
          <div className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{formatCurrency(memberAssetShare.value)}</div>
          <div className="mt-2 text-sm text-[var(--color-text-muted)]">Basis: {memberAssetShare.basis}</div>
        </div>
      </section>
    </AppShell>
  );
}
