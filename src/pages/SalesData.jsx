import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SalesScoreGrid from '../components/sales/SalesScoreGrid';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Modal, { ModalFooter } from '../components/ui/Modal';
import { Icon } from '../components/icons';
import { useSales } from '../hooks/useSales';
import { useSalesScores } from '../hooks/useSalesScores';
import { formatPeriodLabel } from '../lib/supabase';

const TABS = [
  { id: 'sales', label: 'Daftar Sales', icon: 'users' },
  { id: 'scores', label: 'Input Nilai', icon: 'criteria' },
];

const emptySalesForm = { name: '', employee_id: '' };

function validateSalesForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Nama sales wajib diisi';
  else if (form.name.trim().length < 2) errors.name = 'Nama minimal 2 karakter';
  if (!form.employee_id.trim()) errors.employee_id = 'ID karyawan wajib diisi';
  return errors;
}

// Warna avatar berdasarkan huruf pertama nama
const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-pink-500', 'bg-indigo-500',
  'bg-cyan-500', 'bg-orange-500',
];
function avatarColor(name) {
  const code = (name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[code];
}
function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function SalesData() {
  const [activeTab, setActiveTab] = useState('sales');

  const {
    sales: allSales, loading: salesLoading, error: salesError,
    saving: salesSaving, fetchSales, createSales, updateSales, deleteSales, toggleActive,
  } = useSales();

  const {
    period, setPeriod, criteria, sales: activeSales, scores, setScore,
    loading: scoresLoading, saving: scoresSaving, error: scoresError,
    saveSuccess, loadData: loadScores, saveScores, filledCount, totalCells,
  } = useSalesScores();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [form, setForm] = useState(emptySalesForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const activeCount = allSales.filter((s) => s.is_active).length;

  function openCreateModal() {
    setEditingItem(null); setForm(emptySalesForm);
    setFieldErrors({}); setFormError(''); setFormModalOpen(true);
  }
  function openEditModal(item) {
    setEditingItem(item); setForm({ name: item.name, employee_id: item.employee_id });
    setFieldErrors({}); setFormError(''); setFormModalOpen(true);
  }
  function openDeleteModal(item) {
    setDeletingItem(item); setActionError(''); setDeleteModalOpen(true);
  }
  function closeFormModal() {
    if (salesSaving) return;
    setFormModalOpen(false); setEditingItem(null);
    setForm(emptySalesForm); setFieldErrors({}); setFormError('');
  }
  function closeDeleteModal() {
    if (salesSaving) return;
    setDeleteModalOpen(false); setDeletingItem(null); setActionError('');
  }

  async function handleSubmitSales() {
    setFormError('');
    const errors = validateSalesForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const payload = { name: form.name.trim(), employee_id: form.employee_id.trim().toUpperCase() };
    try {
      if (editingItem) await updateSales(editingItem.id, payload);
      else await createSales(payload);
      closeFormModal();
      if (activeTab === 'scores') loadScores();
    } catch (err) { setFormError(err.message); }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteSales(deletingItem.id);
      closeDeleteModal(); loadScores();
    } catch (err) { setActionError(err.message); }
  }

  async function handleToggleActive(item) {
    setActionError('');
    try {
      await toggleActive(item.id, !item.is_active); loadScores();
    } catch (err) { setActionError(err.message); }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader title="Data Sales" description="Kelola data sales dan input nilai penilaian per periode" />

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
            <Icon name={tab.icon} className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'sales' && (
        <SalesCrudSection
          allSales={allSales}
          activeCount={activeCount}
          loading={salesLoading}
          error={salesError || actionError}
          onRefresh={fetchSales}
          onAdd={openCreateModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggle={handleToggleActive}
        />
      )}

      {activeTab === 'scores' && (
        <ScoresSection
          period={period} setPeriod={setPeriod} criteria={criteria}
          activeSales={activeSales} scores={scores} setScore={setScore}
          loading={scoresLoading} saving={scoresSaving} error={scoresError}
          saveSuccess={saveSuccess} filledCount={filledCount} totalCells={totalCells}
          onRefresh={loadScores} onSave={async () => { try { await saveScores(); } catch {} }}
        />
      )}

      {/* Modal Tambah/Edit */}
      <Modal
        open={formModalOpen} onClose={closeFormModal}
        title={editingItem ? 'Edit Sales' : 'Tambah Sales Baru'}
        footer={
          <ModalFooter
            onCancel={closeFormModal} onSubmit={handleSubmitSales}
            submitLabel={editingItem ? 'Simpan' : 'Tambah'} loading={salesSaving}
          />
        }
      >
        {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
        <div className="space-y-4">
          <Input label="Nama Sales" name="name" placeholder="Contoh: Budi Santoso"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name} disabled={salesSaving} />
          <Input label="ID Karyawan" name="employee_id" placeholder="Contoh: EMP001"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value.toUpperCase() })}
            error={fieldErrors.employee_id} disabled={salesSaving} hint="Unik per karyawan" />
        </div>
      </Modal>

      {/* Modal Hapus */}
      <Modal
        open={deleteModalOpen} onClose={closeDeleteModal}
        title="Hapus Sales" size="sm"
        footer={
          <ModalFooter
            onCancel={closeDeleteModal} onSubmit={handleDelete}
            submitLabel="Ya, Hapus" loading={salesSaving} submitVariant="danger"
          />
        }
      >
        {actionError && <Alert variant="error" className="mb-4">{actionError}</Alert>}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-bold ${avatarColor(deletingItem?.name)}`}>
            {initials(deletingItem?.name)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{deletingItem?.name}</p>
            <p className="text-xs text-slate-500 font-mono">{deletingItem?.employee_id}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          Data sales ini beserta seluruh nilai penilaiannya akan <strong>dihapus permanen</strong>.
        </p>
      </Modal>
    </div>
  );
}

// ─── Tab Daftar Sales ─────────────────────────────────────────────────────────

function SalesCrudSection({ allSales, activeCount, loading, error, onRefresh, onAdd, onEdit, onDelete, onToggle }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return allSales;
    const q = search.toLowerCase();
    return allSales.filter(
      (s) => s.name.toLowerCase().includes(q) || s.employee_id.toLowerCase().includes(q)
    );
  }, [allSales, search]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat data sales...</p>
      </div>
    );
  }

  const pct = allSales.length > 0 ? Math.round((activeCount / allSales.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{allSales.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Aktif</p>
          <p className="text-2xl font-bold text-emerald-700 mt-0.5">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Non-aktif</p>
          <p className="text-2xl font-bold text-slate-600 mt-0.5">{allSales.length - activeCount}</p>
        </div>
      </div>

      {/* Progress bar */}
      {allSales.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Sales aktif</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau ID karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <Icon name="close" className="w-4 h-4" />
            </button>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={onRefresh} className="shrink-0">
          <Icon name="search" className="w-4 h-4 mr-1.5" />
          Refresh
        </Button>
        <Button onClick={onAdd} className="shrink-0">
          + Tambah Sales
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {search && filtered.length === 0 && (
        <Alert variant="info">Tidak ada sales yang cocok dengan pencarian "{search}".</Alert>
      )}

      {/* Desktop table */}
      <Card padding={false} className="hidden md:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">No</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Sales</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">ID Karyawan</th>
              <th className="px-5 py-3.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold text-slate-600 text-xs uppercase tracking-wide">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 && !search ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Icon name="users" className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">Belum ada data sales</p>
                  <button type="button" onClick={onAdd}
                    className="mt-3 text-sm text-brand-600 hover:underline font-medium">
                    + Tambah sales pertama
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => (
                <tr key={item.id} className={[
                  'group transition-colors',
                  item.is_active ? 'hover:bg-slate-50' : 'bg-slate-50/50 hover:bg-slate-100/50',
                ].join(' ')}>
                  <td className="px-5 py-3.5 text-slate-400 text-sm font-mono w-12">{index + 1}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ${avatarColor(item.name)}`}>
                        {initials(item.name)}
                      </div>
                      <span className={`font-semibold ${item.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block font-mono text-xs bg-slate-100 text-slate-600 rounded-md px-2 py-1">
                      {item.employee_id}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={[
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      item.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500',
                    ].join(' ')}>
                      <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn title="Edit" onClick={() => onEdit(item)} color="blue">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </ActionBtn>
                      <ActionBtn
                        title={item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        onClick={() => onToggle(item)}
                        color={item.is_active ? 'slate' : 'emerald'}
                      >
                        {item.is_active ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </ActionBtn>
                      <ActionBtn title="Hapus" onClick={() => onDelete(item)} color="red">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {search ? `${filtered.length} dari ${allSales.length} sales` : `${allSales.length} sales terdaftar`}
            </p>
            <p className="text-xs text-slate-400">{activeCount} aktif · {allSales.length - activeCount} nonaktif</p>
          </div>
        )}
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && !search ? (
          <Card>
            <div className="text-center py-10">
              <Icon name="users" className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Belum ada data sales</p>
              <button type="button" onClick={onAdd}
                className="mt-3 text-sm text-brand-600 hover:underline font-medium">
                + Tambah sales pertama
              </button>
            </div>
          </Card>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className={[
              'rounded-xl border p-4 space-y-3 transition-colors',
              item.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200',
            ].join(' ')}>
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white font-bold ${avatarColor(item.name)}`}>
                  {initials(item.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-base truncate ${item.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.name}
                  </p>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{item.employee_id}</p>
                </div>
                <span className={[
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0',
                  item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500',
                ].join(' ')}>
                  <span className={`h-1.5 w-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {item.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button type="button" onClick={() => onEdit(item)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button type="button" onClick={() => onToggle(item)}
                  className={[
                    'flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-sm font-medium',
                    item.is_active
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
                  ].join(' ')}>
                  {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button type="button" onClick={() => onDelete(item)}
                  className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ActionBtn({ title, onClick, color = 'slate', children }) {
  const colors = {
    blue: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200',
    emerald: 'text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200',
    red: 'text-red-600 hover:bg-red-50 hover:border-red-200',
    slate: 'text-slate-500 hover:bg-slate-100 hover:border-slate-300',
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-lg border border-transparent p-1.5 transition-colors ${colors[color] ?? colors.slate}`}
    >
      {children}
    </button>
  );
}

