import Badge from '../ui/Badge';

export default function SalesScoreGrid({
  sales,
  criteria,
  scores,
  onChange,
  disabled,
}) {
  if (sales.length === 0 || criteria.length === 0) {
    return (
      <p className="text-sm text-slate-500 text-center py-6">
        {sales.length === 0
          ? 'Tambah sales aktif terlebih dahulu.'
          : 'Aktifkan kriteria penilaian terlebih dahulu.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[720px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-3 py-3 text-left font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10">
              Sales
            </th>
            {criteria.map((c) => (
              <th
                key={c.id}
                className="px-3 py-3 text-center font-semibold text-slate-700 min-w-[120px]"
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="line-clamp-2">{c.name}</span>
                  <Badge variant={c.type}>
                    {c.type === 'benefit' ? 'B' : 'C'}
                  </Badge>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-3 py-2 sticky left-0 bg-white z-10 border-r border-slate-100">
                <p className="font-medium text-slate-900">{s.name}</p>
                <p className="text-xs text-slate-500">{s.employee_id}</p>
              </td>
              {criteria.map((c) => {
                const value = scores[s.id]?.[c.id] ?? '';
                const num = Number(value);
                const invalid = value !== '' && (Number.isNaN(num) || num <= 0);

                return (
                  <td key={c.id} className="px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={value}
                      onChange={(e) => onChange(s.id, c.id, e.target.value)}
                      disabled={disabled}
                      className={[
                        'w-full rounded-lg border px-2 py-1.5 text-sm text-center',
                        'focus:outline-none focus:ring-2 focus:ring-brand-500',
                        invalid
                          ? 'border-red-400 bg-red-50'
                          : 'border-slate-300 bg-white',
                        disabled ? 'opacity-60' : '',
                      ].join(' ')}
                      aria-label={`Nilai ${s.name} untuk ${c.name}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-500 mt-3">
        Semua nilai harus bilangan positif (&gt; 0) — diperlukan untuk perhitungan WP.
      </p>
    </div>
  );
}
