/**
 * AHP (Analytic Hierarchy Process) — utilitas perhitungan bobot kriteria.
 * Metode: normalisasi kolom + eigen vector (rata-rata baris matriks ternormalisasi).
 */

/** Skala Saaty yang diizinkan untuk perbandingan berpasangan */
export const SAATY_SCALE = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Batas Consistency Ratio — CR harus <= 0.1 agar dianggap konsisten */
export const CR_THRESHOLD = 0.1;

/** Random Index (RI) Saaty untuk n = 1..15 */
export const RANDOM_INDEX = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
  11: 1.51,
  12: 1.48,
  13: 1.56,
  14: 1.57,
  15: 1.59,
};

/**
 * Buat matriks perbandingan n×n identitas (diagonal = 1).
 * @param {number} n - Jumlah kriteria
 * @returns {number[][]}
 */
export function createEmptyMatrix(n) {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error('Jumlah kriteria harus bilangan bulat positif');
  }

  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 1))
  );
}

/**
 * Validasi nilai skala Saaty (1–9 atau kebalikannya 1/2..1/9).
 * @param {number} value
 * @returns {boolean}
 */
export function isValidSaatyValue(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return false;
  }

  if (SAATY_SCALE.includes(value)) return true;

  const reciprocal = 1 / value;
  return SAATY_SCALE.includes(Math.round(reciprocal * 1000) / 1000) ||
    SAATY_SCALE.some((s) => Math.abs(1 / s - value) < 1e-9);
}

/**
 * Perbarui sel matriks perbandingan beserta nilai reciprokalnya.
 * @param {number[][]} matrix
 * @param {number} rowIndex
 * @param {number} colIndex
 * @param {number} value - Skala Saaty (1–9)
 * @returns {number[][]} Matriks baru (immutable)
 */
export function setPairwiseValue(matrix, rowIndex, colIndex, value) {
  if (rowIndex === colIndex) {
    throw new Error('Nilai diagonal matriks harus tetap 1');
  }

  if (!isValidSaatyValue(value)) {
    throw new Error('Nilai perbandingan harus pada skala Saaty 1–9');
  }

  const n = matrix.length;
  if (rowIndex < 0 || rowIndex >= n || colIndex < 0 || colIndex >= n) {
    throw new Error('Indeks matriks di luar batas');
  }

  const newMatrix = matrix.map((row) => [...row]);
  newMatrix[rowIndex][colIndex] = value;
  newMatrix[colIndex][rowIndex] = 1 / value;

  return newMatrix;
}

/**
 * Bangun matriks perbandingan dari daftar perbandingan berpasangan.
 * @param {string[]} criteriaOrder - ID kriteria urut baris/kolom
 * @param {{ criteria_a_id: string, criteria_b_id: string, value: number }[]} comparisons
 * @returns {number[][]}
 */
export function buildMatrixFromComparisons(criteriaOrder, comparisons) {
  const n = criteriaOrder.length;
  const idToIndex = Object.fromEntries(
    criteriaOrder.map((id, index) => [id, index])
  );

  const matrix = createEmptyMatrix(n);

  for (const comp of comparisons) {
    const i = idToIndex[comp.criteria_a_id];
    const j = idToIndex[comp.criteria_b_id];

    if (i === undefined || j === undefined) continue;
    if (i === j) continue;

    matrix[i][j] = comp.value;
    matrix[j][i] = 1 / comp.value;
  }

  return matrix;
}

/**
 * Normalisasi matriks per kolom.
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
export function normalizeMatrix(matrix) {
  const n = matrix.length;
  const columnSums = Array(n).fill(0);

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      columnSums[j] += matrix[i][j];
    }
  }

  return matrix.map((row) =>
    row.map((value, j) => (columnSums[j] === 0 ? 0 : value / columnSums[j]))
  );
}

/**
 * Hitung bobot prioritas (eigen vector) = rata-rata setiap baris matriks ternormalisasi.
 * @param {number[][]} normalizedMatrix
 * @returns {number[]}
 */
export function calculatePriorityWeights(normalizedMatrix) {
  const n = normalizedMatrix.length;

  return normalizedMatrix.map((row) => {
    const rowSum = row.reduce((acc, val) => acc + val, 0);
    return rowSum / n;
  });
}

