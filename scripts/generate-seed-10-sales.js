/**
 * Generate seed-10-sales.sql — 10 sales, Jan–Jun 2025, ranking berbeda tiap bulan
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

const CRITERIA = [
  { name: 'Target Omset',      type: 'benefit' },
  { name: 'Profitabilitas',    type: 'benefit' },
  { name: 'Retensi Pelanggan', type: 'benefit' },
  { name: 'Pelanggan Baru',    type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost'    },
];

const WEIGHTS = [0.352, 0.248, 0.198, 0.122, 0.08];

// Juara tiap bulan (0-based index): Jan=0, Feb=1, Mar=7, Apr=4, Mei=2, Jun=5
const MONTH_CHAMPIONS = [0, 1, 7, 4, 2, 5];

// Scores tetap per sales (base profile)
// [Target Omset, Profitabilitas, Retensi Pelanggan, Pelanggan Baru, Efektivitas Biaya]
const BASE_SCORES = [
  [82, 80, 84, 78, 13], // EMP001 Budi
  [79, 83, 78, 85, 14], // EMP002 Siti
  [85, 88, 80, 74, 12], // EMP003 Andi
  [81, 79, 82, 71, 15], // EMP004 Dewi
  [76, 78, 79, 88, 12], // EMP005 Rudi
  [83, 82, 81, 76, 13], // EMP006 Maya
  [78, 77, 85, 80, 12], // EMP007 Agus
  [80, 84, 76, 73, 14], // EMP008 Rina
  [74, 76, 82, 83, 11], // EMP009 Hendra
  [82, 80, 83, 79, 13], // EMP010 Lina
];

// Delta tiap bulan per sales (agar data berbeda-beda)
// [TO, P, RP, PB, EB]
const MONTHLY_DELTAS = [
  // Jan Feb Mar Apr Mei Jun
  [ [+14,+14,+7, +7, -4], [+1,  +0, +5, +2, +0], [-3, -2, +3, -1, -1], [-4, -6, -3, -2, +1], [+6, +12,+9, +7, -2], [-2, -4, -2, -1, +1] ], // EMP001
  [ [-3, -5, +1, +10,+1],  [+16,+8, +10,+7, -4], [-3, -4, +0, -1, +1], [+5, +4, +5, +3, -1], [-1, -2, +1, +0, -1], [-9,-10, -4, -9, +1] ], // EMP002
  [ [+0, -3, +1, +2, +0],  [-10,-6, -2, -1, +1], [+3, +3, +2, +6, -1], [-15,-15,-4, -2, +1], [+11,+6, +0, +10,-3], [-1, -1, +3, +7, +1] ], // EMP003
  [ [+7, +11,+0, -1, +1],  [-11,-1, -10,-3,+1],  [-2, -3, -3, +1, -1], [-4, -0, -1, +3, -1], [-8, -3, -4, +3, +1], [-4, -0, -2, +2, +2] ], // EMP004
  [ [-8,-6, -5, +2, -1],   [+4, +6, +6, +0, -1], [-8, -8, -7, -12,+2], [+19,+14,+11,+6, -3], [-9,-8, -7, -10,+2], [+6, +6, +7, -1, +0] ], // EMP005
  [ [+2, -0, -1, +2, +2],  [-5, -7, -2, +0, +1], [-1, +3, -1, +1, +0], [-9, -6, -2, -3, +1], [+1, +6, +4, +4, -1], [+14,+11,+10,+9, -5] ], // EMP006
  [ [+2, -1, +3, +2, -1],  [+4, +2, -2, +5, +0], [-8,-5, +0, +0, +0],  [+8, +12,+0, +10,-1], [-4,-0, -5, -0, +1],  [+5, +8, +2, +5, -1] ], // EMP007
  [ [+0, +0, -1, -1, +2],  [-8,-11,-2, -3, +1],  [+17,+9, +15,+12,-6], [-8, -9,-3, -3, -2],  [+1, +0, +6, +5, -3], [-8,-10, +0, -2, +1] ], // EMP008
  [ [-4, +2, +1, +4, -2],  [+11,+12,+5, +8, -2], [-2,-1, -4, -4, +0],  [+9, +10,+5, +8, -1], [-3,-2, -0, +4, +1],  [+0, -1, -3, -1, +1] ], // EMP009
  [ [-1, -2, +2, -0, +0],  [-8, -4, -3, -2, +1], [-2, +2, +0, +2, +1], [-2, +3, +2, +6, +1], [-3, +2, +1, +1, -1], [+5, +10,+5, +7, -3] ], // EMP010
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

// AHP comparisons (sama untuk semua periode)
const AHP_PAIRS = [
  ['Target Omset', 'Profitabilitas',    2],
  ['Target Omset', 'Retensi Pelanggan', 3],
  ['Target Omset', 'Pelanggan Baru',    2],
  ['Target Omset', 'Efektivitas Biaya', 4],
  ['Profitabilitas',    'Retensi Pelanggan', 2],
  ['Profitabilitas',    'Pelanggan Baru',    1],
  ['Profitabilitas',    'Efektivitas Biaya', 3],
  ['Retensi Pelanggan', 'Pelanggan Baru',    1],
  ['Retensi Pelanggan', 'Efektivitas Biaya', 2],
  ['Pelanggan Baru',    'Efektivitas Biaya', 2],
];

const AHP_WEIGHTS = [
  ['Target Omset',      0.35200000],
  ['Profitabilitas',    0.24800000],
  ['Retensi Pelanggan', 0.19800000],
  ['Pelanggan Baru',    0.12200000],
  ['Efektivitas Biaya', 0.08000000],
];

const lines = [];

lines.push(`-- =============================================================================`);
lines.push(`-- SIPENS — Seed 10 Sales Karyawan (Jan–Jun 2025, Juara Berbeda Tiap Bulan)`);
lines.push(`-- Jalankan: node scripts/generate-seed-10-sales.js`);
lines.push(`-- Generate: node scripts/generate-seed-10-sales.js`);
lines.push(`-- =============================================================================`);
lines.push('');

// Hapus data lama
for (const p of PERIODS) {
  lines.push(`DELETE FROM public.wp_results   WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.sales_scores WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_weights  WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_comparisons WHERE period = '${p}';`);
}
lines.push(`DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';`);
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
  lines.push(`JOIN public.criteria a ON a.name = v.criteria_a`);
  lines.push(`JOIN public.criteria b ON b.name = v.criteria_b;`);
  lines.push('');

  lines.push(`INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)`);
  lines.push(`SELECT '${period}', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE`);
  lines.push(`FROM (VALUES`);
  const wRows = AHP_WEIGHTS.map(([n, w]) => `  ('${n}', ${w.toFixed(8)})`);
  lines.push(wRows.join(',\n'));
  lines.push(`) AS w(name, weight)`);
  lines.push(`JOIN public.criteria c ON c.name = w.name;`);
  lines.push('');
}

// Scores & WP results per periode
for (let pi = 0; pi < PERIODS.length; pi++) {
  const period = PERIODS[pi];
  const champIdx = MONTH_CHAMPIONS[pi];

  // Collect scores
  const scoredAlts = SALES.map((s, si) => {
    const scores = getScores(si, pi);
    return { id: s.employeeId, name: s.name, employeeId: s.employeeId, scores };
  });

  // Boost champion so they clearly win
  const champScores = scoredAlts[champIdx].scores.slice();
  champScores[0] = Math.min(100, champScores[0] + 12); // TO
  champScores[1] = Math.min(100, champScores[1] + 8);  // P
  champScores[4] = Math.max(5, champScores[4] - 3);    // EB (lower is better)
  scoredAlts[champIdx] = { ...scoredAlts[champIdx], scores: champScores };

  const wpRes = computeWP(scoredAlts, CRITERIA, WEIGHTS);

  // Sales scores
  lines.push(`-- Nilai Sales: ${period}`);
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
  lines.push(`JOIN public.criteria c ON c.name = v.criteria_name;`);
  lines.push('');

  // WP results
  lines.push(`-- Hasil WP: ${period} (Juara: ${SALES[champIdx].name})`);
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

lines.push(`-- Selesai. Buka Riwayat → pilih periode → lihat ranking 10 sales per bulan.`);

const output = lines.join('\n');
const outPath = resolve(process.cwd(), 'seed-10-sales.sql');
writeFileSync(outPath, output, 'utf8');
console.log(`✅ Ditulis: ${outPath}`);
