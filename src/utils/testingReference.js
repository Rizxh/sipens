/**
 * Implementasi REFERENSI (independen) dari rumus AHP & WP, dipakai khusus di halaman
 * Pengujian (/pengujian) untuk memverifikasi hasil perhitungan sistem (src/utils/ahp.js
 * dan src/utils/wp.js) secara black-box.
 *
 * Kode di file ini SENGAJA ditulis ulang secara terpisah (bukan memanggil ahp.js/wp.js)
 * agar perbandingan "Hasil Manual" vs "Hasil Sistem" pada tabel pengujian benar-benar
 * independen, bukan sekadar membandingkan fungsi yang sama dengan dirinya sendiri.
 */

/** Jumlahkan tiap kolom matriks n×n. */
export function refColumnSums(matrix) {
  const n = matrix.length;
  const sums = new Array(n).fill(0);
  for (let col = 0; col < n; col++) {
    let total = 0;
    for (let row = 0; row < n; row++) {
      total += matrix[row][col];
    }
    sums[col] = total;
  }
  return sums;
}

/** Normalisasi matriks: tiap sel dibagi jumlah kolomnya. */
export function refNormalizeMatrix(matrix) {
  const sums = refColumnSums(matrix);
  return matrix.map((row) => row.map((val, col) => val / sums[col]));
}

/** Bobot prioritas = rata-rata tiap baris matriks ternormalisasi. */
export function refPriorityWeights(normalizedMatrix) {
  return normalizedMatrix.map((row) => {
    const total = row.reduce((sum, v) => sum + v, 0);
    return total / row.length;
  });
}

/** λ max: rata-rata dari (Σ kolom matriks asli × bobot) / bobot baris. */
export function refLambdaMax(matrix, weights) {
  const n = matrix.length;
  const ratios = [];
  for (let row = 0; row < n; row++) {
    let weightedSum = 0;
    for (let col = 0; col < n; col++) {
      weightedSum += matrix[row][col] * weights[col];
    }
    ratios.push(weightedSum / weights[row]);
  }
  return ratios.reduce((sum, r) => sum + r, 0) / n;
}

export function refCI(lambdaMax, n) {
  return (lambdaMax - n) / (n - 1);
}

export function refCR(ci, randomIndex) {
  if (randomIndex === 0) return 0;
  return ci / randomIndex;
}

/** Nilai S (WP): perkalian nilai kriteria dipangkatkan bobot (cost = pangkat negatif). */
export function refSValue(scores, weights, types) {
  let s = 1;
  for (let i = 0; i < scores.length; i++) {
    const exponent = types[i] === 'cost' ? -weights[i] : weights[i];
    s = s * Math.pow(scores[i], exponent);
  }
  return s;
}

/** Nilai V: proporsi tiap S terhadap total seluruh S. */
export function refVValues(sValues) {
  let total = 0;
  for (const s of sValues) total += s;
  return sValues.map((s) => s / total);
}

/** Rata-rata & standar deviasi populasi dari sekumpulan angka. */
export function refMeanStdDev(values) {
  let sum = 0;
  for (const v of values) sum += v;
  const mean = sum / values.length;

  let sqDiffSum = 0;
  for (const v of values) sqDiffSum += (v - mean) * (v - mean);
  const stdDev = Math.sqrt(sqDiffSum / values.length);

  return { mean, stdDev };
}

/** Klasifikasi catatan performa berdasarkan posisi nilai V terhadap rata-rata ± std. deviasi. */
export function refClassify(value, values) {
  const { mean, stdDev } = refMeanStdDev(values);
  if (value < mean) return 'Kurang Baik';
  if (stdDev > 0 && value >= mean + stdDev) return 'Sangat Baik';
  return 'Baik';
}
