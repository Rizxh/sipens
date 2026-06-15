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

/** Warna unik per bar — golden angle agar hue terdistribusi merata */
function getBarColor(index, total) {
  if (total <= 1) return '#3b82f6';
  const hue = Math.round((index * 137.508) % 360);
  const saturation = 62 + (index % 3) * 5;
  const lightness = 46 + (index % 4) * 3;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function WPResultChart({ results }) {
  if (!results?.length) return null;

  const chartData = results.map((r) => ({
    name: r.name?.split(' ')[0] ?? r.employeeId,
    fullName: r.name,
    vPercent: Number((r.vValue * 100).toFixed(2)),
    rank: r.rank,
    isBest: r.isBest,
  }));

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={{ stroke: '#cbd5e1' }}
            label={{
              value: 'Nilai V (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#64748b' },
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-sm">
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
          <Bar dataKey="vPercent" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
