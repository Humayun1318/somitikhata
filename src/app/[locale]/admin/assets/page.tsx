import { AppShell } from '@/components/shared/app-shell';
import { assetRows } from '@/lib/mock-data';

export default function AdminAssetsPage() {
  return (
    <AppShell variant="admin" title="Assets" actions={<button className="rounded-xl bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white">New asset</button>}>
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Asset ledger</h2>
          <span className="text-sm text-[var(--color-text-muted)]">Total value: ৳4,60,000</span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {assetRows.map((asset) => (
            <div key={asset.name} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
              <div className="mb-2 text-lg font-semibold text-[var(--color-text)]">{asset.name}</div>
              <div className="text-2xl font-bold text-[var(--color-primary)]">৳{asset.value.toLocaleString()}</div>
              <div className="mt-3 text-sm text-[var(--color-text-muted)]">Share: {asset.share} · {asset.memberCount} members</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