/**
 * Hitung λ_max (lambda maximum).
 * λ_i = (Σ_j a_ij × w_j) / w_i  →  λ_max = rata-rata λ_i
 * @param {number[][]} matrix - Matriks perbandingan asli
 * @param {number[]} weights - Bobot prioritas
 * @returns {number}
 */
export function calculateLambdaMax(matrix, weights) {
  const n = matrix.length;
  let lambdaMaxSum = 0;

  for (let i = 0; i < n; i++) {
    let weightedRowSum = 0;

    for (let j = 0; j < n; j++) {
      weightedRowSum += matrix[i][j] * weights[j];
    }

    if (weights[i] !== 0) {
      lambdaMaxSum += weightedRowSum / weights[i];
    }
  }

  return lambdaMaxSum / n;
}

/**
 * Consistency Index: CI = (λ_max - n) / (n - 1)
 * @param {number} lambdaMax
 * @param {number} n
 * @returns {number}
 */
export function calculateCI(lambdaMax, n) {
  if (n <= 1) return 0;
  return (lambdaMax - n) / (n - 1);
}

/**
 * Consistency Ratio: CR = CI / RI
 * @param {number} ci
 * @param {number} n
 * @returns {number}
 */
export function calculateCR(ci, n) {
  const ri = RANDOM_INDEX[n] ?? RANDOM_INDEX[15];
  if (ri === 0) return 0;
  return ci / ri;
}

/**
 * Jalankan seluruh perhitungan AHP dari matriks perbandingan.
 * @param {number[][]} matrix - Matriks perbandingan berpasangan n×n
 * @returns {{
 *   matrix: number[][],
 *   normalizedMatrix: number[][],
 *   weights: number[],
 *   lambdaMax: number,
 *   ci: number,
 *   cr: number,
 *   randomIndex: number,
 *   isConsistent: boolean,
 *   consistencyMessage: string
 * }}
 */
export function computeAHP(matrix) {
  if (!matrix?.length || matrix.length !== matrix[0]?.length) {
    throw new Error('Matriks perbandingan harus berbentuk persegi (n×n)');
  }

  const n = matrix.length;

  const normalizedMatrix = normalizeMatrix(matrix);
  const weights = calculatePriorityWeights(normalizedMatrix);
  const lambdaMax = calculateLambdaMax(matrix, weights);
  const ci = calculateCI(lambdaMax, n);
  const cr = calculateCR(ci, n);
  const randomIndex = RANDOM_INDEX[n] ?? RANDOM_INDEX[15];
  const isConsistent = cr <= CR_THRESHOLD;

  const consistencyMessage = isConsistent
    ? 'Penilaian konsisten (CR ≤ 0.1)'
    : 'Penilaian tidak konsisten, harap ulangi perbandingan (CR > 0.1)';

  return {
    matrix,
    normalizedMatrix,
    weights,
    lambdaMax,
    ci,
    cr,
    randomIndex,
    isConsistent,
    consistencyMessage,
  };
}

/**
 * Jalankan AHP dari perbandingan berpasangan + urutan kriteria.
 * @param {string[]} criteriaOrder
 * @param {{ criteria_a_id: string, criteria_b_id: string, value: number }[]} comparisons
 * @returns {ReturnType<typeof computeAHP> & { criteriaOrder: string[] }}
 */
export function computeAHPFromComparisons(criteriaOrder, comparisons) {
  const matrix = buildMatrixFromComparisons(criteriaOrder, comparisons);
  const result = computeAHP(matrix);

  return {
    ...result,
    criteriaOrder,
  };
}

/**
 * Map bobot AHP ke objek { criteriaId: weight }.
 * @param {string[]} criteriaOrder
 * @param {number[]} weights
 * @returns {Record<string, number>}
 */
export function mapWeightsToCriteria(criteriaOrder, weights) {
  return Object.fromEntries(
    criteriaOrder.map((id, index) => [id, weights[index] ?? 0])
  );
}

/**
 * Format bobot sebagai persentase (0–100).
 * @param {number} weight
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatWeightPercent(weight, decimals = 2) {
  return `${(weight * 100).toFixed(decimals)}%`;
}
