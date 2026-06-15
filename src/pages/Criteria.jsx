import { useState } from 'react';
import { useCriteria } from '../hooks/useCriteria';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';
import Modal, { ModalFooter } from '../components/ui/Modal';
import Select from '../components/ui/Select';

const TYPE_OPTIONS = [
  { value: 'benefit', label: 'Benefit — semakin besar semakin baik' },
  { value: 'cost', label: 'Cost — semakin kecil semakin baik' },
];

const emptyForm = {
  name: '',
  type: 'benefit',
  description: '',
};

function validateForm(form) {
  const errors = {};

  if (!form.name.trim()) {
    errors.name = 'Nama kriteria wajib diisi';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Nama minimal 3 karakter';
  }

  if (!['benefit', 'cost'].includes(form.type)) {
    errors.type = 'Tipe harus benefit atau cost';
  }

  return errors;
}

export default function Criteria() {
  const {
    criteria,
    loading,
    error,
    saving,
    fetchCriteria,
    createCriteria,
    updateCriteria,
    deleteCriteria,
    toggleActive,
  } = useCriteria();

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const activeCount = criteria.filter((c) => c.is_active).length;

  function openCreateModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setFieldErrors({});
    setFormError('');
    setFormModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setForm({
      name: item.name,
      type: item.type,
      description: item.description ?? '',
    });
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
    if (saving) return;
    setFormModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
    setFieldErrors({});
    setFormError('');
  }

  function closeDeleteModal() {
    if (saving) return;
    setDeleteModalOpen(false);
    setDeletingItem(null);
    setActionError('');
  }

  async function handleSubmitForm() {
    setFormError('');
    const errors = validateForm(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || null,
    };

    try {
      if (editingItem) {
        await updateCriteria(editingItem.id, payload);
      } else {
        await createCriteria(payload);
      }
      closeFormModal();
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;

    try {
      await deleteCriteria(deletingItem.id);
      closeDeleteModal();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function handleToggleActive(item) {
    setActionError('');
    try {
      await toggleActive(item.id, !item.is_active);
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat kriteria...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Manajemen Kriteria"
        description={`Kelola kriteria penilaian sales (${activeCount} aktif dari ${criteria.length} total)`}
      >
        <Button variant="secondary" size="sm" onClick={fetchCriteria}>
          Refresh
        </Button>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          + Tambah Kriteria
        </Button>
      </PageHeader>

      {(error || actionError) && (
        <Alert variant="error">{actionError || error}</Alert>
      )}

      <Card padding={false} className="overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-700">No</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Nama Kriteria</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tipe</th>
                <th className="px-4 py-3 font-semibold text-slate-700 hidden md:table-cell">
                  Deskripsi
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {criteria.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Belum ada kriteria. Klik &quot;Tambah Kriteria&quot; untuk memulai.
                  </td>
                </tr>
              ) : (
                criteria.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.type}>
                        {item.type === 'benefit' ? 'Benefit' : 'Cost'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600 hidden md:table-cell max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.is_active ? 'benefit' : 'inactive'}>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item)}
                        >
                          {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="!text-red-600 hover:!bg-red-50"
                          onClick={() => openDeleteModal(item)}
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
          {criteria.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Belum ada kriteria. Klik &quot;Tambah Kriteria&quot; untuk memulai.
            </p>
          ) : (
            criteria.map((item, index) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400">#{index + 1}</p>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <Badge variant={item.is_active ? 'benefit' : 'inactive'}>
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.type}>
                    {item.type === 'benefit' ? 'Benefit' : 'Cost'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleToggleActive(item)}>
                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-red-600 hover:!bg-red-50"
                    onClick={() => openDeleteModal(item)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 mb-2">Keterangan Tipe</h2>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            <strong>Benefit</strong> — semakin besar nilainya semakin baik (contoh: omset, retensi)
          </li>
          <li>
            <strong>Cost</strong> — semakin kecil nilainya semakin baik (contoh: biaya operasional)
          </li>
        </ul>
      </Card>

      {/* Modal tambah/edit */}
      <Modal
        open={formModalOpen}
        onClose={closeFormModal}
        title={editingItem ? 'Edit Kriteria' : 'Tambah Kriteria'}
        footer={
          <ModalFooter
            onCancel={closeFormModal}
            onSubmit={handleSubmitForm}
            submitLabel={editingItem ? 'Simpan Perubahan' : 'Tambah'}
            loading={saving}
          />
        }
      >
        {formError && (
          <Alert variant="error" className="mb-4">
            {formError}
          </Alert>
        )}

        <div className="space-y-4">
          <Input
            label="Nama Kriteria"
            name="name"
            placeholder="Contoh: Target Omset"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={fieldErrors.name}
            disabled={saving}
          />

          <Select
            label="Tipe Kriteria"
            name="type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={TYPE_OPTIONS}
            error={fieldErrors.type}
            disabled={saving}
            hint="Tipe menentukan perhitungan WP (eksponen positif/negatif)"
          />

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
              Deskripsi (opsional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="Penjelasan singkat kriteria..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={saving}
            />
          </div>
        </div>
      </Modal>

      {/* Modal konfirmasi hapus */}
      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Hapus Kriteria"
        size="sm"
        footer={
          <ModalFooter
            onCancel={closeDeleteModal}
            onSubmit={handleDelete}
            submitLabel="Ya, Hapus"
            loading={saving}
            submitVariant="danger"
          />
        }
      >
        {actionError && (
          <Alert variant="error" className="mb-4">
            {actionError}
          </Alert>
        )}
        <p className="text-sm text-slate-600">
          Yakin ingin menghapus kriteria{' '}
          <strong className="text-slate-900">{deletingItem?.name}</strong>?
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Kriteria yang masih dipakai di data AHP atau penilaian sales tidak bisa dihapus.
        </p>
      </Modal>
    </div>
  );
}
