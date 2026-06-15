import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, formatPeriod } from '../lib/supabase';
import {
  buildMatrixFromComparisons,
  computeAHP,
  createEmptyMatrix,
} from '../utils/ahp';

/**
 * Ekstrak perbandingan berpasangan (segitiga atas) dari matriks.
 */
export function matrixToComparisons(criteriaOrder, matrix) {
  const comparisons = [];

  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix.length; j++) {
      comparisons.push({
        criteria_a_id: criteriaOrder[i],
        criteria_b_id: criteriaOrder[j],
        value: matrix[i][j],
      });
    }
  }

  return comparisons;
}

export function useAHP(initialPeriod) {
  const [period, setPeriod] = useState(initialPeriod ?? formatPeriod());
  const [criteria, setCriteria] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [savedWeights, setSavedWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const criteriaOrder = useMemo(
    () => criteria.map((c) => c.id),
    [criteria]
  );

  const ahpResult = useMemo(() => {
    if (matrix.length === 0) return null;
    try {
      return computeAHP(matrix);
    } catch {
      return null;
    }
  }, [matrix]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (criteriaError) throw criteriaError;

      const activeCriteria = criteriaData ?? [];
      setCriteria(activeCriteria);

      if (activeCriteria.length === 0) {
        setMatrix([]);
        setSavedWeights([]);
        setLoading(false);
        return;
      }

      const order = activeCriteria.map((c) => c.id);

      const [comparisonsRes, weightsRes] = await Promise.all([
        supabase
          .from('ahp_comparisons')
          .select('criteria_a_id, criteria_b_id, value')
          .eq('period', period),
        supabase
          .from('ahp_weights')
          .select('*')
          .eq('period', period)
          .order('created_at', { ascending: true }),
      ]);

      if (comparisonsRes.error) throw comparisonsRes.error;
      if (weightsRes.error) throw weightsRes.error;

      const comparisons = comparisonsRes.data ?? [];
      const weights = weightsRes.data ?? [];

      if (comparisons.length > 0) {
        setMatrix(buildMatrixFromComparisons(order, comparisons));
      } else {
        setMatrix(createEmptyMatrix(order.length));
      }

      setSavedWeights(weights);
    } catch (err) {
      setError(err.message ?? 'Gagal memuat data AHP');
      setCriteria([]);
      setMatrix([]);
      setSavedWeights([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function saveAHP() {
    if (!ahpResult?.isConsistent) {
      throw new Error('CR > 0.1 — perbaiki matriks perbandingan sebelum menyimpan');
    }

    if (criteriaOrder.length === 0) {
      throw new Error('Tidak ada kriteria aktif');
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const comparisons = matrixToComparisons(criteriaOrder, matrix).map((c) => ({
        ...c,
        period,
      }));

      const { error: deleteCompError } = await supabase
        .from('ahp_comparisons')
        .delete()
        .eq('period', period);

      if (deleteCompError) throw deleteCompError;

      if (comparisons.length > 0) {
        const { error: insertCompError } = await supabase
          .from('ahp_comparisons')
          .insert(comparisons);

        if (insertCompError) throw insertCompError;
      }

      const { error: deleteWeightError } = await supabase
        .from('ahp_weights')
        .delete()
        .eq('period', period);

      if (deleteWeightError) throw deleteWeightError;

      const weightRows = criteriaOrder.map((criteriaId, index) => ({
        period,
        criteria_id: criteriaId,
        weight: ahpResult.weights[index],
        lambda_max: ahpResult.lambdaMax,
        ci: ahpResult.ci,
        cr: ahpResult.cr,
        is_consistent: ahpResult.isConsistent,
      }));

      const { data: insertedWeights, error: insertWeightError } = await supabase
        .from('ahp_weights')
        .insert(weightRows)
        .select();

      if (insertWeightError) throw insertWeightError;

      setSavedWeights(insertedWeights ?? []);
      setSaveSuccess(true);
    } catch (err) {
      setError(err.message ?? 'Gagal menyimpan bobot AHP');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    period,
    setPeriod,
    criteria,
    criteriaOrder,
    matrix,
    setMatrix,
    ahpResult,
    savedWeights,
    loading,
    saving,
    error,
    saveSuccess,
    loadData,
    saveAHP,
    hasSavedWeights: savedWeights.length > 0,
  };
}
