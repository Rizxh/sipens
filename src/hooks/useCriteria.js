import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCriteria() {
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCriteria = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('criteria')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setCriteria([]);
    } else {
      setCriteria(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCriteria();
  }, [fetchCriteria]);

  async function createCriteria(payload) {
    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('criteria')
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('Nama kriteria sudah digunakan');
      }
      throw new Error(insertError.message);
    }

    setCriteria((prev) => [...prev, data]);
    return data;
  }

  async function updateCriteria(id, payload) {
    setSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('criteria')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    setSaving(false);

    if (updateError) {
      if (updateError.code === '23505') {
        throw new Error('Nama kriteria sudah digunakan');
      }
      throw new Error(updateError.message);
    }

    setCriteria((prev) => prev.map((c) => (c.id === id ? data : c)));
    return data;
  }

  async function deleteCriteria(id) {
    setSaving(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('criteria')
      .delete()
      .eq('id', id);

    setSaving(false);

    if (deleteError) {
      if (deleteError.code === '23503') {
        throw new Error(
          'Kriteria tidak bisa dihapus karena masih digunakan di data penilaian'
        );
      }
      throw new Error(deleteError.message);
    }

    setCriteria((prev) => prev.filter((c) => c.id !== id));
  }

  async function toggleActive(id, isActive) {
    return updateCriteria(id, { is_active: isActive });
  }

  return {
    criteria,
    loading,
    error,
    saving,
    fetchCriteria,
    createCriteria,
    updateCriteria,
    deleteCriteria,
    toggleActive,
  };
}
