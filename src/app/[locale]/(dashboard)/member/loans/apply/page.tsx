export default function ApplyLoanPage() {
  return (
    <section className="max-w-2xl rounded-2xl border border-app-border bg-app-surface p-5">
      <h1 className="text-xl font-semibold text-app-text">Apply for a loan</h1>
      <p className="mt-2 text-sm text-app-text-muted">Send a loan application to the cooperative for review.</p>
      <form className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-app-text">
          Requested amount
          <input type="number" min="1" className="mt-2 h-11 w-full rounded-lg border border-app-border bg-white px-3" placeholder="Enter amount" />
        </label>
        <button type="submit" className="rounded-lg bg-app-primary px-4 py-2 text-sm font-semibold text-white">Submit application</button>
      </form>
    </section>
  );
}