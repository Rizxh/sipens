import { SAATY_SCALE, setPairwiseValue } from '../../utils/ahp';
import Tooltip from '../ui/Tooltip';
import { Icon } from '../icons';

const SAATY_OPTIONS = SAATY_SCALE.map((v) => ({
  value: v,
  label: String(v),
}));

const SAATY_DESC = {
  1: 'Sama penting',
  2: 'Antara sama dan sedikit lebih penting',
  3: 'Sedikit lebih penting',
  4: 'Antara sedikit dan cukup lebih penting',
  5: 'Cukup lebih penting',
  6: 'Antara cukup dan sangat lebih penting',
  7: 'Sangat lebih penting',
  8: 'Antara sangat dan mutlak lebih penting',
  9: 'Mutlak lebih penting',
};

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
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="text-sm text-slate-600">
          Bandingkan kepentingan relatif antar kriteria menggunakan skala Saaty 1–9.
        </p>
        <Tooltip
          content="Skala Saaty: 1 = sama penting, 3 = sedikit lebih penting, 5 = cukup lebih penting, 7 = sangat lebih penting, 9 = mutlak lebih penting. Nilai 2,4,6,8 adalah antara dua skala tersebut."
          maxWidth={280}
        >
          <Icon name="info" className="w-4 h-4 text-slate-400 hover:text-brand-500 cursor-help shrink-0" />
        </Tooltip>
      </div>

      <div className="overflow-x-auto -mx-1 px-1 scroll-smooth">
        <table className="w-full text-sm border-collapse min-w-[520px] sm:min-w-[640px]">
          <thead>
            <tr>
              <th className="p-2 bg-slate-100 border border-slate-200 text-left font-semibold text-slate-700 sticky left-0 z-10">
                <span className="flex items-center gap-1">
                  Kriteria (Baris vs Kolom)
                  <Tooltip
                    content="Nilai pada sel (baris, kolom) menunjukkan seberapa penting kriteria BARIS dibandingkan kriteria KOLOM. Nilai > 1 berarti baris lebih penting; nilai < 1 otomatis diisi di segitiga bawah."
                    maxWidth={270}
                  >
                    <Icon name="info" className="w-3.5 h-3.5 text-slate-400 hover:text-brand-500 cursor-help" />
                  </Tooltip>
                </span>
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
                        <Tooltip content="Diagonal selalu bernilai 1 — setiap kriteria sama penting dengan dirinya sendiri." maxWidth={200}>
                          <span className="font-semibold text-brand-700 cursor-help">1</span>
                        </Tooltip>
                      )}

                      {isUpper && (
                        <Tooltip
                          content={`Seberapa penting "${rowCriteria.name}" dibanding "${colCriteria.name}"? ${SAATY_DESC[value] ? `Nilai ${value}: ${SAATY_DESC[value]}.` : ''}`}
                          maxWidth={230}
                        >
                          <span className="block">
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
                          </span>
                        </Tooltip>
                      )}

                      {isLower && (
                        <Tooltip
                          content={`Nilai reciprokal otomatis: 1/${Math.round(1 / value) === 1 ? '1' : Math.round(1 / value)}. "${colCriteria.name}" lebih penting dari "${rowCriteria.name}".`}
                          maxWidth={230}
                        >
                          <span className="text-xs font-mono cursor-help">{formatCellValue(value)}</span>
                        </Tooltip>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-800">
          <p className="font-semibold mb-1">Panduan Skala Saaty:</p>
          <ul className="space-y-0.5">
            <li><strong>1</strong> — Sama penting</li>
            <li><strong>3</strong> — Sedikit lebih penting</li>
            <li><strong>5</strong> — Cukup lebih penting</li>
            <li><strong>7</strong> — Sangat lebih penting</li>
            <li><strong>9</strong> — Mutlak lebih penting</li>
          </ul>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
          <p className="font-semibold text-slate-700 mb-1">Cara pengisian:</p>
          <ul className="space-y-0.5">
            <li>• Edit hanya <strong>segitiga atas</strong> (latar putih)</li>
            <li>• Segitiga bawah (abu-abu) terisi otomatis (reciprokal)</li>
            <li>• Diagonal selalu = 1</li>
            <li>• Pastikan CR ≤ 0,1 untuk hasil yang valid</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
