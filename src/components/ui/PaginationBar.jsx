import Button from './Button';

export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  rangeStart,
  rangeEnd,
  totalItems,
  pageSize = 10,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const safePage = Math.min(page, totalPages - 1);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 sm:px-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">
            Halaman {safePage + 1} dari {totalPages}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Baris {rangeStart}–{rangeEnd} dari {totalItems}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.max(0, safePage - 1))}
            disabled={safePage === 0}
            className="flex-1 sm:flex-none"
          >
            Sebelumnya
          </Button>
          <span className="text-xs font-medium text-slate-600 tabular-nums shrink-0 px-1">
            {safePage + 1}/{totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
            disabled={safePage >= totalPages - 1}
            className="flex-1 sm:flex-none"
          >
            Berikutnya
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 pb-1 scrollbar-thin">
        <div className="flex gap-1.5 min-w-max sm:flex-wrap sm:min-w-0">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPageChange(i)}
              title={`Halaman ${i + 1}`}
              className={[
                'min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition-colors shrink-0',
                i === safePage
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-700',
              ].join(' ')}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function usePagination(items, pageSize = 10) {
  const totalItems = items?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return { totalItems, totalPages, pageSize };
}
