import { useMemo } from 'react';
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

function getBarColor(index, total) {
  if (total <= 1) return '#3b82f6';
  const hue = Math.round((index * 137.508) % 360);
  const saturation = 62 + (index % 3) * 5;
  const lightness = 46 + (index % 4) * 3;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function WPResultChart({ results }) {
  const chartData = useMemo(
    () =>
      (results ?? []).map((r) => ({
        name: r.name?.split(' ')[0] ?? r.employeeId,
        fullName: r.name,
        vPercent: Number((r.vValue * 100).toFixed(2)),
        rank: r.rank,
        isBest: r.isBest,
      })),
    [results]
  );

  if (!chartData.length) return null;

  const count = chartData.length;
  const crowded = count > 6;
  const veryCrowded = count > 12;
  const xAngle = veryCrowded ? -65 : crowded ? -45 : count > 3 ? -30 : 0;
  const bottomMargin = veryCrowded ? 72 : crowded ? 56 : count > 3 ? 40 : 8;
  const tickSize = veryCrowded ? 9 : crowded ? 10 : 11;

  return (
    <div
      className={[
        'w-full',
        veryCrowded ? 'h-[300px] sm:h-[340px]' : crowded ? 'h-[260px] sm:h-[300px]' : 'h-[220px] sm:h-[260px]',
      ].join(' ')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 4, left: -8, bottom: bottomMargin }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: tickSize, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            interval={0}
            angle={xAngle}
            textAnchor={xAngle ? 'end' : 'middle'}
            height={bottomMargin}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            width={42}
            label={
              count <= 8
                ? {
                    value: 'V (%)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#64748b' },
                  }
                : undefined
            }
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm max-w-[200px]">
                  <p className="font-semibold text-slate-900">{d.fullName}</p>
                  <p className="text-brand-700">V: {d.vPercent}%</p>
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
          <Bar dataKey="vPercent" radius={[4, 4, 0, 0]} maxBarSize={crowded ? 28 : 40}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${entry.fullName}-${index}`}
                fill={getBarColor(index, chartData.length)}
                stroke={entry.isBest ? '#b45309' : 'none'}
                strokeWidth={entry.isBest ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
