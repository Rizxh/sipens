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

  async function handleSave() {
    try {
      await saveAHP();
    } catch {
      // error ditangani di hook
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
    <div className="space-y-6">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Modul AHP</h1>
          <p className="text-slate-500 mt-1">
            Pembobotan kriteria dengan Analytic Hierarchy Process
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="period" className="block text-xs font-medium text-slate-600 mb-1">
              Periode Penilaian
            </label>
            <input
              id="period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button variant="secondary" size="sm" onClick={loadData}>
            Muat Ulang
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
            disabled={
              !ahpResult?.isConsistent ||
              criteria.length === 0 ||
              saving
            }
          >
            Simpan Bobot
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
        <span className="inline-flex items-center rounded-full bg-brand-50 border border-brand-200 px-3 py-1">
          Periode: <strong className="ml-1 text-brand-800">{formatPeriodLabel(period)}</strong>
        </span>
        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-3 py-1">
          {criteria.length} kriteria aktif
        </span>
        {hasSavedWeights && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700">
            <Icon name="checkSimple" className="w-4 h-4" />
            Bobot tersimpan
          </span>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success">Bobot AHP berhasil disimpan untuk periode ini.</Alert>
      )}
      {hasSavedWeights && <SavedWeightsBanner savedWeights={savedWeights} />}

      {criteria.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-slate-700 font-medium">Belum ada kriteria aktif</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Aktifkan minimal 1 kriteria sebelum input matriks AHP.
            </p>
            <Link to="/criteria">
              <Button variant="secondary">Ke Manajemen Kriteria</Button>
            </Link>
          </div>
        </Card>
      ) : criteria.length === 1 ? (
        <>
          <Alert variant="info">
            Hanya 1 kriteria aktif — bobot otomatis 100%. Tambah kriteria untuk
            matriks perbandingan berpasangan.
          </Alert>
          {ahpResult && <AHPResults criteria={criteria} ahpResult={ahpResult} />}
        </>
      ) : (
        <>
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Matriks Perbandingan Berpasangan
            </h2>
            <PairwiseMatrix
              criteria={criteria}
              matrix={matrix}
              onChange={setMatrix}
              disabled={saving}
            />
          </Card>

          {ahpResult && <AHPResults criteria={criteria} ahpResult={ahpResult} />}
        </>
      )}

      {ahpResult && !ahpResult.isConsistent && criteria.length > 1 && (
        <Alert variant="warning">
          Tombol <strong>Simpan Bobot</strong> dinonaktifkan sampai CR ≤ 0.1.
          Sesuaikan nilai perbandingan pada matriks di atas.
        </Alert>
      )}
    </div>
  );
}
