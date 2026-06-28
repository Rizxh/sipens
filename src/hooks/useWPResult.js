import { useCallback, useEffect, useState } from 'react';
import { supabase, formatPeriod } from '../lib/supabase';
import { computeWPFromRecords } from '../utils/wp';

/**
 * Temukan periode terbaru yang punya data AHP weights di DB.
 * Dipakai sebagai fallback jika periode saat ini kosong.
 */
async function findLatestDataPeriod() {
  const { data } = await supabase
    .from('ahp_weights')
    .select('period')
    .order('period', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.period ?? null;
}

export function useWPResult(initialPeriod) {
  const [period, setPeriod] = useState(initialPeriod ?? formatPeriod());
  const [criteria, setCriteria] = useState([]);
  const [wpData, setWpData] = useState(null);
  const [savedResults, setSavedResults] = useState([]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
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
      const [criteriaRes, salesRes, scoresRes, weightsRes, savedRes, periodsRes] =
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
            .select(`rank, s_value, v_value, period, sales:sales_id ( id, name, employee_id )`)
            .eq('period', period)
            .order('rank', { ascending: true }),
          // Ambil semua periode yang punya data
          supabase
            .from('ahp_weights')
            .select('period')
            .order('period', { ascending: false }),
        ]);

      if (criteriaRes.error) throw criteriaRes.error;
      if (salesRes.error) throw salesRes.error;
      if (scoresRes.error) throw scoresRes.error;
      if (weightsRes.error) throw weightsRes.error;
      if (savedRes.error) throw savedRes.error;

      const activeCriteria = criteriaRes.data ?? [];
      const sales = salesRes.data ?? [];
      const scores = scoresRes.data ?? [];
      const weights = weightsRes.data ?? [];

      setCriteria(activeCriteria);

      // Kumpulkan periode yang tersedia
      const periods = [...new Set((periodsRes.data ?? []).map((r) => r.period))];
      setAvailablePeriods(periods);

      const hasWeights = weights.length > 0;
      const weightsConsistent = weights.every((w) => w.is_consistent);

      const scoreMap = {};
      for (const row of scores) {
        if (!scoreMap[row.sales_id]) scoreMap[row.sales_id] = {};
        scoreMap[row.sales_id][row.criteria_id] = row.value;
      }

      const missingScores = [];
      for (const s of sales) {
        for (const c of activeCriteria) {
          const val = scoreMap[s.id]?.[c.id];
          if (val === undefined || val === null || Number(val) <= 0) {
            missingScores.push(`${s.name} — ${c.name}`);
          }
        }
      }

      const hasScores =
        missingScores.length === 0 && sales.length > 0 && activeCriteria.length > 0;

      setPrerequisites({ hasWeights, hasScores, weightsConsistent, missingScores });

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
        // Jika tidak ada bobot AHP untuk periode ini, cari periode lain
        if (periods.length > 0 && periods[0] !== period) {
          setError(
            `Belum ada bobot AHP untuk periode ini. Tersedia: ${periods.slice(0, 3).join(', ')}. ` +
              `Pilih periode yang tersedia atau input bobot AHP di menu AHP Bobot.`
          );
        } else {
          setError('Bobot AHP belum tersimpan untuk periode ini. Input di menu AHP Bobot.');
        }
        return;
      }

      if (!weightsConsistent) {
        setError('Bobot AHP periode ini tidak konsisten (CR > 0.1). Perbarui di menu AHP.');
        return;
      }

      if (!hasScores) {
        if (sales.length === 0) {
          setError('Tidak ada sales aktif. Tambahkan data sales terlebih dahulu.');
        } else if (activeCriteria.length === 0) {
          setError('Tidak ada kriteria aktif. Aktifkan kriteria di menu Manajemen Kriteria.');
        } else {
          setError(
            `Nilai sales belum lengkap (${missingScores.length} sel kosong). ` +
              `Lengkapi nilai di menu Data Sales → tab Input Nilai.`
          );
        }
        return;
      }

      if (weights.length !== activeCriteria.length) {
        setError(
          `Jumlah bobot AHP (${weights.length}) tidak sesuai kriteria aktif (${activeCriteria.length}). ` +
            `Simpan ulang bobot AHP di menu AHP Bobot.`
        );
        return;
      }

      const result = computeWPFromRecords(sales, activeCriteria, scores, weights);
      setWpData({ ...result, criteria: activeCriteria });
    } catch (err) {
      setError(err.message ?? 'Gagal menghitung WP');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Auto-switch ke periode terakhir yang ada data saat pertama kali load
  useEffect(() => {
    async function initPeriod() {
      if (initialPeriod) return; // jika sudah di-set manual, skip
      const latest = await findLatestDataPeriod();
      if (latest && latest !== period) {
        setPeriod(latest);
      }
    }
    initPeriod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    criteria,
    wpData,
    savedResults,
    availablePeriods,
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
