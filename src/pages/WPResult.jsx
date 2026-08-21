import { Link } from 'react-router-dom';
import WPResultChart from '../components/wp/WPResultChart';
import WPRankingTable from '../components/wp/WPRankingTable';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Tooltip from '../components/ui/Tooltip';
import { useWPResult } from '../hooks/useWPResult';
import { formatPeriodLabel } from '../lib/supabase';
import { formatVPercent } from '../utils/wp';
import { exportWPResultPDF } from '../utils/pdfExport';

export default function WPResult() {
  const {
    period,
    setPeriod,
    criteria,
    wpData,
    availablePeriods,
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
        <p className="text-base text-slate-500">Menghitung ranking WP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Hasil WP"
        description="Perankingan sales dengan metode Weighted Product (WP)"
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none min-w-[160px]">
            <label htmlFor="wp-period" className="block text-sm font-medium text-slate-600 mb-1">
              Periode Penilaian
            </label>
            {availablePeriods.length > 0 ? (
              <select
                id="wp-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodLabel(p)} ({p})
                  </option>
                ))}
                {!availablePeriods.includes(period) && (
                  <option value={period}>{formatPeriodLabel(period)} (belum ada data)</option>
                )}
              </select>
            ) : (
              <input
                id="wp-period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={loadAndCompute} className="w-full sm:w-auto">
            Hitung Ulang
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!wpData}
            onClick={() =>
              exportWPResultPDF({
                periodLabel: formatPeriodLabel(period),
                period,
                results: wpData.results,
                criteria: wpData.criteria,
                normalizedWeights: wpData.normalizedWeights,
                source: 'wp-result',
              })
            }
            className="w-full sm:w-auto"
          >
            <Icon name="download" className="w-4 h-4" />
            Ekspor PDF
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={!wpData || saving}
            className="w-full sm:w-auto"
          >
            Simpan Hasil
          </Button>
        </div>
      </PageHeader>

      {/* Status prasyarat */}
      <div className="flex flex-wrap gap-2">
        <StatusPill
          ok={prerequisites.hasWeights}
          label="Bobot AHP Tersimpan"
          tooltip="Bobot AHP harus sudah disimpan untuk periode ini di menu AHP Bobot."
        />
        <StatusPill
          ok={prerequisites.weightsConsistent}
          label="CR ≤ 0,1"
          tooltip="Consistency Ratio harus ≤ 0,1 agar bobot AHP valid."
        />
        <StatusPill
          ok={prerequisites.hasScores}
          label="Nilai Sales Lengkap"
          tooltip="Semua nilai sales × kriteria harus terisi di menu Data Sales → Input Nilai."
        />
        {hasSavedResults && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm text-emerald-700 font-medium">
            <Icon name="checkSimple" className="w-4 h-4" />
            Tersimpan di database
          </span>
        )}
      </div>

      {error && (
        <Alert variant="error">
          <p className="text-base font-semibold mb-1">Tidak dapat menghitung WP</p>
          <p className="text-sm">{error}</p>
          {!prerequisites.hasWeights && (
            <p className="mt-2 text-sm">
              <Link to="/ahp" className="underline font-medium">
                → Buka menu AHP Bobot untuk menyimpan bobot
              </Link>
            </p>
          )}
          {prerequisites.hasWeights && !prerequisites.hasScores && (
            <p className="mt-2 text-sm">
              <Link to="/sales" className="underline font-medium">
                → Buka menu Data Sales untuk mengisi nilai
              </Link>
            </p>
          )}
        </Alert>
      )}

      {saveSuccess && (
        <Alert variant="success">
          <p className="text-base font-semibold">
            Berhasil disimpan! Hasil ranking WP periode {formatPeriodLabel(period)} sudah tersimpan.
          </p>
        </Alert>
      )}

      {/* Penjelasan metode WP — teks lebih besar */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="info" className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="w-full">
            <h3 className="text-base font-bold text-blue-900 mb-3">
              Tentang Metode Weighted Product (WP)
            </h3>
            <div className="space-y-3 text-blue-800">
              <div>
                <p className="text-sm font-semibold mb-1">Langkah 1 — Hitung Nilai S:</p>
                <p className="text-sm leading-relaxed">
                  Setiap sales mendapat nilai S dengan mengalikan nilai tiap kriteria yang
                  dipangkatkan bobotnya. Kriteria <em>benefit</em> dipangkatkan{' '}
                  <strong>positif</strong> (nilai besar = baik), kriteria <em>cost</em>{' '}
                  dipangkatkan <strong>negatif</strong> (nilai kecil = baik).
                </p>
                <div className="mt-2 rounded-lg bg-blue-100 border border-blue-200 px-4 py-2.5 font-mono text-sm text-blue-900">
                  S<sub>i</sub> = ∏ (x<sub>ij</sub> ^ w<sub>j</sub>) &nbsp;·&nbsp; cost: w negatif
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Langkah 2 — Hitung Nilai V:</p>
                <p className="text-sm leading-relaxed">
                  Nilai V adalah proporsi S<sub>i</sub> terhadap total semua S.{' '}
                  <strong>Nilai V terbesar = Ranking #1 = Sales Terbaik.</strong>
                </p>
                <div className="mt-2 rounded-lg bg-blue-100 border border-blue-200 px-4 py-2.5 font-mono text-sm text-blue-900">
                  V<sub>i</sub> = S<sub>i</sub> ÷ ΣS &nbsp;·&nbsp; ΣV = 100%
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {wpData && (
        <>
          {/* Sales Terbaik */}
          {wpData.bestSales && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-amber-200 shrink-0">
                  <Icon name="trophyFilled" className="w-9 h-9 sm:w-11 sm:h-11 text-amber-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                    Sales Terbaik — {formatPeriodLabel(period)}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 truncate">
                    {wpData.bestSales.name}
                  </h2>
                  <p className="text-base text-slate-600 mt-1">
                    ID: {wpData.bestSales.employeeId}
                  </p>
                  <p className="text-lg font-bold text-amber-800 mt-1">
                    Nilai V: {formatVPercent(wpData.bestSales.vValue)}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    S = {wpData.bestSales.sValue?.toFixed(6)} · Total ΣS = {wpData.totalS.toFixed(6)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4 sm:space-y-6">
            {/* Grafik */}
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Grafik Nilai V</h2>
              <p className="text-sm text-slate-500 mb-4">
                Batang terpanjang = sales dengan performa tertinggi bulan ini.
              </p>
              <WPResultChart results={wpData.results} />
            </Card>

            {/* Ringkasan */}
            <Card>
              <h2 className="text-lg font-bold text-slate-900 mb-4">Ringkasan Perhitungan</h2>
              <dl className="space-y-3">
                <SummaryRow label="Total sales dinilai" value={wpData.results.length} />
                <SummaryRow label="Periode" value={formatPeriodLabel(period)} />
                <SummaryRow
                  label={
                    <span className="flex items-center gap-1">
                      Total ΣS
                      <Tooltip content="Jumlah semua nilai S dari seluruh sales. V_i = S_i ÷ ΣS." maxWidth={220}>
                        <Icon name="info" className="w-4 h-4 text-slate-400 hover:text-brand-500 cursor-help" />
                      </Tooltip>
                    </span>
                  }
                  value={wpData.totalS.toFixed(6)}
                  mono
                />
                <SummaryRow label="Metode" value="Weighted Product (WP)" />
                <SummaryRow label="Sumber bobot" value="AHP (periode sama)" />
              </dl>

              {/* Bobot kriteria dengan nama */}
              <h3 className="text-base font-semibold text-slate-700 mt-6 mb-3">
                Bobot Kriteria yang Digunakan
              </h3>
              <div className="space-y-3">
                {wpData.normalizedWeights.map((w, i) => {
                  const crit = wpData.criteria?.[i];
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {crit?.name ?? `Kriteria ${i + 1}`}
                          <span className={[
                            'ml-2 text-xs rounded-full px-2 py-0.5',
                            crit?.type === 'cost'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700',
                          ].join(' ')}>
                            {crit?.type === 'cost' ? 'Cost ↓' : 'Benefit ↑'}
                          </span>
                        </span>
                        <span className="font-bold text-brand-700 text-base">
                          {(w * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={[
                            'h-full rounded-full',
                            crit?.type === 'cost' ? 'bg-orange-400' : 'bg-brand-500',
                          ].join(' ')}
                          style={{ width: `${w * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Tabel ranking */}
          <WPRankingTable results={wpData.results} />

          {/* Cara baca */}
          <Card className="bg-slate-50 border-slate-200">
            <h3 className="text-base font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Icon name="info" className="w-5 h-5 text-slate-500" />
              Cara Membaca Tabel Ranking
            </h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li className="flex gap-2">
                <span className="font-bold text-slate-700 shrink-0">S (Nilai S)</span>
                <span>— hasil perkalian nilai kriteria yang dipangkatkan bobotnya. Semakin besar S, semakin baik performa sales.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-slate-700 shrink-0">V (Nilai V)</span>
                <span>— proporsi S terhadap total ΣS, dalam persen. <strong>V terbesar = Ranking #1</strong>.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-slate-700 shrink-0">Ranking</span>
                <span>— urutan dari V terbesar ke terkecil. Sales dengan V tertinggi adalah sales terbaik periode ini.</span>
              </li>
            </ul>
          </Card>
        </>
      )}

      {/* Panduan jika tidak ada data */}
      {!wpData && !error && (
        <Card>
          <div className="text-center py-8">
            <Icon name="chart" className="w-14 h-14 text-slate-200 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">Belum ada hasil WP</p>
            <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Lengkapi bobot AHP dan nilai sales, lalu klik <strong>Hitung Ulang</strong>.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusPill({ ok, label, tooltip }) {
  const pill = (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium',
        ok
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-slate-100 border-slate-200 text-slate-500',
      ].join(' ')}
    >
      {ok ? (
        <Icon name="checkSimple" className="w-4 h-4 shrink-0" />
      ) : (
        <Icon name="circle" className="w-3.5 h-3.5 shrink-0" />
      )}
      {label}
    </span>
  );

  if (!tooltip) return pill;
  return <Tooltip content={tooltip} maxWidth={220}>{pill}</Tooltip>;
}

function SummaryRow({ label, value, mono }) {
  return (
    <div className="flex justify-between gap-4 py-1 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className={[
        'text-sm',
        mono ? 'font-mono text-slate-800' : 'font-semibold text-slate-900',
      ].join(' ')}>
        {value}
      </dd>
    </div>
  );
}
