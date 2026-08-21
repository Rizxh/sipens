import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../icons';
import Badge from '../ui/Badge';
import PaginationBar, { usePagination } from '../ui/PaginationBar';
import { calculateVStats, classifyPerformance, formatVPercent, PERFORMANCE_META } from '../../utils/wp';

const PAGE_SIZE = 10;

export default function WPRankingTable({ results, title = 'Tabel Ranking' }) {
  const [page, setPage] = useState(0);

  const sorted = useMemo(
    () => [...(results ?? [])].sort((a, b) => a.rank - b.rank),
    [results]
  );

  const vStats = useMemo(
    () => calculateVStats(sorted.map((r) => r.vValue)),
    [sorted]
  );

  const { totalItems, totalPages } = usePagination(sorted, PAGE_SIZE);
  const safePage = Math.min(page, totalPages - 1);

  const pageRows = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, safePage]);

  const rangeStart = sorted.length ? safePage * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, sorted.length);

  useEffect(() => {
    setPage(0);
  }, [results]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  if (!sorted.length) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-xs text-slate-500">{totalItems} sales · {PAGE_SIZE}/halaman</span>
      </div>

      <PaginationBar
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={totalItems}
        className="px-4 sm:px-5 pt-4"
      />

      <div className="overflow-x-auto mt-2">
        <table className="w-full text-sm min-w-[320px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-left">
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-14">Rank</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700">Nama</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">ID</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 text-right hidden md:table-cell">S</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 text-right">V</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell w-24">Status</th>
              <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-28">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const category = classifyPerformance(row.vValue, vStats);
              const note = PERFORMANCE_META[category];

              return (
              <tr
                key={row.id ?? row.salesId ?? `${row.employeeId}-${row.rank}`}
                className={[
                  'border-b border-slate-100',
                  row.isBest ? 'bg-amber-50/60' : 'hover:bg-slate-50/80',
                ].join(' ')}
              >
                <td className="px-3 sm:px-4 py-3">
                  <span
                    className={[
                      'inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full font-bold text-xs sm:text-sm',
                      row.rank === 1
                        ? 'bg-amber-200 text-amber-900'
                        : row.rank === 2
                          ? 'bg-slate-200 text-slate-700'
                          : row.rank === 3
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {row.rank}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 font-medium text-slate-900 max-w-[140px] sm:max-w-none">
                  <span className="block truncate" title={row.name}>{row.name}</span>
                  <span className="sm:hidden text-xs font-mono text-slate-500">{row.employeeId}</span>
                </td>
                <td className="px-3 sm:px-4 py-3 font-mono text-slate-600 hidden sm:table-cell">
                  {row.employeeId}
                </td>
                <td className="px-3 sm:px-4 py-3 text-right font-mono text-slate-700 text-xs hidden md:table-cell">
                  {Number(row.sValue).toFixed(6)}
                </td>
                <td className="px-3 sm:px-4 py-3 text-right font-semibold text-brand-700 whitespace-nowrap">
                  {formatVPercent(row.vValue)}
                </td>
                <td className="px-3 sm:px-4 py-3 hidden sm:table-cell">
                  {row.isBest ? (
                    <Badge variant="benefit">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="star" className="w-3 h-3 shrink-0" />
                        <span className="hidden md:inline">Terbaik</span>
                      </span>
                    </Badge>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <Badge variant={note.badgeVariant}>{note.label}</Badge>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 sm:hidden">
        {pageRows.some((r) => r.isBest) && (
          <p className="text-xs text-amber-700 inline-flex items-center gap-1">
            <Icon name="star" className="w-3.5 h-3.5" />
            Sales terbaik ada di halaman ini
          </p>
        )}
      </div>

      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-medium text-slate-600">Catatan:</span>
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="poor">Kurang Baik</Badge> V di bawah rata-rata
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="good">Baik</Badge> V ≥ rata-rata
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Badge variant="excellent">Sangat Baik</Badge> V ≥ rata-rata + std. deviasi
        </span>
      </div>
    </div>
  );
}
