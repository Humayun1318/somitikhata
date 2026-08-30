const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  inactive: 'bg-slate-200 text-slate-700',
  sent: 'bg-emerald-100 text-emerald-700',
  recorded: 'bg-emerald-100 text-emerald-700',
  missing: 'bg-red-100 text-red-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  default: 'bg-slate-100 text-slate-700',
};

export function StatusBadge({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  const classes = statusStyles[normalized] ?? statusStyles.default;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}
