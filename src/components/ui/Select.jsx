export default function Select({
  label,
  id,
  error,
  hint,
  options = [],
  className = '',
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white',
          'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
          error ? 'border-red-400 bg-red-50' : 'border-slate-300',
        ].join(' ')}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
