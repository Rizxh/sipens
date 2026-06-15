import { CR_THRESHOLD, formatWeightPercent } from '../../utils/ahp';
import { Icon } from '../icons';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

function formatNum(value, decimals = 4) {
  return Number(value).toFixed(decimals);
}

export default function AHPResults({ criteria, ahpResult }) {
  if (!ahpResult || !criteria.length) return null;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Consistency Check
        </h3>

        <div
          className={[
            'rounded-xl border p-4 mb-4',
            ahpResult.isConsistent
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200',
          ].join(' ')}
        >
          <div className="flex items-start gap-3">
            {ahpResult.isConsistent ? (
              <Icon name="check" className="w-7 h-7 text-emerald-600 shrink-0" />
            ) : (
              <Icon name="warning" className="w-7 h-7 text-red-600 shrink-0" />
            )}
            <div>
              <p
                className={[
                  'font-semibold',
                  ahpResult.isConsistent ? 'text-emerald-800' : 'text-red-800',
                ].join(' ')}
              >
                {ahpResult.consistencyMessage}
              </p>
              {!ahpResult.isConsistent && (
                <p className="text-sm text-red-700 mt-1">
                  Penilaian tidak konsisten, harap ulangi perbandingan (CR &gt; {CR_THRESHOLD})
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Metric label="λ max" value={formatNum(ahpResult.lambdaMax)} />
          <Metric label="CI" value={formatNum(ahpResult.ci)} />
          <Metric label="RI" value={formatNum(ahpResult.randomIndex)} />
          <Metric
            label="CR"
            value={formatNum(ahpResult.cr)}
            highlight={!ahpResult.isConsistent}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">
          Bobot Prioritas Kriteria
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-semibold text-slate-700">Kriteria</th>
                <th className="py-2 pr-4 font-semibold text-slate-700">Tipe</th>
                <th className="py-2 pr-4 font-semibold text-slate-700">Bobot</th>
                <th className="py-2 font-semibold text-slate-700">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, index) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-900">{c.name}</td>
                  <td className="py-2.5 pr-4">
                    <Badge variant={c.type}>
                      {c.type === 'benefit' ? 'Benefit' : 'Cost'}
                    </Badge>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-slate-700">
                    {formatNum(ahpResult.weights[index], 6)}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${ahpResult.weights[index] * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-brand-700 min-w-[48px]">
                        {formatWeightPercent(ahpResult.weights[index])}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding={false} className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">
            Matriks Ternormalisasi
          </h3>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr>
                <th className="p-2 text-left text-slate-600" />
                {criteria.map((c) => (
                  <th key={c.id} className="p-2 text-center text-slate-600 min-w-[72px]">
                    {c.name.slice(0, 12)}
                    {c.name.length > 12 ? '…' : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((rowC, i) => (
                <tr key={rowC.id}>
                  <td className="p-2 font-sans font-medium text-slate-700">
                    {rowC.name.slice(0, 16)}
                  </td>
                  {criteria.map((colC, j) => (
                    <td key={colC.id} className="p-2 text-center text-slate-600">
                      {formatNum(ahpResult.normalizedMatrix[i][j], 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value, highlight }) {
  return (
    <div
      className={[
        'rounded-lg border p-3',
        highlight ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p
        className={[
          'text-lg font-bold mt-0.5',
          highlight ? 'text-red-700' : 'text-slate-900',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  );
}

export function SavedWeightsBanner({ savedWeights }) {
  if (!savedWeights.length) return null;

  const cr = savedWeights[0]?.cr;
  const isConsistent = savedWeights[0]?.is_consistent;

  return (
    <Alert variant={isConsistent ? 'success' : 'warning'}>
      Bobot AHP periode ini sudah tersimpan (CR: {Number(cr).toFixed(4)}).
      {isConsistent
        ? ' Data siap digunakan untuk perhitungan WP.'
        : ' Disarankan untuk memperbarui perbandingan.'}
    </Alert>
  );
}
