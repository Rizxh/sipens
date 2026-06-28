/**
 * Generate seed-10-sales.sql — 10 sales, Jan–Jun 2025, 3 kriteria, juara berbeda tiap bulan
 * Jalankan: node scripts/generate-seed-10-sales.js
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { computeWP } from '../src/utils/wp.js';

const PERIODS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];

const SALES = [
  { name: 'Budi Santoso',   employeeId: 'EMP001' },
  { name: 'Siti Rahayu',    employeeId: 'EMP002' },
  { name: 'Andi Wijaya',    employeeId: 'EMP003' },
  { name: 'Dewi Kusuma',    employeeId: 'EMP004' },
  { name: 'Rudi Hartono',   employeeId: 'EMP005' },
  { name: 'Maya Putri',     employeeId: 'EMP006' },
  { name: 'Agus Setiawan',  employeeId: 'EMP007' },
  { name: 'Rina Wati',      employeeId: 'EMP008' },
  { name: 'Hendra Gunawan', employeeId: 'EMP009' },
  { name: 'Lina Sari',      employeeId: 'EMP010' },
];

// 3 kriteria saja: Target Omset, Pelanggan Baru, Efektivitas Biaya
const CRITERIA = [
  { name: 'Target Omset',      type: 'benefit' },
  { name: 'Pelanggan Baru',    type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost'    },
];

// Bobot AHP 3 kriteria (TO=0.633, PB=0.261, EB=0.106) — CR≈0.035
const WEIGHTS = [0.633, 0.261, 0.106];

// Juara tiap bulan (0-based index): Jan=EMP001, Feb=EMP002, Mar=EMP008, Apr=EMP005, Mei=EMP003, Jun=EMP006
const MONTH_CHAMPIONS = [0, 1, 7, 4, 2, 5];

// Scores base per sales [Target Omset, Pelanggan Baru, Efektivitas Biaya]
const BASE_SCORES = [
  [82, 78, 13], // EMP001 Budi
  [79, 85, 14], // EMP002 Siti
  [85, 74, 12], // EMP003 Andi
  [81, 71, 15], // EMP004 Dewi
  [76, 88, 12], // EMP005 Rudi
  [83, 76, 13], // EMP006 Maya
  [78, 80, 12], // EMP007 Agus
  [80, 73, 14], // EMP008 Rina
  [74, 83, 11], // EMP009 Hendra
  [82, 79, 13], // EMP010 Lina
];

// Delta per bulan per sales [TO, PB, EB]
const MONTHLY_DELTAS = [
  // Jan  Feb  Mar  Apr  Mei  Jun
  [ [+14,+7,-4],  [+1,+2,+0],  [-3,-1,-1], [-4,-2,+1], [+6,+7,-2],  [-2,-1,+1]  ], // EMP001
  [ [-3,+10,+1],  [+16,+7,-4], [-3,-1,+1], [+5,+3,-1], [-1,+0,-1],  [-9,-9,+1]  ], // EMP002
  [ [+0,+2,+0],   [-10,-1,+1], [+3,+6,-1], [-15,-2,+1],[+11,+10,-3],[-1,+7,+1]  ], // EMP003
  [ [+7,-1,+1],   [-11,-3,+1], [-2,+1,-1], [-4,+3,-1], [-8,+3,+1],  [-4,+2,+2]  ], // EMP004
  [ [-8,+2,-1],   [+4,+0,-1],  [-8,-12,+2],[+19,+6,-3],[-9,-10,+2], [+6,-1,+0]  ], // EMP005
  [ [+2,+2,+2],   [-5,+0,+1],  [-1,+1,+0], [-9,-3,+1], [+1,+4,-1],  [+14,+9,-5] ], // EMP006
  [ [+2,+2,-1],   [+4,+5,+0],  [-8,+0,+0], [+8,+10,-1],[-4,-0,+1],  [+5,+5,-1]  ], // EMP007
  [ [+0,-1,+2],   [-8,-3,+1],  [+17,+12,-6],[-8,-3,-2],[+1,+5,-3],  [-8,-2,+1]  ], // EMP008
  [ [-4,+4,-2],   [+11,+8,-2], [-2,-4,+0], [+9,+8,-1], [-3,+4,+1],  [+0,-1,+1]  ], // EMP009
  [ [-1,-0,+0],   [-8,-2,+1],  [-2,+2,+1], [-2,+6,+1], [-3,+1,-1],  [+5,+7,-3]  ], // EMP010
];

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, Math.round(v)));
}

function getScores(salesIdx, periodIdx) {
  const base = BASE_SCORES[salesIdx];
  const delta = MONTHLY_DELTAS[salesIdx][periodIdx];
  const criteriaTypes = CRITERIA.map((c) => c.type);
  return base.map((b, ci) => {
    const raw = b + delta[ci];
    return criteriaTypes[ci] === 'cost' ? clamp(raw, 5, 25) : clamp(raw, 50, 100);
  });
}

// AHP comparisons untuk 3 kriteria: TO > PB > EB
// TO vs PB = 3, TO vs EB = 5, PB vs EB = 3
const AHP_PAIRS = [
  ['Target Omset',   'Pelanggan Baru',    3],
  ['Target Omset',   'Efektivitas Biaya', 5],
  ['Pelanggan Baru', 'Efektivitas Biaya', 3],
];

// Bobot AHP 3 kriteria (eigen vector dari matriks di atas, CR≈0.035)
const AHP_WEIGHTS = [
  ['Target Omset',      0.63300000],
  ['Pelanggan Baru',    0.26100000],
  ['Efektivitas Biaya', 0.10600000],
];

const lines = [];

lines.push(`-- =============================================================================`);
lines.push(`-- SIPENS — Seed 10 Sales, 3 Kriteria (Target Omset, Pelanggan Baru, Efektivitas Biaya)`);
lines.push(`-- Periode: Jan–Jun 2025 | Juara berbeda tiap bulan`);
lines.push(`-- Generate: node scripts/generate-seed-10-sales.js`);
lines.push(`-- =============================================================================`);
lines.push('');

// Hapus data lama
for (const p of PERIODS) {
  lines.push(`DELETE FROM public.wp_results      WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.sales_scores    WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_weights     WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_comparisons WHERE period = '${p}';`);
}
lines.push(`DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';`);
lines.push('');

// Reset kriteria: nonaktifkan semua, lalu aktifkan/insert 3 kriteria saja
lines.push(`-- Reset kriteria: nonaktifkan semua, aktifkan/insert 3 kriteria saja`);
lines.push(`UPDATE public.criteria SET is_active = FALSE;`);
lines.push('');
lines.push(`INSERT INTO public.criteria (name, type, description, is_active) VALUES`);
lines.push(`  ('Target Omset',      'benefit', 'Pencapaian target omset penjualan (semakin besar semakin baik)', TRUE),`);
lines.push(`  ('Pelanggan Baru',    'benefit', 'Jumlah pelanggan baru yang berhasil diperoleh (semakin besar semakin baik)', TRUE),`);
lines.push(`  ('Efektivitas Biaya', 'cost',    'Biaya operasional yang dikeluarkan (semakin kecil semakin baik)', TRUE)`);
lines.push(`ON CONFLICT (name) DO UPDATE SET is_active = TRUE, type = EXCLUDED.type, description = EXCLUDED.description;`);
lines.push('');

// Insert 10 sales
lines.push(`-- 10 Sales Karyawan`);
lines.push(`INSERT INTO public.sales (name, employee_id) VALUES`);
const salesRows = SALES.map((s) => `  ('${s.name}', '${s.employeeId}')`);
lines.push(salesRows.join(',\n') + ';');
lines.push('');

// AHP comparisons & weights per periode
for (const period of PERIODS) {
  lines.push(`-- AHP: ${period}`);
  lines.push(`INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)`);
  lines.push(`SELECT '${period}', a.id, b.id, v.val`);
  lines.push(`FROM (VALUES`);
  const pairRows = AHP_PAIRS.map(([a, b, v]) => `  ('${a}', '${b}', ${v})`);
  lines.push(pairRows.join(',\n'));
  lines.push(`) AS v(criteria_a, criteria_b, val)`);
  lines.push(`JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE`);
  lines.push(`JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;`);
  lines.push('');

  lines.push(`INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)`);
  lines.push(`SELECT '${period}', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE`);
  lines.push(`FROM (VALUES`);
  const wRows = AHP_WEIGHTS.map(([n, w]) => `  ('${n}', ${w.toFixed(8)})`);
  lines.push(wRows.join(',\n'));
  lines.push(`) AS w(name, weight)`);
  lines.push(`JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;`);
  lines.push('');
}

// Scores & WP results per periode
for (let pi = 0; pi < PERIODS.length; pi++) {
  const period = PERIODS[pi];
  const champIdx = MONTH_CHAMPIONS[pi];

  const scoredAlts = SALES.map((s, si) => {
    const scores = getScores(si, pi);
    return { id: s.employeeId, name: s.name, employeeId: s.employeeId, scores };
  });

  // Boost champion
  const champScores = scoredAlts[champIdx].scores.slice();
  champScores[0] = Math.min(100, champScores[0] + 12); // TO
  champScores[1] = Math.min(100, champScores[1] + 6);  // PB
  champScores[2] = Math.max(5, champScores[2] - 3);    // EB (cost, lower=better)
  scoredAlts[champIdx] = { ...scoredAlts[champIdx], scores: champScores };

  const wpRes = computeWP(scoredAlts, CRITERIA, WEIGHTS);

  // Sales scores
  lines.push(`-- Nilai Sales: ${period} (Juara: ${SALES[champIdx].name})`);
  lines.push(`INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)`);
  lines.push(`SELECT s.id, c.id, '${period}', v.score`);
  lines.push(`FROM (VALUES`);
  const scoreRows = [];
  for (const alt of scoredAlts) {
    for (let ci = 0; ci < CRITERIA.length; ci++) {
      scoreRows.push(`  ('${alt.employeeId}', '${CRITERIA[ci].name}', ${alt.scores[ci]})`);
    }
  }
  lines.push(scoreRows.join(',\n'));
  lines.push(`) AS v(employee_id, criteria_name, score)`);
  lines.push(`JOIN public.sales s ON s.employee_id = v.employee_id`);
  lines.push(`JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;`);
  lines.push('');

  // WP results
  lines.push(`INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)`);
  lines.push(`SELECT s.id, '${period}', r.s_val, r.v_val, r.rnk`);
  lines.push(`FROM (VALUES`);
  const wpRows = wpRes.results.map((r) =>
    `  ('${r.employeeId}', ${r.sValue.toFixed(8)}, ${r.vValue.toFixed(8)}, ${r.rank})`
  );
  lines.push(wpRows.join(',\n'));
  lines.push(`) AS r(employee_id, s_val, v_val, rnk)`);
  lines.push(`JOIN public.sales s ON s.employee_id = r.employee_id;`);
  lines.push('');
}

lines.push(`-- Selesai! Buka Riwayat → lihat 10 sales per bulan (Jan–Jun 2025), juara berbeda tiap bulan.`);
lines.push(`-- Jan=Budi, Feb=Siti, Mar=Rina, Apr=Rudi, Mei=Andi, Jun=Maya`);

const output = lines.join('\n');
const outPath = resolve(process.cwd(), 'seed-10-sales.sql');
writeFileSync(outPath, output, 'utf8');
console.log(`✅ Seed ditulis: ${outPath}`);
console.log(`   Kriteria: ${CRITERIA.map((c) => c.name).join(', ')}`);
console.log(`   Periode : ${PERIODS.join(', ')}`);
console.log(`   Sales   : ${SALES.length} karyawan`);