// ─── Tab Input Nilai ──────────────────────────────────────────────────────────

function ScoresSection({
  period, setPeriod, criteria, activeSales, scores, setScore,
  loading, saving, error, saveSuccess, filledCount, totalCells, onRefresh, onSave,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat nilai penilaian...</p>
      </div>
    );
  }

  const progress = totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0;
  const isComplete = filledCount === totalCells && totalCells > 0;

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <Card className="bg-gradient-to-r from-brand-50 to-indigo-50 border-brand-200">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <label htmlFor="score-period" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Periode Penilaian
            </label>
            <input
              id="score-period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="mt-1.5 text-sm font-semibold text-brand-700">{formatPeriodLabel(period)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onRefresh}>Muat Ulang</Button>
            <Button onClick={onSave} loading={saving} disabled={totalCells === 0}>
              Simpan Nilai
            </Button>
          </div>
        </div>

        {/* Progress */}
        {totalCells > 0 && (
          <div className="mt-4 pt-4 border-t border-brand-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${isComplete ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {isComplete ? '✅ Semua nilai terisi!' : `${filledCount} / ${totalCells} sel terisi`}
                </span>
              </div>
              <span className={`text-sm font-bold ${isComplete ? 'text-emerald-700' : 'text-brand-700'}`}>
                {progress}%
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-white/70 overflow-hidden border border-brand-100">
              <div
                className={`h-full rounded-full transition-all ${isComplete ? 'bg-emerald-500' : 'bg-brand-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {error && <Alert variant="error">{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success">
          Nilai sales berhasil disimpan untuk {formatPeriodLabel(period)}.
        </Alert>
      )}
      {criteria.length === 0 && (
        <Alert variant="warning">
          Belum ada kriteria aktif.{' '}
          <Link to="/criteria" className="underline font-medium">Kelola kriteria</Link>
        </Alert>
      )}

      {/* Score grid */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Matriks Nilai Sales × Kriteria</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Isi nilai tiap sales untuk setiap kriteria. Semua nilai harus &gt; 0.
            </p>
          </div>
        </div>
        <SalesScoreGrid
          sales={activeSales} criteria={criteria}
          scores={scores} onChange={setScore} disabled={saving}
        />
      </Card>
    </div>
  );
}
