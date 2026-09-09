import { StatusBadge } from "@/components/shared/status-badge";
// import { adminMembers } from "@/lib/mock-data";

export default function AdminMembersPage() {
  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-app-border bg-app-surface p-4">
          <h3 className="text-sm font-semibold text-app-text">Members</h3>
          <p className="mt-2 text-2xl font-bold text-app-text">
            {/* {adminMembers.length} */}
          </p>
        </div>
      </section>
    </div>
  );
}
