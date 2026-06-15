import { Link } from 'react-router-dom';
import WPResultChart from '../components/wp/WPResultChart';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useWPResult } from '../hooks/useWPResult';
import { formatPeriodLabel } from '../lib/supabase';
import { formatVPercent } from '../utils/wp';

export default function WPResult() {
  const {
    period,
    setPeriod,
    wpData,
    loading,
    saving,
    error,
    saveSuccess,
    prerequisites,
    loadAndCompute,
    saveResults,
    hasSavedResults,
  } = useWPResult();

  async function handleSave() {
    try {
      await saveResults();
    } catch {
      // error di hook
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Menghitung ranking WP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hasil WP</h1>
          <p className="text-slate-500 mt-1">
            Perankingan sales dengan metode Weighted Product
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="wp-period" className="block text-xs font-medium text-slate-600 mb-1">
              Periode Penilaian
            </label>
            <input
              id="wp-period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={loadAndCompute}>
            Hitung Ulang
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!wpData || saving}
          >
            Simpan Hasil
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        <StatusPill ok={prerequisites.hasWeights} label="Bobot AHP" />
        <StatusPill ok={prerequisites.weightsConsistent} label="CR ≤ 0.1" />
        <StatusPill ok={prerequisites.hasScores} label="Nilai sales lengkap" />
        {hasSavedResults && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">
            <Icon name="checkSimple" className="w-4 h-4" />
            Tersimpan di database
          </span>
        )}
      </div>

      {error && (
        <Alert variant="error">
          {error}
          {!prerequisites.hasWeights && (
            <span className="block mt-2">
              <Link to="/ahp" className="underline font-medium">
                → Ke Modul AHP
              </Link>
            </span>
          )}
          {prerequisites.hasWeights && !prerequisites.hasScores && (
            <span className="block mt-2">
              <Link to="/sales" className="underline font-medium">
                → Ke Data Sales
              </Link>
            </span>
          )}
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success">
          Hasil ranking WP berhasil disimpan untuk {formatPeriodLabel(period)}.
        </Alert>
      )}

      {wpData && (
        <>
          {wpData.bestSales && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-200">
                  <Icon name="trophyFilled" className="w-9 h-9 text-amber-800" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Sales Terbaik — {formatPeriodLabel(period)}
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                    {wpData.bestSales.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {wpData.bestSales.employeeId} · Nilai V:{' '}
                    <strong className="text-amber-800">
                      {formatVPercent(wpData.bestSales.vValue)}
                    </strong>
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Grafik Nilai V
              </h2>
              <WPResultChart results={wpData.results} />
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Ringkasan Perhitungan
              </h2>
              <dl className="space-y-3 text-sm">
                <SummaryRow label="Total alternatif (sales)" value={wpData.results.length} />
                <SummaryRow
                  label="Total Σ S"
                  value={wpData.totalS.toFixed(6)}
                  mono
                />
                <SummaryRow label="Metode" value="Weighted Product (WP)" />
                <SummaryRow label="Sumber bobot" value="AHP (periode sama)" />
              </dl>

              <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-2">
                Bobot ternormalisasi
              </h3>
              <div className="space-y-2">
                {wpData.normalizedWeights.map((w, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${w * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-slate-600">
                      {(w * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card padding={false} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Tabel Ranking
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-700">Rank</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Nama Sales</th>
                    <th className="px-4 py-3 font-semibold text-slate-700">ID Karyawan</th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                      Nilai S
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                      Nilai V
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {wpData.results.map((row) => (
                    <tr
                      key={row.id}
                      className={[
                        'border-b border-slate-100',
                        row.isBest ? 'bg-amber-50/60' : 'hover:bg-slate-50/80',
                      ].join(' ')}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={[
                            'inline-flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
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
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {row.employeeId}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {row.sValue.toFixed(6)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-700">
                        {formatVPercent(row.vValue)}
                      </td>
                      <td className="px-4 py-3">
                        {row.isBest ? (
                          <Badge variant="benefit">
                            <span className="inline-flex items-center gap-1">
                              <Icon name="star" className="w-3 h-3" />
                              Sales Terbaik
                            </span>
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusPill({ ok, label }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
        ok
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-slate-100 border-slate-200 text-slate-500',
      ].join(' ')}
    >
      {ok ? (
        <Icon name="checkSimple" className="w-4 h-4" />
      ) : (
        <Icon name="circle" className="w-3 h-3" />
      )}
      {label}
    </span>
  );
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={mono ? 'font-mono text-slate-800' : 'font-medium text-slate-900'}>
        {value}
      </dd>
    </div>
  );
}
