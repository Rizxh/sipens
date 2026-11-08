/**
 * Generate seed-10-sales.sql — 10 sales, Jan–Jun 2025, 3 kriteria, juara berbeda tiap bulan
 * Jalankan: node scripts/generate-seed-10-sales.js
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { computeWP } from '../src/utils/wp.js';

const PERIODS = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

const SALES = [
  { name: 'Anindya Kirana Putri', employeeId: 'EMP001' },
  { name: 'Nadhira Ayu Lestari', employeeId: 'EMP002' },
  { name: 'Raka Aditya Pratama', employeeId: 'EMP003' },
  { name: 'Keisha Aurelia Wijaya', employeeId: 'EMP004' },
  { name: 'Salsabila Rahmadani', employeeId: 'EMP005' },
  { name: 'Shafira Maharani', employeeId: 'EMP006' },
  { name: 'Dimas Arya Putra', employeeId: 'EMP007' },
  { name: 'Callista Febriani', employeeId: 'EMP008' },
  { name: 'Zahra Amalia Siregar', employeeId: 'EMP009' },
  { name: 'Kayla Anggraeni', employeeId: 'EMP010' },
];

// 3 kriteria saja
const CRITERIA = [
  { name: 'Target Omset',      type: 'benefit' },
  { name: 'Pelanggan Baru',    type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost'    },
];

// Bobot AHP (TO=0.633, PB=0.261, EB=0.106) — CR≈0.035
const WEIGHTS = [0.633, 0.261, 0.106];

// AHP pairs: TO vs PB=3, TO vs EB=5, PB vs EB=3
const AHP_PAIRS = [
  ['Target Omset',   'Pelanggan Baru',    3],
  ['Target Omset',   'Efektivitas Biaya', 5],
  ['Pelanggan Baru', 'Efektivitas Biaya', 3],
];

const AHP_WEIGHTS = [
  ['Target Omset',      0.63300000],
  ['Pelanggan Baru',    0.26100000],
  ['Efektivitas Biaya', 0.10600000],
];

/**
 * Nilai per sales per bulan: [Target Omset, Pelanggan Baru, Efektivitas Biaya]
 * - Target Omset  : 50–100 (benefit, makin besar makin baik)
 * - Pelanggan Baru: 50–100 (benefit, makin besar makin baik)
 * - Efektivitas B.: 5–25   (cost, makin kecil makin baik)
 *
 * Juara tiap bulan (nilai tertinggi di TO+PB, terendah di EB):
 *   Jan=EMP001 Anindya, Feb=EMP002 Nadhira, Mar=EMP008 Callista,
 *   Apr=EMP005 Salsabila, Mei=EMP003 Raka, Jun=EMP006 Shafira
 */
