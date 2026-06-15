export default function PageHeader({ title, description, children }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-sm sm:text-base text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          {children}
        </div>
      )}
    </header>
  );
}
