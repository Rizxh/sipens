import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, formatPeriodLabel } from '../lib/supabase';

/**
 * Kelompokkan baris wp_results per periode.
 */
function groupByPeriod(rows) {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.period)) {
      map.set(row.period, {
        period: row.period,
        periodLabel: formatPeriodLabel(row.period),
        savedAt: row.created_at,
        results: [],
      });
    }

    const group = map.get(row.period);
    group.results.push({
      rank: row.rank,
      sValue: Number(row.s_value),
      vValue: Number(row.v_value),
      name: row.sales?.name ?? '—',
      employeeId: row.sales?.employee_id ?? '—',
      salesId: row.sales?.id,
      isBest: row.rank === 1,
    });

    if (new Date(row.created_at) > new Date(group.savedAt)) {
      group.savedAt = row.created_at;
    }
  }

  for (const group of map.values()) {
    group.results.sort((a, b) => a.rank - b.rank);
    group.bestSales = group.results.find((r) => r.rank === 1) ?? null;
    group.participantCount = group.results.length;
  }

  return [...map.values()].sort((a, b) => b.period.localeCompare(a.period));
}

export function useHistory() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [ahpMeta, setAhpMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('wp_results')
        .select(`
          period,
          rank,
          s_value,
          v_value,
          created_at,
          sales:sales_id ( id, name, employee_id )
        `)
        .order('period', { ascending: false })
        .order('rank', { ascending: true });

      if (fetchError) throw fetchError;

      const grouped = groupByPeriod(data ?? []);
      setPeriods(grouped);

      if (grouped.length > 0) {
        setSelectedPeriod((prev) =>
          prev && grouped.some((g) => g.period === prev) ? prev : grouped[0].period
        );
      } else {
        setSelectedPeriod(null);
      }
    } catch (err) {
      setError(err.message ?? 'Gagal memuat riwayat penilaian');
      setPeriods([]);
      setSelectedPeriod(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const selectedData = useMemo(
    () => periods.find((p) => p.period === selectedPeriod) ?? null,
    [periods, selectedPeriod]
  );

  useEffect(() => {
    if (!selectedPeriod) {
      setAhpMeta(null);
      return;
    }

    let mounted = true;

    async function loadAhpMeta() {
      setDetailLoading(true);

      const { data, error: metaError } = await supabase
        .from('ahp_weights')
        .select('lambda_max, ci, cr, is_consistent, created_at')
        .eq('period', selectedPeriod)
        .limit(1)
        .maybeSingle();

      if (!mounted) return;

      if (metaError) {
        setAhpMeta(null);
      } else {
        setAhpMeta(data);
      }

      setDetailLoading(false);
    }

    loadAhpMeta();

    return () => {
      mounted = false;
    };
  }, [selectedPeriod]);

  async function deletePeriodHistory(period) {
    const { error: deleteError } = await supabase
      .from('wp_results')
      .delete()
      .eq('period', period);

    if (deleteError) throw new Error(deleteError.message);

    await fetchHistory();
  }

  return {
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
  };
}
