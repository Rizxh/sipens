export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500 disabled:bg-brand-300',
    secondary:
      'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-brand-500',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-brand-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-70',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  );
}
