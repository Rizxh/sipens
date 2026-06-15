import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Icon } from '../icons';
import PaginationBar from '../ui/PaginationBar';

const PAGE_SIZE = 10;

function getBarColor(index, total) {
  if (total <= 1) return '#3b82f6';
  const hue = Math.round((index * 137.508) % 360);
  const saturation = 62 + (index % 3) * 5;
  const lightness = 46 + (index % 4) * 3;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function toChartRow(r) {
  return {
    name: r.name?.split(' ')[0] ?? r.employeeId,
    fullName: r.name,
    employeeId: r.employeeId,
    vPercent: Number((r.vValue * 100).toFixed(2)),
    rank: r.rank,
    isBest: r.isBest,
    vValue: r.vValue,
  };
}

export default function WPResultChart({ results }) {
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(0);

  const allData = useMemo(() => (results ?? []).map(toChartRow), [results]);

  const sortedData = useMemo(() => {
    return [...allData].sort((a, b) =>
      sortOrder === 'desc' ? b.vValue - a.vValue : a.vValue - b.vValue
    );
  }, [allData, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const pageData = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, safePage]);

  const rangeStart = sortedData.length ? safePage * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, sortedData.length);

  useEffect(() => {
    setPage(0);
  }, [results, sortOrder]);

  useEffect(() => {
    if (page >= totalPages) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  if (!allData.length) return null;

  const sortLabel = sortOrder === 'desc' ? 'terbesar → terendah' : 'terendah → terbesar';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
            {allData.length} sales
          </span>
          <span className="text-xs text-slate-500">
            {PAGE_SIZE}/halaman · {totalPages} bagian
          </span>
        </div>

        <div className="flex rounded-lg bg-slate-100 p-0.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setSortOrder('desc')}
            className={[
              'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              sortOrder === 'desc'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Terbesar dulu
          </button>
          <button
            type="button"
            onClick={() => setSortOrder('asc')}
            className={[
              'flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              sortOrder === 'asc'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            Terendah dulu
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 -mt-1">
        Bagian {safePage + 1} · Peringkat {rangeStart}–{rangeEnd} · Urutan {sortLabel}
      </p>

      <PaginationBar
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalItems={sortedData.length}
      />

      <div className="w-full h-[240px] sm:h-[280px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pageData}
            margin={{ top: 8, right: 4, left: -4, bottom: 44 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={44}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              width={40}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm max-w-[220px]">
                    <p className="font-semibold text-slate-900">{d.fullName}</p>
                    <p className="text-xs text-slate-500 font-mono">{d.employeeId}</p>
                    <p className="text-brand-700 mt-1">V: {d.vPercent}%</p>
                    <p className="text-slate-500">Rank #{d.rank}</p>
                    {d.isBest && (
                      <p className="text-amber-600 font-medium mt-1 inline-flex items-center gap-1">
                        <Icon name="star" className="w-3.5 h-3.5" />
                        Sales Terbaik
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar dataKey="vPercent" radius={[6, 6, 0, 0]} maxBarSize={42}>
              {pageData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.employeeId}-${entry.rank}`}
                  fill={getBarColor(index, pageData.length)}
                  stroke={entry.isBest ? '#b45309' : 'none'}
                  strokeWidth={entry.isBest ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {pageData.map((row) => (
          <div
            key={row.employeeId}
            className={[
              'rounded-lg border px-2.5 py-2 text-xs min-w-0',
              row.isBest
                ? 'border-amber-200 bg-amber-50/80'
                : 'border-slate-200 bg-white',
            ].join(' ')}
          >
            <p className="font-semibold text-slate-900 truncate" title={row.fullName}>
              #{row.rank} {row.name}
            </p>
            <p className="text-brand-700 font-medium mt-0.5">{row.vPercent}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
