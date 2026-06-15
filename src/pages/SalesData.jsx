import { useState } from 'react';
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
import { useSales } from '../hooks/useSales';
import { useSalesScores } from '../hooks/useSalesScores';
import { formatPeriodLabel } from '../lib/supabase';

const TABS = [
  { id: 'sales', label: 'Data Sales' },
  { id: 'scores', label: 'Input Nilai' },
];

const emptySalesForm = {
  name: '',
  employee_id: '',
};

function validateSalesForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Nama sales wajib diisi';
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nama minimal 2 karakter';
  }

  if (!form.employee_id.trim()) {
    errors.employee_id = 'ID karyawan wajib diisi';
  }

  return errors;
}

export default function SalesData() {
  const [activeTab, setActiveTab] = useState('sales');

  const {
    sales: allSales,
    loading: salesLoading,
    error: salesError,
    saving: salesSaving,
    fetchSales,
    createSales,
    updateSales,
    deleteSales,
    toggleActive,
  } = useSales();

  const {
    period,
    setPeriod,
    criteria,
    sales: activeSales,
    scores,
    setScore,
    loading: scoresLoading,
    saving: scoresSaving,
    error: scoresError,
    saveSuccess,
    loadData: loadScores,
    saveScores,
    filledCount,
    totalCells,
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
    setEditingItem(null);
    setForm(emptySalesForm);
    setFieldErrors({});
    setFormError('');
    setFormModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setForm({ name: item.name, employee_id: item.employee_id });
    setFieldErrors({});
    setFormError('');
    setFormModalOpen(true);
  }

  function openDeleteModal(item) {
    setDeletingItem(item);
    setActionError('');
    setDeleteModalOpen(true);
  }

  function closeFormModal() {
    if (salesSaving) return;
    setFormModalOpen(false);
    setEditingItem(null);
    setForm(emptySalesForm);
    setFieldErrors({});
    setFormError('');
  }

  function closeDeleteModal() {
    if (salesSaving) return;
    setDeleteModalOpen(false);
    setDeletingItem(null);
    setActionError('');
  }

  async function handleSubmitSales() {
    setFormError('');
    const errors = validateSalesForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      employee_id: form.employee_id.trim().toUpperCase(),
    };

    try {
      if (editingItem) {
        await updateSales(editingItem.id, payload);
      } else {
        await createSales(payload);
      }
      closeFormModal();
      if (activeTab === 'scores') loadScores();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    try {
      await deleteSales(deletingItem.id);
      closeDeleteModal();
      loadScores();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleToggleActive(item) {
    setActionError('');
    try {
      await toggleActive(item.id, !item.is_active);
      loadScores();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleSaveScores() {
    try {
      await saveScores();
    } catch {
      // error di hook
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Data Sales"
        description="Kelola data sales dan input nilai penilaian per periode"
      />

      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center',
              activeTab === tab.id
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900',
            ].join(' ')}
          >
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
          period={period}
          setPeriod={setPeriod}
          criteria={criteria}
          activeSales={activeSales}
          scores={scores}
          setScore={setScore}
          loading={scoresLoading}
          saving={scoresSaving}
          error={scoresError}
          saveSuccess={saveSuccess}
          filledCount={filledCount}
          totalCells={totalCells}
          onRefresh={loadScores}
          onSave={handleSaveScores}
        />
      )}

      <Modal
        open={formModalOpen}
        onClose={closeFormModal}
        title={editingItem ? 'Edit Sales' : 'Tambah Sales'}
        footer={
          <ModalFooter
            onCancel={closeFormModal}
            onSubmit={handleSubmitSales}
            submitLabel={editingItem ? 'Simpan' : 'Tambah'}
            loading={salesSaving}
          />
        }
      >
        {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
        <div className="space-y-4">
          <Input
            label="Nama Sales"
            name="name"
            placeholder="Contoh: Budi Santoso"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name}
            disabled={salesSaving}
          />
          <Input
            label="ID Karyawan"
            name="employee_id"
            placeholder="Contoh: EMP001"
            value={form.employee_id}
            onChange={(e) =>
              setForm({ ...form, employee_id: e.target.value.toUpperCase() })
            }
            error={fieldErrors.employee_id}
            disabled={salesSaving}
            hint="Unik per karyawan"
          />
        </div>
      </Modal>

      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Hapus Sales"
        size="sm"
        footer={
          <ModalFooter
            onCancel={closeDeleteModal}
            onSubmit={handleDelete}
            submitLabel="Ya, Hapus"
            loading={salesSaving}
            submitVariant="danger"
          />
        }
      >
        {actionError && <Alert variant="error" className="mb-4">{actionError}</Alert>}
        <p className="text-sm text-slate-600">
          Yakin hapus <strong>{deletingItem?.name}</strong> ({deletingItem?.employee_id})?
        </p>
      </Modal>
    </div>
  );
}

function SalesCrudSection({
  allSales,
  activeCount,
  loading,
  error,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat data sales...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-between items-stretch sm:items-center">
        <p className="text-sm text-slate-600">
          {activeCount} aktif dari {allSales.length} sales
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={onRefresh} className="flex-1 sm:flex-none">
            Refresh
          </Button>
          <Button onClick={onAdd} className="flex-1 sm:flex-none">
            + Tambah Sales
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Card padding={false} className="overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">No</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Nama</th>
                <th className="px-4 py-3 font-semibold text-slate-700">ID Karyawan</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {allSales.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    Belum ada data sales.
                  </td>
                </tr>
              ) : (
                allSales.map((item, index) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{item.employee_id}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.is_active ? 'benefit' : 'inactive'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1 flex-wrap">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onToggle(item)}>
                          {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!text-red-600 hover:!bg-red-50"
                          onClick={() => onDelete(item)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {allSales.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Belum ada data sales.</p>
          ) : (
            allSales.map((item, index) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-400">#{index + 1}</p>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{item.employee_id}</p>
                  </div>
                  <Badge variant={item.is_active ? 'benefit' : 'inactive'}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onToggle(item)}>
                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-red-600 hover:!bg-red-50"
                    onClick={() => onDelete(item)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </>
  );
}

function ScoresSection({
  period,
  setPeriod,
  criteria,
  activeSales,
  scores,
  setScore,
  loading,
  saving,
  error,
  saveSuccess,
  filledCount,
  totalCells,
  onRefresh,
  onSave,
}) {
  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat nilai penilaian...</p>
      </div>
    );
  }

  const progress = totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <label htmlFor="score-period" className="block text-xs font-medium text-slate-600 mb-1">
              Periode Penilaian
            </label>
            <input
              id="score-period"
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <span className="text-sm text-slate-600 sm:pb-2">
            {formatPeriodLabel(period)} · {filledCount}/{totalCells} sel ({progress}%)
          </span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={onRefresh} className="flex-1 sm:flex-none">
            Muat Ulang
          </Button>
          <Button onClick={onSave} loading={saving} disabled={totalCells === 0} className="flex-1 sm:flex-none">
            Simpan Nilai
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {saveSuccess && (
        <Alert variant="success">
          Nilai sales berhasil disimpan untuk {formatPeriodLabel(period)}.
        </Alert>
      )}

      {criteria.length === 0 && (
        <Alert variant="warning">
          Belum ada kriteria aktif.{' '}
          <Link to="/criteria" className="underline font-medium">
            Kelola kriteria
          </Link>
        </Alert>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Matriks Nilai Sales × Kriteria
        </h2>
        <SalesScoreGrid
          sales={activeSales}
          criteria={criteria}
          scores={scores}
          onChange={setScore}
          disabled={saving}
        />
      </Card>
    </>
  );
}
