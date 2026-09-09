export default function AdminProfilePage() {
  return (
    <div className="max-w-4xl space-y-6">
      <header>
        <p className="text-sm font-medium text-app-primary">Account</p>
        <h1 className="mt-1 text-2xl font-semibold text-app-text">
          My profile
        </h1>
        <p className="mt-1 text-sm text-app-text-muted">
          Your member information and contact details.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-app-primary text-2xl font-bold text-white">
            MU
          </div>
          <h2 className="mt-4 text-lg font-semibold text-app-text">
            Member User
          </h2>
          <p className="mt-1 text-sm text-app-text-muted">
            Member ID: SK-00654
          </p>
          <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Active member
          </span>
        </article>
        <article className="rounded-2xl border border-app-border bg-app-surface p-5">
          <h2 className="font-semibold text-app-text">Personal details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-app-text">
              Full name
              <input
                value="Member User"
                readOnly
                className="mt-2 h-11 w-full rounded-lg border border-app-border bg-app-background px-3 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-app-text">
              Phone number
              <input
                value="01700-654321"
                readOnly
                className="mt-2 h-11 w-full rounded-lg border border-app-border bg-app-background px-3 font-normal"
              />
            </label>
            <label className="text-sm font-medium text-app-text sm:col-span-2">
              Address
              <input
                value="Bottoli, Lohagara, Chattogram"
                readOnly
                className="mt-2 h-11 w-full rounded-lg border border-app-border bg-app-background px-3 font-normal"
              />
            </label>
          </div>
          <button className="mt-5 rounded-lg bg-app-primary px-4 py-2.5 text-sm font-semibold text-white">
            Request update
          </button>
        </article>
      </section>
    </div>
  );
}
