import { useCallback, useEffect, useState } from 'react';
import { supabase, formatPeriod } from '../lib/supabase';
import { computeWPFromRecords } from '../utils/wp';

export function useWPResult(initialPeriod) {
  const [period, setPeriod] = useState(initialPeriod ?? formatPeriod());
  const [wpData, setWpData] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [prerequisites, setPrerequisites] = useState({
    hasWeights: false,
    hasScores: false,
    weightsConsistent: false,
    missingScores: [],
  });

  const loadAndCompute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);
    setWpData(null);

    try {
      const [criteriaRes, salesRes, scoresRes, weightsRes, savedRes] =
        await Promise.all([
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
          supabase.from('ahp_weights').select('*').eq('period', period),
          supabase
            .from('wp_results')
            .select(`
              rank,
              s_value,
              v_value,
              period,
              sales:sales_id ( id, name, employee_id )
            `)
            .eq('period', period)
            .order('rank', { ascending: true }),
        ]);

      if (criteriaRes.error) throw criteriaRes.error;
      if (salesRes.error) throw salesRes.error;
      if (scoresRes.error) throw scoresRes.error;
      if (weightsRes.error) throw weightsRes.error;
      if (savedRes.error) throw savedRes.error;

      const criteria = criteriaRes.data ?? [];
      const sales = salesRes.data ?? [];
      const scores = scoresRes.data ?? [];
      const weights = weightsRes.data ?? [];

      const hasWeights = weights.length > 0;
      const weightsConsistent = weights.every((w) => w.is_consistent);

      const scoreMap = {};
      for (const row of scores) {
        if (!scoreMap[row.sales_id]) scoreMap[row.sales_id] = {};
        scoreMap[row.sales_id][row.criteria_id] = row.value;
      }

      const missingScores = [];
      for (const s of sales) {
        for (const c of criteria) {
          const val = scoreMap[s.id]?.[c.id];
          if (val === undefined || val === null || Number(val) <= 0) {
            missingScores.push(`${s.name} — ${c.name}`);
          }
        }
      }

      const hasScores = missingScores.length === 0 && sales.length > 0 && criteria.length > 0;

      setPrerequisites({
        hasWeights,
        hasScores,
        weightsConsistent,
        missingScores,
      });

      setSavedResults(
        (savedRes.data ?? []).map((row) => ({
          rank: row.rank,
          sValue: Number(row.s_value),
          vValue: Number(row.v_value),
          name: row.sales?.name ?? '—',
          employeeId: row.sales?.employee_id ?? '—',
          salesId: row.sales?.id,
        }))
      );

      if (!hasWeights) {
        setError('Bobot AHP belum tersimpan untuk periode ini. Input di menu AHP Bobot.');
        return;
      }

      if (!weightsConsistent) {
        setError('Bobot AHP periode ini tidak konsisten (CR > 0.1). Perbarui di menu AHP.');
        return;
      }

      if (!hasScores) {
        if (sales.length === 0) {
          setError('Tidak ada sales aktif.');
        } else if (criteria.length === 0) {
          setError('Tidak ada kriteria aktif.');
        } else {
          setError(
            `Nilai sales belum lengkap (${missingScores.length} sel kosong). Lengkapi di Data Sales.`
          );
        }
        return;
      }

      if (weights.length !== criteria.length) {
        setError(
          'Jumlah bobot AHP tidak sesuai dengan kriteria aktif. Simpan ulang bobot AHP.'
        );
        return;
      }

      const result = computeWPFromRecords(sales, criteria, scores, weights);
      setWpData(result);
    } catch (err) {
      setError(err.message ?? 'Gagal menghitung WP');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadAndCompute();
  }, [loadAndCompute]);

  async function saveResults() {
    if (!wpData?.results?.length) {
      throw new Error('Tidak ada hasil WP untuk disimpan');
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { error: deleteError } = await supabase
        .from('wp_results')
        .delete()
        .eq('period', period);

      if (deleteError) throw deleteError;

      const rows = wpData.results.map((r) => ({
        sales_id: r.id,
        period,
        s_value: r.sValue,
        v_value: r.vValue,
        rank: r.rank,
      }));

      const { error: insertError } = await supabase.from('wp_results').insert(rows);

      if (insertError) throw insertError;

      setSaveSuccess(true);
      await loadAndCompute();
    } catch (err) {
      setError(err.message ?? 'Gagal menyimpan hasil WP');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    period,
    setPeriod,
    wpData,
    savedResults,
    loading,
    saving,
    error,
    saveSuccess,
    prerequisites,
    loadAndCompute,
    saveResults,
    hasSavedResults: savedResults.length > 0,
  };
}
