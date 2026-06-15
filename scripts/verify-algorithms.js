/**
 * Skrip verifikasi algoritma AHP & WP (jalankan: node scripts/verify-algorithms.js)
 */
import { computeAHP, setPairwiseValue, createEmptyMatrix } from '../src/utils/ahp.js';
import { computeWP } from '../src/utils/wp.js';

console.log('=== Verifikasi AHP ===\n');

// Contoh 3 kriteria: A vs B=3, A vs C=5, B vs C=2
let matrix = createEmptyMatrix(3);
matrix = setPairwiseValue(matrix, 0, 1, 3);
matrix = setPairwiseValue(matrix, 0, 2, 5);
matrix = setPairwiseValue(matrix, 1, 2, 2);

const ahp = computeAHP(matrix);

console.log('Matriks perbandingan:');
matrix.forEach((row, i) => console.log(`  [${row.map((v) => v.toFixed(3)).join(', ')}]`));

console.log('\nBobot prioritas:', ahp.weights.map((w) => w.toFixed(4)));
console.log('λ_max:', ahp.lambdaMax.toFixed(4));
console.log('CI:', ahp.ci.toFixed(4));
console.log('CR:', ahp.cr.toFixed(4));
console.log('Konsisten:', ahp.isConsistent ? 'YA ✓' : 'TIDAK ✗');
console.log('Pesan:', ahp.consistencyMessage);

console.log('\n=== Verifikasi WP ===\n');

const criteria = [
  { id: 'c1', name: 'Target Omset', type: 'benefit' },
  { id: 'c2', name: 'Profitabilitas', type: 'benefit' },
  { id: 'c3', name: 'Efektivitas Biaya', type: 'cost' },
];

const alternatives = [
  { id: 's1', name: 'Budi', employeeId: 'EMP001', scores: [90, 85, 12] },
  { id: 's2', name: 'Siti', employeeId: 'EMP002', scores: [95, 78, 15] },
  { id: 's3', name: 'Andi', employeeId: 'EMP003', scores: [80, 92, 10] },
];

const wp = computeWP(alternatives, criteria, ahp.weights);

console.log('Bobot ternormalisasi:', wp.normalizedWeights.map((w) => w.toFixed(4)));
console.log('\nHasil ranking:');
wp.results.forEach((r) => {
  const badge = r.isBest ? ' ★ SALES TERBAIK' : '';
  console.log(
    `  #${r.rank} ${r.name} — S: ${r.sValue.toFixed(6)}, V: ${(r.vValue * 100).toFixed(2)}%${badge}`
  );
});

console.log('\n✓ Verifikasi selesai');
