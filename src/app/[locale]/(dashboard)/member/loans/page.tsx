import { memberLoanSummary } from "@/lib/mock-data";
import { formatCurrency } from "@/utils/currency";

export default function MemberLoansPage() {
  return (
    <section className="rounded-2xl border border-app-border bg-app-surface p-5">
      <h1 className="text-xl font-semibold text-app-text">Loans</h1>
      <p className="mt-2 text-sm text-app-text-muted">
        View your loan summary and details.
      </p>
    </section>
  );
}
