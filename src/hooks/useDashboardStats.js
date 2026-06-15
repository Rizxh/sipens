import { useCallback, useEffect, useState } from 'react';
import { supabase, formatPeriodLabel } from '../lib/supabase';

/**
 * Ambil periode terbaru dari beberapa tabel penilaian.
 * @returns {Promise<string|null>}
 */
async function fetchLatestPeriod() {
  const tables = ['wp_results', 'ahp_weights', 'sales_scores'];
  const periods = [];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('period')
      .order('period', { ascending: false })
      .limit(1);

    if (!error && data?.[0]?.period) {
      periods.push(data[0].period);
    }
  }

  if (periods.length === 0) return null;

  return [...periods].sort((a, b) => b.localeCompare(a))[0];
}

/**
 * Hook untuk data overview dashboard.
 */
export function useDashboardStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    salesCount: 0,
    criteriaCount: 0,
    lastPeriod: null,
    lastPeriodLabel: null,
    topSales: [],
    hasWpResults: false,
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        salesRes,
        criteriaRes,
        lastPeriod,
      ] = await Promise.all([
        supabase
          .from('sales')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('criteria')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        fetchLatestPeriod(),
      ]);

      if (salesRes.error) throw salesRes.error;
      if (criteriaRes.error) throw criteriaRes.error;

      let topSales = [];
      let hasWpResults = false;

      if (lastPeriod) {
        const { data: wpData, error: wpError } = await supabase
          .from('wp_results')
          .select(`
            rank,
            v_value,
            s_value,
            period,
            sales:sales_id (
              id,
              name,
              employee_id
            )
          `)
          .eq('period', lastPeriod)
          .order('rank', { ascending: true })
          .limit(3);

        if (wpError) throw wpError;

        hasWpResults = (wpData?.length ?? 0) > 0;
        topSales = (wpData ?? []).map((row) => ({
          rank: row.rank,
          vValue: Number(row.v_value),
          sValue: Number(row.s_value),
          name: row.sales?.name ?? '—',
          employeeId: row.sales?.employee_id ?? '—',
          salesId: row.sales?.id,
        }));
      }

      setStats({
        salesCount: salesRes.count ?? 0,
        criteriaCount: criteriaRes.count ?? 0,
        lastPeriod,
        lastPeriodLabel: lastPeriod ? formatPeriodLabel(lastPeriod) : null,
        topSales,
        hasWpResults,
      });
    } catch (err) {
      setError(err.message ?? 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
