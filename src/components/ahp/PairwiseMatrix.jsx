import { SAATY_SCALE, setPairwiseValue } from '../../utils/ahp';

const SAATY_OPTIONS = SAATY_SCALE.map((v) => ({
  value: v,
  label: String(v),
}));

function formatCellValue(value) {
  if (value === 1) return '1';
  if (value < 1) {
    const denom = Math.round(1 / value);
    return `1/${denom}`;
  }
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export default function PairwiseMatrix({ criteria, matrix, onChange, disabled }) {
  if (!criteria.length || !matrix.length) return null;

  function handleChange(rowIndex, colIndex, rawValue) {
    const value = Number(rawValue);
    if (!rawValue || Number.isNaN(value)) return;

    try {
      const newMatrix = setPairwiseValue(matrix, rowIndex, colIndex, value);
      onChange(newMatrix);
    } catch {
      // abaikan input tidak valid
    }
  }

  return (
    <div className="overflow-x-auto -mx-1 px-1 scroll-smooth">
      <table className="w-full text-sm border-collapse min-w-[520px] sm:min-w-[640px]">
        <thead>
          <tr>
            <th className="p-2 bg-slate-100 border border-slate-200 text-left font-semibold text-slate-700 sticky left-0 z-10">
              Kriteria
            </th>
            {criteria.map((c) => (
              <th
                key={c.id}
                className="p-2 bg-slate-100 border border-slate-200 text-center font-semibold text-slate-700 min-w-[100px]"
                title={c.name}
              >
                <span className="line-clamp-2">{c.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((rowCriteria, i) => (
            <tr key={rowCriteria.id}>
              <td
                className="p-2 bg-slate-50 border border-slate-200 font-medium text-slate-800 sticky left-0 z-10"
                title={rowCriteria.name}
              >
                <span className="line-clamp-2">{rowCriteria.name}</span>
              </td>
              {criteria.map((colCriteria, j) => {
                const value = matrix[i][j];
                const isDiagonal = i === j;
                const isUpper = i < j;
                const isLower = i > j;

                return (
                  <td
                    key={colCriteria.id}
                    className={[
                      'p-1 border border-slate-200 text-center',
                      isDiagonal ? 'bg-brand-50' : '',
                      isUpper ? 'bg-white' : '',
                      isLower ? 'bg-slate-50 text-slate-500' : '',
                    ].join(' ')}
                  >
                    {isDiagonal && (
                      <span className="font-semibold text-brand-700">1</span>
                    )}

                    {isUpper && (
                      <select
                        value={value}
                        onChange={(e) => handleChange(i, j, e.target.value)}
                        disabled={disabled}
                        className="w-full rounded border border-slate-300 px-1 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                        aria-label={`Perbandingan ${rowCriteria.name} vs ${colCriteria.name}`}
                      >
                        {SAATY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {isLower && (
                      <span className="text-xs font-mono">{formatCellValue(value)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-slate-500 mt-3">
        Skala Saaty 1–9: 1 = sama penting, 9 = sangat lebih penting. Edit hanya
        pada segitiga atas; nilai reciprokal otomatis terisi di segitiga bawah.
      </p>
    </div>
  );
}