const MONTHLY_SCORES = [
  // ── Januari 2025 — Juara: Anindya Kirana Putri (EMP001) ──────────────────────
  [
    //        TO   PB   EB
    /* 001 */ [96,  91,   7],  // 🏆 Anindya    — omset tertinggi, pelanggan banyak, biaya rendah
    /* 002 */ [78,  85,  14],  // Nadhira       — PB bagus tapi TO rendah
    /* 003 */ [82,  75,  12],  // Raka
    /* 004 */ [80,  70,  16],  // Keisha       — EB tinggi
    /* 005 */ [70,  88,  11],  // Salsabila       — PB tinggi tapi TO rendah
    /* 006 */ [83,  77,  15],  // Shafira
    /* 007 */ [79,  81,  11],  // Dimas
    /* 008 */ [76,  72,  15],  // Callista
    /* 009 */ [72,  83,   9],  // Zahra
    /* 010 */ [81,  78,  13],  // Kayla
  ],
  // ── Februari 2025 — Juara: Nadhira Ayu Lestari (EMP002) ─────────────────────
  [
    /* 001 */ [83,  80,  13],  // Anindya
    /* 002 */ [97,  93,   6],  // 🏆 Nadhira    — dominan di semua kriteria
    /* 003 */ [74,  72,  13],  // Raka
    /* 004 */ [70,  68,  15],  // Keisha
    /* 005 */ [80,  88,  11],  // Salsabila       — PB kuat
    /* 006 */ [76,  76,  14],  // Shafira
    /* 007 */ [83,  85,  12],  // Dimas
    /* 008 */ [70,  69,  15],  // Callista
    /* 009 */ [84,  90,   9],  // Zahra     — PB tinggi
    /* 010 */ [74,  77,  14],  // Kayla
  ],
  // ── Maret 2025 — Juara: Callista Febriani (EMP008) ───────────────────────────
  [
    /* 001 */ [79,  77,  12],  // Anindya
    /* 002 */ [74,  83,  15],  // Nadhira
    /* 003 */ [85,  79,  11],  // Raka       — TO tinggi, hampir juara
    /* 004 */ [78,  71,  14],  // Keisha
    /* 005 */ [67,  75,  14],  // Salsabila
    /* 006 */ [80,  76,  13],  // Shafira
    /* 007 */ [71,  79,  12],  // Dimas
    /* 008 */ [95,  90,   6],  // 🏆 Callista    — lonjakan besar, TO+PB tinggi, EB sangat rendah
    /* 009 */ [72,  78,  11],  // Zahra
    /* 010 */ [80,  80,  14],  // Kayla
  ],
  // ── April 2025 — Juara: Salsabila Rahmadani (EMP005) ────────────────────────
  [
    /* 001 */ [77,  75,  14],  // Anindya
    /* 002 */ [84,  88,  13],  // Nadhira       — kuat tapi kalah tipis
    /* 003 */ [71,  71,  13],  // Raka
    /* 004 */ [77,  73,  14],  // Keisha
    /* 005 */ [96,  95,   6],  // 🏆 Salsabila    — puncak performa, omset & pelanggan terbaik
    /* 006 */ [73,  72,  14],  // Shafira
    /* 007 */ [86,  89,  11],  // Dimas       — kompetitif
    /* 008 */ [71,  69,  12],  // Callista
    /* 009 */ [83,  90,  10],  // Zahra     — PB sangat tinggi
    /* 010 */ [80,  84,  14],  // Kayla
  ],
  // ── Mei 2025 — Juara: Raka Aditya Pratama (EMP003) ───────────────────────────
  [
    /* 001 */ [84,  84,  11],  // Anindya       — konsisten
    /* 002 */ [78,  87,  13],  // Nadhira
    /* 003 */ [95,  88,   7],  // 🏆 Raka    — TO sangat tinggi, EB rendah
    /* 004 */ [73,  73,  15],  // Keisha
    /* 005 */ [68,  77,  13],  // Salsabila
    /* 006 */ [83,  79,  12],  // Shafira
    /* 007 */ [75,  80,  12],  // Dimas
    /* 008 */ [80,  78,  11],  // Callista
    /* 009 */ [71,  86,  12],  // Zahra
    /* 010 */ [80,  79,  12],  // Kayla
  ],
  // ── Juni 2025 — Juara: Shafira Maharani (EMP006) ───────────────────────────
  [
    /* 001 */ [80,  77,  14],  // Anindya
    /* 002 */ [69,  67,  14],  // Nadhira
    /* 003 */ [84,  80,  13],  // Raka
    /* 004 */ [76,  72,  17],  // Keisha       — EB paling tinggi
    /* 005 */ [81,  79,  10],  // Salsabila
    /* 006 */ [97,  92,   6],  // 🏆 Shafira    — sprint akhir, terbaik di semua aspek
    /* 007 */ [83,  84,  11],  // Dimas
    /* 008 */ [72,  71,  14],  // Callista
    /* 009 */ [74,  82,  12],  // Zahra
    /* 010 */ [86,  86,  10],  // Kayla       — kuat tapi kalah Shafira
  ],
];

const lines = [];

lines.push(`-- =============================================================================`);
lines.push(`-- SIPENS — Seed 10 Sales, 3 Kriteria`);
lines.push(`-- Kriteria: Target Omset (benefit), Pelanggan Baru (benefit), Efektivitas Biaya (cost)`);
lines.push(`-- Periode : Jan–Jun 2026 | Juara berbeda tiap bulan`);
lines.push(`-- Juara   : Jan=Anindya, Feb=Nadhira, Mar=Callista, Apr=Salsabila, Mei=Raka, Jun=Shafira`);
lines.push(`-- =============================================================================`);
lines.push('');
lines.push(`-- Hapus semua data lama (2025 dan 2026, termasuk 90 sales extra jika ada)`);
const ALL_PERIODS = [
  '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
  '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
];
for (const p of ALL_PERIODS) {
  lines.push(`DELETE FROM public.wp_results      WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.sales_scores    WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_weights     WHERE period = '${p}';`);
  lines.push(`DELETE FROM public.ahp_comparisons WHERE period = '${p}';`);
}
lines.push(`DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';`);
lines.push('');

lines.push(`-- Reset kriteria: nonaktifkan semua, insert/aktifkan 3 kriteria saja`);
lines.push(`UPDATE public.criteria SET is_active = FALSE;`);
lines.push('');
lines.push(`INSERT INTO public.criteria (name, type, description, is_active) VALUES`);
lines.push(`  ('Target Omset',      'benefit', 'Pencapaian target omset penjualan (semakin besar semakin baik)', TRUE),`);
lines.push(`  ('Pelanggan Baru',    'benefit', 'Jumlah pelanggan baru yang berhasil diperoleh (semakin besar semakin baik)', TRUE),`);
lines.push(`  ('Efektivitas Biaya', 'cost',    'Biaya operasional yang dikeluarkan (semakin kecil semakin baik)', TRUE)`);
lines.push(`ON CONFLICT (name) DO UPDATE SET is_active = TRUE, type = EXCLUDED.type, description = EXCLUDED.description;`);
lines.push('');

