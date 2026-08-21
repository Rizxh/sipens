export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    benefit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cost: 'bg-orange-50 text-orange-700 border-orange-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    poor: 'bg-red-50 text-red-700 border-red-200',
    good: 'bg-blue-50 text-blue-700 border-blue-200',
    excellent: 'bg-amber-50 text-amber-700 border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
