import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setSales([]);
    } else {
      setSales(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  async function createSales(payload) {
    setSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from('sales')
      .insert(payload)
      .select()
      .single();

    setSaving(false);

    if (insertError) {
      if (insertError.code === '23505') {
        throw new Error('ID karyawan sudah digunakan');
      }
      throw new Error(insertError.message);
    }

    setSales((prev) => [...prev, data]);
    return data;
  }

  async function updateSales(id, payload) {
    setSaving(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('sales')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    setSaving(false);

    if (updateError) {
      if (updateError.code === '23505') {
        throw new Error('ID karyawan sudah digunakan');
      }
      throw new Error(updateError.message);
    }

    setSales((prev) => prev.map((s) => (s.id === id ? data : s)));
    return data;
  }

  async function deleteSales(id) {
    setSaving(true);
    setError(null);

    const { error: deleteError } = await supabase.from('sales').delete().eq('id', id);

    setSaving(false);

    if (deleteError) {
      if (deleteError.code === '23503') {
        throw new Error(
          'Sales tidak bisa dihapus karena masih memiliki data penilaian'
        );
      }
      throw new Error(deleteError.message);
    }

    setSales((prev) => prev.filter((s) => s.id !== id));
  }

  async function toggleActive(id, isActive) {
    return updateSales(id, { is_active: isActive });
  }

  return {
    sales,
    loading,
    error,
    saving,
    fetchSales,
    createSales,
    updateSales,
    deleteSales,
    toggleActive,
  };
}