lines.push(`-- 10 Sales Karyawan`);
lines.push(`INSERT INTO public.sales (name, employee_id) VALUES`);
const salesRows = SALES.map((s) => `  ('${s.name}', '${s.employeeId}')`);
lines.push(salesRows.join(',\n') + ';');
lines.push('');

// AHP per periode
for (const period of PERIODS) {
  lines.push(`-- AHP Bobot: ${period}`);
  lines.push(`INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)`);
  lines.push(`SELECT '${period}', a.id, b.id, v.val`);
  lines.push(`FROM (VALUES`);
  lines.push(AHP_PAIRS.map(([a, b, v]) => `  ('${a}', '${b}', ${v})`).join(',\n'));
  lines.push(`) AS v(criteria_a, criteria_b, val)`);
  lines.push(`JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE`);
  lines.push(`JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;`);
  lines.push('');

  lines.push(`INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)`);
  lines.push(`SELECT '${period}', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE`);
  lines.push(`FROM (VALUES`);
  lines.push(AHP_WEIGHTS.map(([n, w]) => `  ('${n}', ${w.toFixed(8)})`).join(',\n'));
  lines.push(`) AS w(name, weight)`);
  lines.push(`JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;`);
  lines.push('');
}

// Scores + WP results per periode
for (let pi = 0; pi < PERIODS.length; pi++) {
  const period = PERIODS[pi];
  const monthScores = MONTHLY_SCORES[pi];

  // Build alts dengan scores eksplisit
  const scoredAlts = SALES.map((s, si) => ({
    id: s.employeeId,
    name: s.name,
    employeeId: s.employeeId,
    scores: monthScores[si],
  }));

  const wpRes = computeWP(scoredAlts, CRITERIA, WEIGHTS);
  const winner = wpRes.results[0];

  lines.push(`-- ─────────────────────────────────────────────────────────────────`);
  lines.push(`-- Nilai Sales: ${period}`);
  lines.push(`-- Juara: ${winner.name} (${winner.employeeId})`);
  lines.push(`--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%`);
  lines.push(`--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%`);
  lines.push(`--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%`);
  lines.push(`-- ─────────────────────────────────────────────────────────────────`);
  lines.push(`INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)`);
  lines.push(`SELECT s.id, c.id, '${period}', v.score`);
  lines.push(`FROM (VALUES`);
  const scoreRows = [];
  for (const alt of scoredAlts) {
    const [to, pb, eb] = alt.scores;
    scoreRows.push(`  ('${alt.employeeId}', 'Target Omset',      ${to})`);
    scoreRows.push(`  ('${alt.employeeId}', 'Pelanggan Baru',    ${pb})`);
    scoreRows.push(`  ('${alt.employeeId}', 'Efektivitas Biaya', ${eb})`);
  }
  lines.push(scoreRows.join(',\n'));
  lines.push(`) AS v(employee_id, criteria_name, score)`);
  lines.push(`JOIN public.sales s ON s.employee_id = v.employee_id`);
  lines.push(`JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;`);
  lines.push('');

  lines.push(`INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)`);
  lines.push(`SELECT s.id, '${period}', r.s_val, r.v_val, r.rnk`);
  lines.push(`FROM (VALUES`);
  const wpRows = wpRes.results.map(
    (r) => `  ('${r.employeeId}', ${r.sValue.toFixed(8)}, ${r.vValue.toFixed(8)}, ${r.rank})`
  );
  lines.push(wpRows.join(',\n'));
  lines.push(`) AS r(employee_id, s_val, v_val, rnk)`);
  lines.push(`JOIN public.sales s ON s.employee_id = r.employee_id;`);
  lines.push('');
}

lines.push(`-- =============================================================================`);
lines.push(`-- Selesai! Jalankan di Supabase SQL Editor.`);
lines.push(`-- Hasil: 10 sales, 6 bulan (Jan–Jun 2026), juara berbeda tiap bulan:`);
lines.push(`--   Jan=Anindya Kirana Putri   Feb=Nadhira Ayu Lestari  Mar=Callista Febriani`);
lines.push(`--   Apr=Salsabila Rahmadani   Mei=Raka Aditya Pratama  Jun=Shafira Maharani`);
lines.push(`-- =============================================================================`);

const output = lines.join('\n');
const outPath = resolve(process.cwd(), 'seed-10-sales.sql');
writeFileSync(outPath, output, 'utf8');
console.log(`✅ Seed ditulis: ${outPath}`);
console.log(`   Kriteria: ${CRITERIA.map((c) => c.name).join(', ')}`);
console.log(`   Periode : ${PERIODS.join(', ')}`);
console.log(`   Sales   : ${SALES.length} karyawan`);
console.log('');
console.log('Verifikasi juara per bulan:');
