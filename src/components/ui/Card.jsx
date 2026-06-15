export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={[
        'bg-white rounded-xl border border-slate-200 shadow-sm',
        padding ? 'p-5 sm:p-6' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
