import { CR_THRESHOLD, formatWeightPercent } from '../../utils/ahp';
import { Icon } from '../icons';
import Alert from '../ui/Alert';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Tooltip from '../ui/Tooltip';

function formatNum(value, decimals = 4) {
  return Number(value).toFixed(decimals);
}

const METRIC_INFO = {
  lambdaMax: 'λ max (lambda maksimum) adalah nilai eigen terbesar matriks perbandingan. Pada matriks konsisten sempurna, λ max = n (jumlah kriteria). Semakin besar penyimpangan dari n, semakin tidak konsisten penilaian.',
  ci: 'CI (Consistency Index) mengukur tingkat ketidakkonsistenan matriks. Rumus: CI = (λ max − n) / (n − 1). Nilai CI = 0 berarti konsisten sempurna.',
  ri: 'RI (Random Index) adalah nilai rata-rata CI dari matriks acak berukuran n. Nilai RI bervariasi tergantung jumlah kriteria (n). Digunakan sebagai pembagi untuk menghitung CR.',
  cr: 'CR (Consistency Ratio) = CI / RI. Batas konsistensi: CR ≤ 0,1 (10%). Jika CR > 0,1, penilaian perbandingan perlu diulang karena dinilai tidak konsisten.',
};

const WEIGHT_TABLE_INFO = 'Bobot prioritas dihitung dari rata-rata baris matriks ternormalisasi (eigen vector). Bobot menunjukkan tingkat kepentingan relatif setiap kriteria dalam pengambilan keputusan.';
const NORM_MATRIX_INFO = 'Matriks ternormalisasi dibuat dengan membagi setiap sel pada kolom dengan total kolom tersebut. Rata-rata setiap baris menghasilkan bobot prioritas (eigen vector).';
const PAIRWISE_RESULT_INFO = 'Hasil perhitungan AHP dari matriks perbandingan berpasangan menggunakan metode rata-rata geometrik ternormalisasi.';

function InfoIcon({ tooltip, maxWidth }) {
  return (
    <Tooltip content={tooltip} maxWidth={maxWidth ?? 240}>
      <Icon name="info" className="w-4 h-4 text-slate-400 hover:text-brand-500 cursor-help ml-1 shrink-0" />
    </Tooltip>
  );
}

export default function AHPResults({ criteria, ahpResult }) {
  if (!ahpResult || !criteria.length) return null;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-slate-900">Consistency Check</h3>
          <InfoIcon tooltip={PAIRWISE_RESULT_INFO} maxWidth={260} />
        </div>

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
          <Metric
            label="λ max"
            value={formatNum(ahpResult.lambdaMax)}
            tooltip={METRIC_INFO.lambdaMax}
          />
          <Metric
            label="CI"
            value={formatNum(ahpResult.ci)}
            tooltip={METRIC_INFO.ci}
          />
          <Metric
            label="RI"
            value={formatNum(ahpResult.randomIndex)}
            tooltip={METRIC_INFO.ri}
          />
          <Metric
            label="CR"
            value={formatNum(ahpResult.cr)}
            highlight={!ahpResult.isConsistent}
            tooltip={METRIC_INFO.cr}
          />
        </div>

        <p className="text-xs text-slate-500 mt-4 bg-slate-50 rounded-lg p-3">
          <strong>Cara baca:</strong> CR = CI / RI. Nilai CR ≤ 0,1 berarti matriks perbandingan
          cukup konsisten untuk digunakan dalam perhitungan bobot AHP.
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-slate-900">Bobot Prioritas Kriteria</h3>
          <InfoIcon tooltip={WEIGHT_TABLE_INFO} maxWidth={260} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-4 font-semibold text-slate-700">Kriteria</th>
                <th className="py-2 pr-4 font-semibold text-slate-700">Tipe</th>
                <th className="py-2 pr-4 font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    Bobot
                    <Tooltip content="Nilai eigen vector ternormalisasi. Semakin besar bobotnya, semakin penting kriteria tersebut dalam keputusan." maxWidth={220}>
                      <Icon name="info" className="w-3.5 h-3.5 text-slate-400 hover:text-brand-500 cursor-help" />
                    </Tooltip>
                  </span>
                </th>
                <th className="py-2 font-semibold text-slate-700">Persentase</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, index) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2.5 pr-4 font-medium text-slate-900">{c.name}</td>
                  <td className="py-2.5 pr-4">
                    <Tooltip
                      content={
                        c.type === 'benefit'
                          ? 'Benefit: semakin besar nilai sales, semakin baik. Eksponen positif dalam WP.'
                          : 'Cost: semakin kecil nilai sales, semakin baik. Eksponen negatif dalam WP.'
                      }
                      maxWidth={230}
                    >
                      <span>
                        <Badge variant={c.type}>
                          {c.type === 'benefit' ? 'Benefit' : 'Cost'}
                        </Badge>
                      </span>
                    </Tooltip>
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

        <p className="text-xs text-slate-500 mt-3 bg-slate-50 rounded-lg p-3">
          <strong>Cara baca:</strong> Bobot adalah tingkat kepentingan relatif tiap kriteria
          (total = 100%). Kriteria dengan bobot tertinggi memiliki pengaruh terbesar pada
          hasil ranking WP.
        </p>
      </Card>

      <Card padding={false} className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-900">
            Matriks Ternormalisasi
          </h3>
          <InfoIcon tooltip={NORM_MATRIX_INFO} maxWidth={260} />
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
                <th className="p-2 text-center text-slate-700 font-semibold">Bobot</th>
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
                  <td className="p-2 text-center font-semibold text-brand-700">
                    {formatNum(ahpResult.weights[i], 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-5 pb-4 text-xs text-slate-500">
          Setiap sel = nilai matriks asli ÷ jumlah kolom. Bobot = rata-rata baris.
        </p>
      </Card>
    </div>
  );
}

function Metric({ label, value, highlight, tooltip }) {
  return (
    <div
      className={[
        'rounded-lg border p-3',
        highlight ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-center gap-1">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        {tooltip && (
          <Tooltip content={tooltip} maxWidth={240}>
            <Icon name="info" className="w-3.5 h-3.5 text-slate-400 hover:text-brand-500 cursor-help" />
          </Tooltip>
        )}
      </div>
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
