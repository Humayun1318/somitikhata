
import { StatusBadge } from '@/components/shared/status-badge';
import { adminLoans } from '@/lib/mock-data';

export default function AdminLoansPage() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-app-border bg-app-surface p-4">
          <h3 className="text-sm font-semibold text-app-text">Loans</h3>
          <p className="mt-2 text-2xl font-bold text-app-text">
            {/* {adminLoans.length} */}
          </p>
        </div>
      </section>
    </div>
  );
}
