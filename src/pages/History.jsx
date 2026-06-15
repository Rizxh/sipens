import { useState } from 'react';
import { Link } from 'react-router-dom';
import WPResultChart from '../components/wp/WPResultChart';
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
          <div className="md:col-span-4 space-y-2 sm:space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Daftar Periode
            </h2>
            {periods.map((item) => (
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
            ))}
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              Detail Periode
            </p>
            <h2 className="text-xl font-bold text-slate-900">{data.periodLabel}</h2>
            <p className="text-sm text-slate-500 mt-1">
              {data.participantCount} sales dinilai · disimpan {formatDateTime(data.savedAt)}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={onDelete}>
            Hapus Riwayat
          </Button>
        </div>

        {data.bestSales && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <Icon name="trophyFilled" className="w-8 h-8 text-amber-700 shrink-0" />
            <div>
              <p className="text-xs font-medium text-amber-700">Sales Terbaik</p>
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
              value={ahpMeta.is_consistent ? 'Ya' : 'Tidak'}
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <h3 className="text-base font-semibold text-slate-900 mb-4">Grafik Nilai V</h3>
        <WPResultChart results={chartResults} />
      </Card>

      <Card padding={false} className="overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Ranking Lengkap</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">Rank</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Nama</th>
                <th className="px-4 py-3 font-semibold text-slate-700">ID</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">S</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">V</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((row) => (
                <tr
                  key={row.salesId}
                  className={row.isBest ? 'bg-amber-50/60 border-b border-slate-100' : 'border-b border-slate-100'}
                >
                  <td className="px-4 py-3 font-bold text-slate-700">#{row.rank}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {row.name}
                    {row.isBest && (
                      <span className="ml-2">
                        <Badge variant="benefit">Terbaik</Badge>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{row.employeeId}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">
                    {row.sValue.toFixed(6)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-700">
                    {formatVPercent(row.vValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 mt-0.5">{value}</p>
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