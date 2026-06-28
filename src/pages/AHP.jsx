import { Link } from 'react-router-dom';
import { useAHP } from '../hooks/useAHP';
import { formatPeriodLabel } from '../lib/supabase';
import { Icon } from '../components/icons';
import AHPResults, { SavedWeightsBanner } from '../components/ahp/AHPResults';
import PairwiseMatrix from '../components/ahp/PairwiseMatrix';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import { CR_THRESHOLD } from '../utils/ahp';

const STEPS = [
  { id: 1, label: 'Pilih Periode', short: 'Periode' },
  { id: 2, label: 'Isi Matriks',  short: 'Matriks' },
  { id: 3, label: 'Cek Konsistensi (CR ≤ 0.1)', short: 'CR ≤ 0.1' },
  { id: 4, label: 'Simpan Bobot', short: 'Simpan' },
];

function getActiveStep(criteria, ahpResult, hasSavedWeights, period) {
  if (!period) return 1;
  if (criteria.length === 0) return 2;
  if (!ahpResult || !ahpResult.isConsistent) return 3;
  if (!hasSavedWeights) return 4;
  return 4;
}

function StepBar({ activeStep, hasSavedWeights }) {
  return (
    <div className="flex items-center gap-0 sm:gap-1 overflow-x-auto pb-1">
      {STEPS.map((step, idx) => {
        const done =
          step.id < activeStep || (step.id === 4 && hasSavedWeights);
        const current = step.id === activeStep && !(step.id === 4 && hasSavedWeights);

        return (
          <div key={step.id} className="flex items-center min-w-0">
            <div
              className={[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all',
                done
                  ? 'bg-emerald-100 text-emerald-800'
                  : current
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-400',
              ].join(' ')}
            >
              {done ? (
                <Icon name="checkSimple" className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <span className={[
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold shrink-0',
                  current ? 'bg-white text-brand-700' : 'bg-slate-300 text-slate-500',
                ].join(' ')}>
                  {step.id}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
              <span className="sm:hidden">{step.short}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={[
                'h-0.5 w-4 sm:w-6 shrink-0 mx-0.5',
                step.id < activeStep ? 'bg-emerald-300' : 'bg-slate-200',
              ].join(' ')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CRBadge({ ahpResult, criteria }) {
  if (!ahpResult || criteria.length < 2) return null;

  const cr = ahpResult.cr;
  const ok = ahpResult.isConsistent;

  return (
    <div className={[
      'flex items-center gap-2 rounded-xl border px-4 py-3',
      ok
        ? 'bg-emerald-50 border-emerald-200'
        : 'bg-red-50 border-red-200',
    ].join(' ')}>
      <div className={[
        'flex h-8 w-8 items-center justify-center rounded-full shrink-0',
        ok ? 'bg-emerald-200' : 'bg-red-200',
      ].join(' ')}>
        <Icon
          name={ok ? 'check' : 'warning'}
          className={['w-4 h-4', ok ? 'text-emerald-700' : 'text-red-700'].join(' ')}
        />
      </div>
      <div>
        <p className={['text-xs font-semibold', ok ? 'text-emerald-800' : 'text-red-800'].join(' ')}>
          CR = {Number(cr).toFixed(4)}
          {ok ? ' ✓ Konsisten' : ` ✗ Belum konsisten (batas: ${CR_THRESHOLD})`}
        </p>
        {!ok && (
          <p className="text-xs text-red-700 mt-0.5">
            Sesuaikan nilai di matriks hingga CR ≤ {CR_THRESHOLD}
          </p>
        )}
      </div>
    </div>
  );
}

export default function AHP() {
  const {
    period,
    setPeriod,
    criteria,
    matrix,
    setMatrix,
    ahpResult,
    savedWeights,
    loading,
    saving,
    error,
    saveSuccess,
    loadData,
    saveAHP,
    hasSavedWeights,
  } = useAHP();

  const activeStep = getActiveStep(criteria, ahpResult, hasSavedWeights, period);
  const canSave = ahpResult?.isConsistent && criteria.length > 0 && !saving;

  async function handleSave() {
    try {
      await saveAHP();
    } catch {
      // error di hook
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat modul AHP...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Modul AHP"
        description="Pembobotan kriteria dengan Analytic Hierarchy Process"
      />

      {/* Step progress bar */}
      <StepBar activeStep={activeStep} hasSavedWeights={hasSavedWeights} />

      {/* Step 1: Periode */}
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <StepBadge n={1} done={activeStep > 1} />
          <h2 className="text-base font-semibold text-slate-900">Pilih Periode Penilaian</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="w-full sm:w-auto">
            <label htmlFor="period" className="block text-xs font-medium text-slate-600 mb-1">
              Bulan / Tahun
            </label>
            <input
              id="period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-48 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={loadData}>
            Muat Ulang
          </Button>
          <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-3 py-1.5 text-sm">
            <Icon name="calendar" className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
            <strong className="text-brand-800">{formatPeriodLabel(period)}</strong>
          </span>
        </div>

        {hasSavedWeights && <SavedWeightsBanner savedWeights={savedWeights} />}
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success">Bobot AHP berhasil disimpan untuk periode {formatPeriodLabel(period)}.</Alert>
      )}

      {/* Tidak ada kriteria */}
      {criteria.length === 0 ? (
        <Card>
          <div className="text-center py-10">
            <Icon name="criteria" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-700 font-semibold">Belum ada kriteria aktif</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Aktifkan minimal 1 kriteria di menu Manajemen Kriteria sebelum mengisi matriks AHP.
            </p>
            <Link to="/criteria">
              <Button variant="secondary">Ke Manajemen Kriteria</Button>
            </Link>
          </div>
        </Card>
      ) : criteria.length === 1 ? (
        <>
          <Alert variant="info">
            Hanya ada 1 kriteria aktif — bobot otomatis 100%. Tambah minimal 2 kriteria
            untuk menggunakan matriks perbandingan berpasangan AHP.
          </Alert>
          {ahpResult && (
            <AHPResults criteria={criteria} ahpResult={ahpResult} />
          )}
        </>
      ) : (
        <>
          {/* Step 2: Matriks */}
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <StepBadge n={2} done={activeStep > 2} />
              <h2 className="text-base font-semibold text-slate-900">Isi Matriks Perbandingan Berpasangan</h2>
            </div>
            <p className="text-sm text-slate-500 mb-4 ml-9">
              Bandingkan kepentingan setiap pasang kriteria menggunakan skala Saaty 1–9.
              Sesuaikan nilai di segitiga atas; segitiga bawah terisi otomatis.
            </p>
            <PairwiseMatrix
              criteria={criteria}
              matrix={matrix}
              onChange={setMatrix}
              disabled={saving}
            />
          </Card>

          {/* Step 3: CR live indicator */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <StepBadge n={3} done={ahpResult?.isConsistent} />
              <h2 className="text-base font-semibold text-slate-900">Cek Konsistensi (CR ≤ 0,1)</h2>
            </div>
            <CRBadge ahpResult={ahpResult} criteria={criteria} />
          </div>

          {/* AHP full results */}
          {ahpResult && <AHPResults criteria={criteria} ahpResult={ahpResult} />}

          {/* Step 4: Simpan */}
          <Card className={canSave ? 'border-brand-200 bg-brand-50/50' : 'border-slate-200'}>
            <div className="flex items-start gap-3">
              <StepBadge n={4} done={hasSavedWeights} />
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-slate-900 mb-1">Simpan Bobot AHP</h2>
                {canSave ? (
                  <p className="text-sm text-emerald-700">
                    Matriks konsisten (CR ≤ 0,1) — bobot siap disimpan untuk {formatPeriodLabel(period)}.
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">
                    {criteria.length === 0
                      ? 'Tidak ada kriteria aktif.'
                      : !ahpResult
                        ? 'Isi matriks perbandingan terlebih dahulu.'
                        : 'Perbaiki matriks hingga CR ≤ 0,1 sebelum menyimpan.'}
                  </p>
                )}
                <div className="mt-3">
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!canSave}
                    size="sm"
                  >
                    {hasSavedWeights ? 'Perbarui Bobot' : 'Simpan Bobot'}
                  </Button>
                  {hasSavedWeights && (
                    <span className="ml-3 text-xs text-emerald-700 inline-flex items-center gap-1">
                      <Icon name="checkSimple" className="w-3.5 h-3.5" />
                      Bobot tersimpan — lanjut ke{' '}
                      <Link to="/wp-result" className="underline font-medium">Hasil WP</Link>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StepBadge({ n, done }) {
  if (done) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <Icon name="checkSimple" className="w-3.5 h-3.5" />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
      {n}
    </span>
  );
}
