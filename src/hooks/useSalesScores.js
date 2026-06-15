import { useCallback, useEffect, useState } from 'react';
import { supabase, formatPeriod } from '../lib/supabase';

/**
 * Hook untuk input nilai sales per kriteria per periode.
 */
export function useSalesScores(initialPeriod) {
  const [period, setPeriod] = useState(initialPeriod ?? formatPeriod());
  const [criteria, setCriteria] = useState([]);
  const [sales, setSales] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const [criteriaRes, salesRes, scoresRes] = await Promise.all([
        supabase
          .from('criteria')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
        supabase
          .from('sales')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true }),
        supabase.from('sales_scores').select('*').eq('period', period),
      ]);

      if (criteriaRes.error) throw criteriaRes.error;
      if (salesRes.error) throw salesRes.error;
      if (scoresRes.error) throw scoresRes.error;

      const activeCriteria = criteriaRes.data ?? [];
      const activeSales = salesRes.data ?? [];

      setCriteria(activeCriteria);
      setSales(activeSales);

      const scoreMap = {};
      for (const row of scoresRes.data ?? []) {
        if (!scoreMap[row.sales_id]) scoreMap[row.sales_id] = {};
        scoreMap[row.sales_id][row.criteria_id] = String(row.value);
      }

      setScores(scoreMap);
    } catch (err) {
      setError(err.message ?? 'Gagal memuat nilai sales');
      setCriteria([]);
      setSales([]);
      setScores({});
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function setScore(salesId, criteriaId, value) {
    setScores((prev) => ({
      ...prev,
      [salesId]: {
        ...(prev[salesId] ?? {}),
        [criteriaId]: value,
      },
    }));
    setSaveSuccess(false);
  }

  function validateScores() {
    const errors = [];
    const missing = [];

    for (const s of sales) {
      for (const c of criteria) {
        const raw = scores[s.id]?.[c.id];
        if (raw === undefined || raw === '') {
          missing.push(`${s.name} — ${c.name}`);
          continue;
        }

        const num = Number(raw);
        if (Number.isNaN(num) || num <= 0) {
          errors.push(`${s.name} / ${c.name}: nilai harus bilangan positif`);
        }
      }
    }

    return { errors, missing };
  }

  async function saveScores() {
    if (sales.length === 0) {
      throw new Error('Tidak ada sales aktif');
    }
    if (criteria.length === 0) {
      throw new Error('Tidak ada kriteria aktif');
    }

    const { errors, missing } = validateScores();

    if (missing.length > 0) {
      throw new Error(`Lengkapi semua nilai (${missing.length} sel kosong)`);
    }
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const rows = [];

      for (const s of sales) {
        for (const c of criteria) {
          rows.push({
            sales_id: s.id,
            criteria_id: c.id,
            period,
            value: Number(scores[s.id][c.id]),
          });
        }
      }

      const { error: upsertError } = await supabase
        .from('sales_scores')
        .upsert(rows, { onConflict: 'sales_id,criteria_id,period' });

      if (upsertError) throw upsertError;

      setSaveSuccess(true);
    } catch (err) {
      setError(err.message ?? 'Gagal menyimpan nilai sales');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  const filledCount = sales.reduce((acc, s) => {
    const filled = criteria.filter((c) => {
      const v = scores[s.id]?.[c.id];
      return v !== undefined && v !== '';
    }).length;
    return acc + filled;
  }, 0);

  const totalCells = sales.length * criteria.length;

  return {
    period,
    setPeriod,
    criteria,
    sales,
    scores,
    setScore,
    loading,
    saving,
    error,
    saveSuccess,
    loadData,
    saveScores,
    filledCount,
    totalCells,
  };
}
