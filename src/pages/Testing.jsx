import { useMemo } from 'react';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

import {
  normalizeMatrix,
  calculatePriorityWeights,
  computeAHP,
  RANDOM_INDEX,
} from '../utils/ahp';
import {
  calculateSValue,
  calculateVValues,
  assignRanks,
  classifyPerformance,
  calculateVStats,
  PERFORMANCE_META,
} from '../utils/wp';
import {
  refNormalizeMatrix,
  refPriorityWeights,
  refLambdaMax,
  refCI,
  refCR,
  refSValue,
  refVValues,
  refClassify,
} from '../utils/testingReference';

const EPS = 1e-6;

function close(a, b, eps = EPS) {
  return Math.abs(a - b) < eps;
}

function arraysClose(a, b, eps = EPS) {
  return a.length === b.length && a.every((v, i) => close(v, b[i], eps));
}

function fmtNum(n, decimals = 4) {
  return Number(n).toFixed(decimals);
}

function fmtMatrix(matrix, decimals = 4) {
  return matrix.map((row) => row.map((v) => fmtNum(v, decimals)).join('  ')).join('\n');
}

// ---------------------------------------------------------------------------
// Data uji tetap (fixed) — 3 kriteria & 3 sales, dipakai konsisten di semua test case
// agar hasil tiap langkah dapat dirunut dari langkah sebelumnya.
// ---------------------------------------------------------------------------
const CRITERIA = [
  { name: 'Target Omset', type: 'benefit' },
  { name: 'Pelanggan Baru', type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost' },
];

// Matriks perbandingan berpasangan (skala Saaty): C1 vs C2 = 2, C1 vs C3 = 4, C2 vs C3 = 3
const COMPARISON_MATRIX = [
  [1, 2, 4],
  [1 / 2, 1, 3],
  [1 / 4, 1 / 3, 1],
];

const SALES = [
  { name: 'Budi Santoso', scores: [8, 7, 3] },
  { name: 'Siti Rahayu', scores: [6, 9, 5] },
  { name: 'Andi Wijaya', scores: [9, 4, 2] },
];

const CRITERIA_TYPES = CRITERIA.map((c) => c.type);

function useTestCases() {
  return useMemo(() => {
    const n = COMPARISON_MATRIX.length;
    const cases = [];

    // TC1 — Normalisasi matriks perbandingan
    const expNormMatrix = refNormalizeMatrix(COMPARISON_MATRIX);
    const actNormMatrix = normalizeMatrix(COMPARISON_MATRIX);
    cases.push({
      title: 'Normalisasi Matriks Perbandingan',
      logic: "a'ᵢⱼ = aᵢⱼ ÷ Σᵢ aᵢⱼ (tiap sel dibagi jumlah kolomnya)",
      input: `Matriks perbandingan 3×3 kriteria (skala Saaty):\n${fmtMatrix(COMPARISON_MATRIX, 3)}`,
      expected: fmtMatrix(expNormMatrix),
      actual: fmtMatrix(actNormMatrix),
      valid: expNormMatrix.every((row, i) => arraysClose(row, actNormMatrix[i])),
    });

    // TC2 — Bobot prioritas (eigen vector approksimasi)
    const expWeights = refPriorityWeights(expNormMatrix);
    const actWeights = calculatePriorityWeights(actNormMatrix);
    cases.push({
      title: 'Bobot Prioritas Kriteria',
      logic: 'wᵢ = (Σⱼ a′ᵢⱼ) ÷ n — rata-rata tiap baris matriks ternormalisasi',
      input: 'Matriks ternormalisasi dari TC-1',
      expected: `${CRITERIA.map((c, i) => `${c.name}: ${fmtNum(expWeights[i] * 100, 2)}%`).join('\n')}`,
      actual: `${CRITERIA.map((c, i) => `${c.name}: ${fmtNum(actWeights[i] * 100, 2)}%`).join('\n')}`,
      valid: arraysClose(expWeights, actWeights),
    });

    // TC3 — Uji konsistensi: λmax, CI, CR
    const expLambda = refLambdaMax(COMPARISON_MATRIX, expWeights);
    const expCi = refCI(expLambda, n);
    const ri = RANDOM_INDEX[n];
    const expCr = refCR(expCi, ri);
    const expConsistent = expCr <= 0.1;

    const actAhp = computeAHP(COMPARISON_MATRIX);
    cases.push({
      title: 'Uji Konsistensi AHP (λmax, CI, CR)',
      logic: 'λmax = rata-rata[(Σⱼaᵢⱼwⱼ)/wᵢ] ; CI=(λmax−n)/(n−1) ; CR=CI/RI(n=3 → RI=0.58)',
      input: 'Matriks asli (TC-1) + bobot prioritas (TC-2)',
      expected: `λmax=${fmtNum(expLambda)}  CI=${fmtNum(expCi)}  CR=${fmtNum(expCr)}  → ${expConsistent ? 'Konsisten' : 'Tidak konsisten'}`,
      actual: `λmax=${fmtNum(actAhp.lambdaMax)}  CI=${fmtNum(actAhp.ci)}  CR=${fmtNum(actAhp.cr)}  → ${actAhp.isConsistent ? 'Konsisten' : 'Tidak konsisten'}`,
      valid:
        close(expLambda, actAhp.lambdaMax) &&
        close(expCi, actAhp.ci) &&
        close(expCr, actAhp.cr) &&
        expConsistent === actAhp.isConsistent,
    });

    // Gunakan bobot AHP hasil sistem (actAhp.weights) sebagai input tahap WP berikutnya
    const weights = actAhp.weights;

    // TC4 — Nilai S (WP) untuk tiap sales, kriteria benefit & cost bercampur
    const expSValues = SALES.map((s) => refSValue(s.scores, weights, CRITERIA_TYPES));
    const actSValues = SALES.map((s) => calculateSValue(s.scores, weights, CRITERIA_TYPES));
    cases.push({
      title: 'Perhitungan Nilai S (WP)',
      logic: 'Sᵢ = ∏ⱼ (xᵢⱼ ^ wⱼ) untuk benefit ; ∏ⱼ (xᵢⱼ ^ −wⱼ) untuk cost',
      input: SALES.map((s) => `${s.name}: [${s.scores.join(', ')}] (Omset, Plgn Baru, Biaya)`).join('\n'),
      expected: SALES.map((s, i) => `${s.name}: ${fmtNum(expSValues[i], 6)}`).join('\n'),
      actual: SALES.map((s, i) => `${s.name}: ${fmtNum(actSValues[i], 6)}`).join('\n'),
      valid: arraysClose(expSValues, actSValues, 1e-9),
    });

    // TC5 — Nilai V (normalisasi S, total harus = 100%)
    const expVValues = refVValues(expSValues);
    const actVValues = calculateVValues(actSValues);
    const expVSum = expVValues.reduce((a, b) => a + b, 0);
    const actVSum = actVValues.reduce((a, b) => a + b, 0);
    cases.push({
      title: 'Perhitungan Nilai V (Normalisasi S)',
      logic: 'Vᵢ = Sᵢ ÷ ΣS  →  ΣV harus = 100%',
      input: 'Nilai S dari TC-4',
      expected: `${SALES.map((s, i) => `${s.name}: ${fmtNum(expVValues[i] * 100, 2)}%`).join('\n')}\nΣV = ${fmtNum(expVSum * 100, 2)}%`,
      actual: `${SALES.map((s, i) => `${s.name}: ${fmtNum(actVValues[i] * 100, 2)}%`).join('\n')}\nΣV = ${fmtNum(actVSum * 100, 2)}%`,
      valid: arraysClose(expVValues, actVValues, 1e-9) && close(expVSum, 1, 1e-9) && close(actVSum, 1, 1e-9),
    });

    // TC6 — Perankingan: urutkan V terbesar → terkecil
    const expRanked = SALES
      .map((s, i) => ({ name: s.name, vValue: expVValues[i] }))
      .sort((a, b) => b.vValue - a.vValue)
      .map((r, idx) => ({ ...r, rank: idx + 1 }));
    const actRanked = assignRanks(
      SALES.map((s, i) => ({ id: s.name, name: s.name, vValue: actVValues[i] }))
    );
    cases.push({
      title: 'Perankingan Alternatif',
      logic: 'Urutkan V terbesar → terkecil; rank #1 = sales terbaik periode ini',
      input: 'Nilai V dari TC-5',
      expected: expRanked.map((r) => `#${r.rank} ${r.name} (${fmtNum(r.vValue * 100, 2)}%)`).join('\n'),
      actual: actRanked.map((r) => `#${r.rank} ${r.name} (${fmtNum(r.vValue * 100, 2)}%)`).join('\n'),
      valid: expRanked.every((r, i) => r.name === actRanked[i].id && r.rank === actRanked[i].rank),
    });

    // TC7 — Klasifikasi catatan performa (Kurang Baik / Baik / Sangat Baik)
    const expNotes = expVValues.map((v) => refClassify(v, expVValues));
    const vStats = calculateVStats(actVValues);
    const actNotes = actVValues.map((v) => PERFORMANCE_META[classifyPerformance(v, vStats)].label);
    cases.push({
      title: 'Klasifikasi Catatan Performa',
      logic: 'V < rata² → Kurang Baik ; rata² ≤ V < rata²+σ → Baik ; V ≥ rata²+σ → Sangat Baik',
      input: 'Nilai V seluruh sales dari TC-5 (rata-rata & std. deviasi dihitung dari kumpulan ini)',
      expected: SALES.map((s, i) => `${s.name}: ${expNotes[i]}`).join('\n'),
      actual: SALES.map((s, i) => `${s.name}: ${actNotes[i]}`).join('\n'),
      valid: expNotes.every((n, i) => n === actNotes[i]),
    });

    return cases.map((c, i) => ({ no: i + 1, ...c }));
  }, []);
}

export default function Testing() {
  const testCases = useTestCases();
  const passed = testCases.filter((t) => t.valid).length;
  const allValid = passed === testCases.length;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Pengujian Sistem"
        description="Verifikasi rumus perhitungan AHP & WP terhadap hasil yang dikeluarkan sistem (black-box testing)"
      />

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Icon name="info" className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 leading-relaxed">
            <p className="font-semibold text-blue-900 mb-1">Metodologi Pengujian</p>
            <p>
              Setiap baris membandingkan <strong>Hasil Manual</strong> (dihitung ulang secara
              independen dari rumus AHP/WP menggunakan data uji tetap) dengan{' '}
              <strong>Hasil Sistem</strong> (dihitung langsung oleh modul{' '}
              <code className="bg-blue-100 px-1 rounded">utils/ahp.js</code> dan{' '}
              <code className="bg-blue-100 px-1 rounded">utils/wp.js</code> yang dipakai aplikasi).
              Status <Badge variant="benefit">Valid</Badge> berarti selisih kedua hasil berada di
              bawah toleransi {EPS}. Data uji: 3 kriteria (Target Omset, Pelanggan Baru — benefit;
              Efektivitas Biaya — cost) dan 3 sales contoh.
            </p>
          </div>
        </div>
      </Card>

      <Alert variant={allValid ? 'success' : 'error'}>
        <p className="font-semibold">
          {passed} dari {testCases.length} test case <strong>Valid</strong>
          {allValid ? ' — seluruh perhitungan sistem sesuai rumus.' : ' — ada ketidaksesuaian, periksa detail di bawah.'}
        </p>
      </Alert>

      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left align-bottom">
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-10">No</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-48">Test Case</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-64">Logic Perhitungan</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-56">Data Input</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-56">Hasil Manual (Diharapkan)</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-56">Hasil Sistem</th>
                <th className="px-3 sm:px-4 py-3 font-semibold text-slate-700 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc) => (
                <tr key={tc.no} className="border-b border-slate-100 align-top hover:bg-slate-50/80">
                  <td className="px-3 sm:px-4 py-3 font-semibold text-slate-500">{tc.no}</td>
                  <td className="px-3 sm:px-4 py-3 font-medium text-slate-900">{tc.title}</td>
                  <td className="px-3 sm:px-4 py-3 text-slate-600 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {tc.logic}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-slate-600 text-xs whitespace-pre-wrap">
                    {tc.input}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-slate-700 font-mono text-xs whitespace-pre-wrap">
                    {tc.expected}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-slate-700 font-mono text-xs whitespace-pre-wrap">
                    {tc.actual}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <Badge variant={tc.valid ? 'benefit' : 'cost'}>
                      {tc.valid ? 'Valid' : 'Tidak Valid'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
