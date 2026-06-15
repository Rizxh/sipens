export default function Alert({ variant = 'error', children, className = '' }) {
  const variants = {
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-amber-200 bg-amber-50 text-amber-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    info: 'border-brand-200 bg-brand-50 text-brand-800',
  };

  return (
    <div
      className={[
        'rounded-lg border px-4 py-3 text-sm',
        variants[variant],
        className,
      ].join(' ')}
      role="alert"
    >
      {children}
    </div>
  );
}
