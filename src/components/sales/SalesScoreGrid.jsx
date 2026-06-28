const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-orange-500',
];
function avatarColor(name) {
  const code = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[code];
}
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function SalesScoreGrid({ sales, criteria, scores, onChange, disabled }) {
  if (sales.length === 0 || criteria.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
        <p className="text-sm font-medium text-slate-500">
          {sales.length === 0
            ? 'Tambah sales aktif terlebih dahulu di tab "Daftar Sales".'
            : 'Aktifkan kriteria penilaian di menu Manajemen Kriteria terlebih dahulu.'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1 scroll-smooth">
      <table className="w-full text-sm border-collapse" style={{ minWidth: Math.max(560, 200 + criteria.length * 140) }}>
        <thead>
          <tr>
            {/* Header kolom Sales */}
            <th className="px-4 py-3 text-left bg-slate-800 text-white text-xs font-semibold uppercase tracking-wide rounded-tl-xl sticky left-0 z-20 min-w-[180px]">
              Sales / Kriteria
            </th>
            {criteria.map((c, i) => {
              const isCost = c.type === 'cost';
              const isLast = i === criteria.length - 1;
              return (
                <th
                  key={c.id}
                  className={[
                    'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide min-w-[140px]',
                    isCost
                      ? 'bg-orange-600 text-white'
                      : 'bg-emerald-600 text-white',
                    isLast ? 'rounded-tr-xl' : '',
                  ].join(' ')}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="line-clamp-2 leading-tight">{c.name}</span>
                    <span className={[
                      'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold',
                      isCost ? 'bg-orange-800/40 text-orange-100' : 'bg-emerald-800/40 text-emerald-100',
                    ].join(' ')}>
                      {isCost ? 'Cost ↓ kecil bagus' : 'Benefit ↑ besar bagus'}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sales.map((s, rowIdx) => {
            const isLast = rowIdx === sales.length - 1;
            return (
              <tr key={s.id} className="group">
                {/* Nama sales */}
                <td className={[
                  'px-4 py-3 sticky left-0 z-10 bg-white border-r border-slate-100',
                  'group-hover:bg-slate-50 transition-colors',
                  isLast ? 'rounded-bl-xl' : '',
                ].join(' ')}>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${avatarColor(s.name)}`}>
                      {initials(s.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm">{s.name}</p>
                      <p className="text-[11px] font-mono text-slate-400">{s.employee_id}</p>
                    </div>
                  </div>
                </td>
                {/* Input nilai per kriteria */}
                {criteria.map((c, colIdx) => {
                  const value = scores[s.id]?.[c.id] ?? '';
                  const num = Number(value);
                  const invalid = value !== '' && (Number.isNaN(num) || num <= 0);
                  const filled = value !== '' && !invalid;
                  const isCost = c.type === 'cost';
                  const isLastCol = colIdx === criteria.length - 1;

                  return (
                    <td
                      key={c.id}
                      className={[
                        'px-2.5 py-2.5 group-hover:bg-slate-50 transition-colors',
                        isLast && isLastCol ? 'rounded-br-xl' : '',
                      ].join(' ')}
                    >
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={value}
                          onChange={(e) => onChange(s.id, c.id, e.target.value)}
                          disabled={disabled}
                          className={[
                            'w-full rounded-lg border-2 px-3 py-2 text-sm text-center font-semibold',
                            'focus:outline-none focus:ring-2 transition-all',
                            invalid
                              ? 'border-red-400 bg-red-50 text-red-700 focus:ring-red-300'
                              : filled
                                ? isCost
                                  ? 'border-orange-300 bg-orange-50 text-orange-800 focus:ring-orange-300 focus:border-orange-400'
                                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 focus:ring-emerald-300 focus:border-emerald-400'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 focus:ring-brand-300 focus:border-brand-400',
                            disabled ? 'opacity-60 cursor-not-allowed' : '',
                          ].join(' ')}
                          aria-label={`Nilai ${s.name} untuk ${c.name}`}
                        />
                        {invalid && (
                          <p className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-red-500">
                            harus &gt; 0
                          </p>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-emerald-400" />
          Benefit — nilai besar = performa bagus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-orange-400" />
          Cost — nilai kecil = performa bagus
        </span>
      </div>
    </div>
  );
}
