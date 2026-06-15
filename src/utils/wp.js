/**
 * WP (Weighted Product) — utilitas perankingan alternatif (sales).
 * Rumus:
 *   S_i = Π (x_ij ^ w_j)  untuk benefit
 *       = Π (x_ij ^ (-w_j)) untuk cost  (bobot negatif / eksponen negatif)
 *   V_i = S_i / Σ S_k
 */

/**
 * Normalisasi bobot agar total = 1.
 * @param {number[]} weights
 * @returns {number[]}
 */
export function normalizeWeights(weights) {
  if (!weights?.length) {
    throw new Error('Bobot kriteria tidak boleh kosong');
  }

  const sum = weights.reduce((acc, w) => acc + w, 0);

  if (sum === 0) {
    throw new Error('Total bobot kriteria tidak boleh nol');
  }

  return weights.map((w) => w / sum);
}

/**
 * Hitung nilai S (skor WP) untuk satu alternatif.
 * @param {number[]} scores - Nilai aktual per kriteria (urutan sama dengan criteria)
 * @param {number[]} normalizedWeights - Bobot ternormalisasi
 * @param {('benefit'|'cost')[]} criteriaTypes - Tipe tiap kriteria
 * @returns {number}
 */
export function calculateSValue(scores, normalizedWeights, criteriaTypes) {
  if (scores.length !== normalizedWeights.length ||
      scores.length !== criteriaTypes.length) {
    throw new Error('Panjang scores, bobot, dan tipe kriteria harus sama');
  }

  let s = 1;

  for (let j = 0; j < scores.length; j++) {
    const value = scores[j];
    const weight = normalizedWeights[j];
    const type = criteriaTypes[j];

    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error(
        `Nilai kriteria ke-${j + 1} harus bilangan positif (diperlukan untuk WP)`
      );
    }

    if (type === 'benefit') {
      s *= Math.pow(value, weight);
    } else if (type === 'cost') {
      s *= Math.pow(value, -weight);
    } else {
      throw new Error(`Tipe kriteria tidak valid: "${type}". Gunakan "benefit" atau "cost"`);
    }
  }

  return s;
}

/**
 * Hitung nilai V (normalisasi S) dari array S.
 * @param {number[]} sValues
 * @returns {number[]}
 */
export function calculateVValues(sValues) {
  const totalS = sValues.reduce((acc, s) => acc + s, 0);

  if (totalS === 0) {
    return sValues.map(() => 0);
  }

  return sValues.map((s) => s / totalS);
}

/**
 * Beri ranking berdasarkan nilai V (terbesar = rank 1).
 * @param {{ id: string|number, vValue: number }[]} items
 * @returns {({ id: string|number, vValue: number, rank: number })[]}
 */
export function assignRanks(items) {
  const sorted = [...items].sort((a, b) => b.vValue - a.vValue);

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Jalankan perhitungan WP lengkap untuk semua alternatif (sales).
 *
 * @param {{
 *   id: string|number,
 *   name?: string,
 *   employeeId?: string,
 *   scores: number[]
 * }[]} alternatives - Daftar sales dengan nilai per kriteria
 * @param {{
 *   id: string|number,
 *   name?: string,
 *   type: 'benefit'|'cost'
 * }[]} criteria - Daftar kriteria (urutan = kolom scores)
 * @param {number[]} weights - Bobot dari AHP (belum dinormalisasi juga OK)
 * @returns {{
 *   normalizedWeights: number[],
 *   results: {
 *     id: string|number,
 *     name?: string,
 *     employeeId?: string,
 *     scores: number[],
 *     sValue: number,
 *     vValue: number,
 *     rank: number,
 *     isBest: boolean
 *   }[],
 *   bestSales: object|null,
 *   totalS: number
 * }}
 */
export function computeWP(alternatives, criteria, weights) {
  if (!alternatives?.length) {
    throw new Error('Data alternatif (sales) tidak boleh kosong');
  }

  if (!criteria?.length) {
    throw new Error('Data kriteria tidak boleh kosong');
  }

  if (!weights?.length || weights.length !== criteria.length) {
    throw new Error('Jumlah bobot harus sama dengan jumlah kriteria');
  }

  const normalizedWeights = normalizeWeights(weights);
  const criteriaTypes = criteria.map((c) => c.type);

  const withS = alternatives.map((alt) => {
    if (alt.scores.length !== criteria.length) {
      throw new Error(
        `Sales "${alt.name ?? alt.id}": jumlah nilai harus sama dengan jumlah kriteria`
      );
    }

    const sValue = calculateSValue(alt.scores, normalizedWeights, criteriaTypes);

    return {
      id: alt.id,
      name: alt.name,
      employeeId: alt.employeeId,
      scores: alt.scores,
      sValue,
    };
  });

  const sValues = withS.map((item) => item.sValue);
  const vValues = calculateVValues(sValues);
  const totalS = sValues.reduce((acc, s) => acc + s, 0);

  const withV = withS.map((item, index) => ({
    ...item,
    vValue: vValues[index],
  }));

  const ranked = assignRanks(withV);
  const bestSales = ranked.find((r) => r.rank === 1) ?? null;

  const results = ranked.map((item) => ({
    ...item,
    isBest: item.rank === 1,
  }));

  return {
    normalizedWeights,
    results,
    bestSales,
    totalS,
  };
}

/**
 * Bangun input WP dari data database (sales + sales_scores + criteria + ahp_weights).
 * @param {object[]} sales - { id, name, employee_id }
 * @param {object[]} criteria - { id, name, type } — urutan konsisten
 * @param {object[]} salesScores - { sales_id, criteria_id, value }
 * @param {object[]} ahpWeights - { criteria_id, weight }
 * @returns {ReturnType<typeof computeWP>}
 */
export function computeWPFromRecords(sales, criteria, salesScores, ahpWeights) {
  const weightMap = Object.fromEntries(
    ahpWeights.map((w) => [w.criteria_id, w.weight])
  );

  const weights = criteria.map((c) => weightMap[c.id] ?? 0);

  const scoreMap = {};
  for (const score of salesScores) {
    if (!scoreMap[score.sales_id]) scoreMap[score.sales_id] = {};
    scoreMap[score.sales_id][score.criteria_id] = score.value;
  }

  const alternatives = sales.map((s) => ({
    id: s.id,
    name: s.name,
    employeeId: s.employee_id,
    scores: criteria.map((c) => scoreMap[s.id]?.[c.id] ?? 0),
  }));

  return computeWP(alternatives, criteria, weights);
}

/**
 * Format nilai V sebagai persentase.
 * @param {number} vValue
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatVPercent(vValue, decimals = 2) {
  return `${(vValue * 100).toFixed(decimals)}%`;
}
