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
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Hasil WP"
        description="Perankingan sales dengan metode Weighted Product"
      >
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none min-w-[140px]">
            <label htmlFor="wp-period" className="block text-xs font-medium text-slate-600 mb-1">
              Periode Penilaian
            </label>
            <input
              id="wp-period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={loadAndCompute} className="w-full sm:w-auto">
            Hitung Ulang
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
      <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
        <StatusPill ok={prerequisites.hasWeights} label="Bobot AHP" shortLabel="AHP"
          tooltip="Bobot AHP harus sudah disimpan untuk periode ini di menu AHP Bobot." />
        <StatusPill ok={prerequisites.weightsConsistent} label="CR ≤ 0.1" shortLabel="CR"
          tooltip="Consistency Ratio harus ≤ 0,1 agar bobot AHP dapat digunakan." />
        <StatusPill ok={prerequisites.hasScores} label="Nilai sales lengkap" shortLabel="Nilai"
          tooltip="Semua sel nilai sales × kriteria harus terisi positif di menu Data Sales." />
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

      {/* Penjelasan metode WP */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="info" className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Tentang Metode Weighted Product (WP)
            </h3>
            <div className="text-xs text-blue-800 space-y-2">
              <p>
                <strong>Langkah 1 — Hitung Nilai S:</strong> Setiap sales (alternatif) mendapat
                nilai S dengan mengalikan nilai tiap kriteria yang dipangkatkan bobotnya.
                Kriteria <em>benefit</em> dipangkatkan positif (nilai besar = baik),
                kriteria <em>cost</em> dipangkatkan negatif (nilai kecil = baik).
              </p>
              <p className="font-mono bg-blue-100 rounded px-2 py-1">
                S_i = ∏ (x_ij ^ w_j) &nbsp;·&nbsp; cost → w negatif
              </p>
              <p>
                <strong>Langkah 2 — Hitung Nilai V:</strong> Nilai V adalah proporsi S_i
                terhadap total semua S. Nilai V terbesar = ranking #1 = sales terbaik.
              </p>
              <p className="font-mono bg-blue-100 rounded px-2 py-1">
                V_i = S_i ÷ ΣS &nbsp;·&nbsp; ΣV = 100%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {wpData && (
        <>
          {wpData.bestSales && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-amber-200 shrink-0">
                  <Icon name="trophyFilled" className="w-8 h-8 sm:w-9 sm:h-9 text-amber-800" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Sales Terbaik — {formatPeriodLabel(period)}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 truncate">
                    {wpData.bestSales.name}
                  </h2>
                  <p className="text-sm text-slate-600">
                    {wpData.bestSales.employeeId} · Nilai V:{' '}
                    <strong className="text-amber-800">
                      {formatVPercent(wpData.bestSales.vValue)}
                    </strong>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Nilai S: {wpData.bestSales.sValue?.toFixed(6)} dari total ΣS = {wpData.totalS.toFixed(6)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">
                Grafik Nilai V
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Batang menunjukkan nilai V (proporsi relatif) setiap sales.
                Batang terpanjang = sales dengan performa tertinggi bulan ini.
              </p>
              <WPResultChart results={wpData.results} />
            </Card>

            <Card>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-4">
                Ringkasan Perhitungan
              </h2>
              <dl className="space-y-3 text-sm">
                <SummaryRow label="Total alternatif (sales)" value={wpData.results.length} />
                <SummaryRow
                  label={
                    <span className="flex items-center gap-1">
                      Total ΣS
                      <Tooltip content="Jumlah semua nilai S dari seluruh sales. Nilai V dihitung dengan membagi S_i ÷ ΣS." maxWidth={220}>
                        <Icon name="info" className="w-3.5 h-3.5 text-slate-400 hover:text-brand-500 cursor-help" />
                      </Tooltip>
                    </span>
                  }
                  value={wpData.totalS.toFixed(6)}
                  mono
                />
                <SummaryRow label="Metode" value="Weighted Product (WP)" />
                <SummaryRow label="Sumber bobot" value="AHP (periode sama)" />
              </dl>

              <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-3 flex items-center gap-1">
                Bobot Ternormalisasi per Kriteria
                <Tooltip content="Bobot ternormalisasi adalah bobot AHP yang dinormalisasi ulang agar totalnya tepat = 1. Digunakan sebagai eksponen dalam formula WP." maxWidth={240}>
                  <Icon name="info" className="w-3.5 h-3.5 text-slate-400 hover:text-brand-500 cursor-help" />
                </Tooltip>
              </h3>
              <div className="space-y-2">
                {wpData.normalizedWeights.map((w, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-28 sm:w-36 truncate text-slate-600 shrink-0">
                      Kriteria {i + 1}
                    </div>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${w * 100}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono text-slate-600 shrink-0">
                      {(w * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <WPRankingTable results={wpData.results} />

          <Card className="bg-slate-50 border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Icon name="info" className="w-4 h-4 text-slate-500" />
              Cara Membaca Tabel Ranking
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>
                <strong>S (Nilai S)</strong> — hasil perkalian nilai kriteria yang dipangkatkan
                bobotnya. Semakin besar S, semakin baik performa sales.
              </li>
              <li>
                <strong>V (Nilai V)</strong> — proporsi S terhadap total ΣS, dinyatakan dalam
                persen. V terbesar = ranking #1.
              </li>
              <li>
                <strong>Ranking</strong> — urutan dari V terbesar (terbaik) ke terkecil. Sales
                dengan V tertinggi adalah sales terbaik periode ini.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

function StatusPill({ ok, label, shortLabel, tooltip }) {
  const pill = (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1',
        ok
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-slate-100 border-slate-200 text-slate-500',
      ].join(' ')}
    >
      {ok ? (
        <Icon name="checkSimple" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
      ) : (
        <Icon name="circle" className="w-3 h-3 shrink-0" />
      )}
      <span className="sm:hidden">{shortLabel ?? label}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );

  if (!tooltip) return pill;

  return (
    <Tooltip content={tooltip} maxWidth={220}>
      {pill}
    </Tooltip>
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
