import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import WPResultChart from '../components/wp/WPResultChart';
import WPRankingTable from '../components/wp/WPRankingTable';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Modal, { ModalFooter } from '../components/ui/Modal';
import { useHistory } from '../hooks/useHistory';
import { formatPeriodLabel } from '../lib/supabase';
import { formatVPercent } from '../utils/wp';
import { exportWPResultPDF } from '../utils/pdfExport';

export default function History() {
  const {
    periods,
    selectedPeriod,
    setSelectedPeriod,
    selectedData,
    ahpMeta,
    loading,
    detailLoading,
    error,
    fetchHistory,
    deletePeriodHistory,
  } = useHistory();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [search, setSearch] = useState('');

  const filteredPeriods = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return periods;
    return periods.filter(
      (p) =>
        p.period.includes(q) ||
        p.periodLabel.toLowerCase().includes(q) ||
        (p.bestSales?.name ?? '').toLowerCase().includes(q)
    );
  }, [periods, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat riwayat penilaian...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Riwayat Penilaian"
        description={`History hasil perankingan WP per periode (${periods.length} periode)`}
      >
        <Button variant="secondary" size="sm" onClick={fetchHistory}>
          Refresh
        </Button>
      </PageHeader>

      {error && <Alert variant="error">{error}</Alert>}

      {periods.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Icon name="folder" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">Belum ada riwayat penilaian</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Simpan hasil WP terlebih dahulu di menu Hasil WP.
            </p>
            <Link to="/wp-result">
              <Button variant="secondary">Ke Hasil WP</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
          <div className="md:col-span-4 space-y-3">
            {/* Search by month */}
            <div className="relative">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari bulan, tahun, atau nama sales…"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <Icon name="close" className="w-4 h-4" />
                </button>
              )}
            </div>

            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Daftar Periode
              {search && (
                <span className="ml-2 text-xs text-slate-500 normal-case font-normal">
                  ({filteredPeriods.length} dari {periods.length})
                </span>
              )}
            </h2>

            {filteredPeriods.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">
                  Tidak ada periode yang cocok dengan &quot;{search}&quot;.
                </p>
              </Card>
            ) : (
              filteredPeriods.map((item) => (
                <button
                  key={item.period}
                  type="button"
                  onClick={() => setSelectedPeriod(item.period)}
                  className={[
                    'w-full text-left rounded-xl border p-4 transition-all',
                    selectedPeriod === item.period
                      ? 'border-brand-400 bg-brand-50 shadow-sm ring-1 ring-brand-200'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{item.periodLabel}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.period}</p>
                    </div>
                    <Badge variant="benefit">{item.participantCount} sales</Badge>
                  </div>
                  {item.bestSales && (
                    <p className="text-sm text-amber-800 mt-2 flex items-center gap-1.5">
                      <Icon name="trophyFilled" className="w-4 h-4 shrink-0" />
                      {item.bestSales.name}
                      <span className="text-slate-500">
                        ({formatVPercent(item.bestSales.vValue)})
                      </span>
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    Disimpan: {formatDateTime(item.savedAt)}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="md:col-span-8">
            {selectedData ? (
              <PeriodDetail
                data={selectedData}
                ahpMeta={ahpMeta}
                detailLoading={detailLoading}
                onDelete={() => {
                  setDeleteError('');
                  setDeleteModalOpen(true);
                }}
              />
            ) : (
              <Card>
                <p className="text-sm text-slate-500 text-center py-8">
                  Pilih periode untuk melihat detail.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      <Modal
        open={deleteModalOpen}
        onClose={() => !deleting && setDeleteModalOpen(false)}
        title="Hapus Riwayat Periode"
        size="sm"
        footer={
          <ModalFooter
            onCancel={() => setDeleteModalOpen(false)}
            onSubmit={async () => {
              if (!selectedPeriod) return;
              setDeleting(true);
              setDeleteError('');
              try {
                await deletePeriodHistory(selectedPeriod);
                setDeleteModalOpen(false);
              } catch (err) {
                setDeleteError(err.message);
              } finally {
                setDeleting(false);
              }
            }}
            submitLabel="Ya, Hapus"
            loading={deleting}
            submitVariant="danger"
          />
        }
      >
        {deleteError && <Alert variant="error" className="mb-4">{deleteError}</Alert>}
        <p className="text-sm text-slate-600">
          Hapus semua hasil ranking untuk periode{' '}
          <strong>{formatPeriodLabel(selectedPeriod)}</strong>?
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Bobot AHP dan nilai sales tidak ikut terhapus — hanya data di wp_results.
        </p>
      </Modal>
    </div>
  );
}

function PeriodDetail({ data, ahpMeta, detailLoading, onDelete }) {
  const chartResults = data.results.map((r) => ({
    ...r,
    id: r.salesId,
    isBest: r.isBest,
  }));

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-brand-50 to-slate-50 border-brand-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Detail Periode
            </p>
            <h2 className="text-xl font-bold text-slate-900">{data.periodLabel}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {data.participantCount} sales dinilai · disimpan {formatDateTime(data.savedAt)}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                exportWPResultPDF({
                  periodLabel: data.periodLabel,
                  period: data.period,
                  results: data.results,
                  ahpMeta,
                  savedAt: data.savedAt,
                  source: 'history',
                })
              }
              className="flex-1 sm:flex-none"
            >
              <Icon name="download" className="w-4 h-4" />
              Ekspor PDF
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete} className="flex-1 sm:flex-none">
              Hapus Riwayat
            </Button>
          </div>
        </div>

        {data.bestSales && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <Icon name="trophyFilled" className="w-8 h-8 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-700">Sales Terbaik Bulan Ini</p>
              <p className="font-bold text-slate-900">{data.bestSales.name}</p>
              <p className="text-sm text-slate-600">
                {data.bestSales.employeeId} · V = {formatVPercent(data.bestSales.vValue)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {detailLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : ahpMeta ? (
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Metadata AHP (periode ini)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <MetaItem label="λ max" value={Number(ahpMeta.lambda_max).toFixed(4)} />
            <MetaItem label="CI" value={Number(ahpMeta.ci).toFixed(4)} />
            <MetaItem label="CR" value={Number(ahpMeta.cr).toFixed(4)} />
            <MetaItem
              label="Konsisten"
              value={ahpMeta.is_consistent ? 'Ya ✓' : 'Tidak ✗'}
              highlight={!ahpMeta.is_consistent}
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-1">Grafik Nilai V</h3>
        <p className="text-xs text-slate-500 mb-4">
          Nilai V = S_i ÷ ΣS — menunjukkan proporsi relatif skor setiap sales.
          Batang tertinggi = sales terbaik.
        </p>
        <WPResultChart results={chartResults} />
      </Card>

      <WPRankingTable
        results={chartResults}
        title="Ranking Lengkap"
      />
    </div>
  );
}

function MetaItem({ label, value, highlight }) {
  return (
    <div className={[
      'rounded-lg border p-3',
      highlight ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50',
    ].join(' ')}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={['font-semibold mt-0.5', highlight ? 'text-red-700' : 'text-slate-900'].join(' ')}>
        {value}
      </p>
    </div>
  );
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
