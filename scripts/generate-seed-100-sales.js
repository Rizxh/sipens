/**
 * Generate seed-100-sales.sql — 100 sales, Jan–Jun 2025, ranking per bulan
 * Jalankan: node scripts/generate-seed-100-sales.js
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { computeWP } from '../src/utils/wp.js';

const PERIODS = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
const SALES_COUNT = 100;

const FIRST_NAMES = [
  'Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Maya', 'Agus', 'Rina', 'Hendra', 'Fitri',
  'Bambang', 'Lestari', 'Eko', 'Putri', 'Joko', 'Ani', 'Doni', 'Sari', 'Yoga', 'Nina',
  'Fajar', 'Wulan', 'Rudi', 'Citra', 'Bayu', 'Dian', 'Galih', 'Ayu', 'Dimas', 'Melati',
  'Arif', 'Kartika', 'Hadi', 'Indah', 'Reza', 'Vina', 'Tono', 'Lia', 'Iwan', 'Dina',
  'Gilang', 'Ratna', 'Yudi', 'Mira', 'Arief', 'Sinta', 'Dedi', 'Rani', 'Fauzi', 'Nadia',
  'Herman', 'Yuni', 'Slamet', 'Tika', 'Wahyu', 'Dewa', 'Oki', 'Farah', 'Rama', 'Gita',
  'Adi', 'Nisa', 'Bima', 'Kiki', 'Candra', 'Lina', 'Darma', 'Putra', 'Eka', 'Susi',
  'Fadli', 'Wati', 'Gunawan', 'Rosa', 'Hafiz', 'Mega', 'Jaya', 'Novi', 'Kurnia', 'Alya',
  'Panji', 'Dinda', 'Rafli', 'Sela', 'Taufik', 'Zahra', 'Yasin', 'Mila', 'Kevin', 'Olivia',
  'Nanda', 'Sabrina', 'Ilham', 'Clara', 'Satria', 'Amelia', 'Bagas', 'Jessica', 'Danu', 'Felicia',
];

const LAST_NAMES = [
  'Santoso', 'Rahayu', 'Wijaya', 'Lestari', 'Pratama', 'Sari', 'Hidayat', 'Kusuma',
  'Saputra', 'Anggraini', 'Nugroho', 'Permata', 'Setiawan', 'Maharani', 'Susanto',
  'Wibowo', 'Halim', 'Utami', 'Purnama', 'Gunawan', 'Siregar', 'Nasution', 'Simanjuntak',
  'Hutapea', 'Sitorus', 'Pangestu', 'Cahyono', 'Handayani', 'Maulana', 'Firmansyah',
];

const CRITERIA = [
  { name: 'Target Omset', type: 'benefit' },
  { name: 'Profitabilitas', type: 'benefit' },
  { name: 'Retensi Pelanggan', type: 'benefit' },
  { name: 'Pelanggan Baru', type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost' },
];

const WEIGHTS = [0.352, 0.248, 0.198, 0.122, 0.08];

const CRITERIA_NAMES = CRITERIA.map((c) => c.name);

/** Indeks sales (0-based) — juara unik tiap bulan (EMP = index + 1) */
const MONTH_CHAMPIONS = [11, 27, 44, 66, 82, 99];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function clampBenefit(v) {
  return Math.max(50, Math.min(100, Math.round(v)));
}

function clampCost(v) {
  return Math.max(5, Math.min(25, Math.round(v)));
}

function generateSalesProfiles() {
  const rand = seededRandom(100);
  const usedNames = new Set();

  return Array.from({ length: SALES_COUNT }, (_, i) => {
    let name;
    let attempts = 0;
    do {
      const first = FIRST_NAMES[(i + attempts) % FIRST_NAMES.length];
      const last = LAST_NAMES[(i * 3 + attempts) % LAST_NAMES.length];
      name = `${first} ${last}`;
      attempts += 1;
    } while (usedNames.has(name) && attempts < 50);
    usedNames.add(name);

    const employeeId = `EMP${String(i + 1).padStart(3, '0')}`;
    const base = 58 + rand() * 32;

    const baseScores = [
      clampBenefit(base + rand() * 28),
      clampBenefit(55 + rand() * 38),
      clampBenefit(52 + rand() * 40),
      clampBenefit(42 + rand() * 50),
      clampCost(8 + rand() * 12),
    ];

    return { name, employeeId, baseScores };
  });
}

function scoresForMonth(profile, monthIndex, salesIndex) {
  const rand = seededRandom(1000 + monthIndex * 500 + salesIndex);
  const isChampion = salesIndex === MONTH_CHAMPIONS[monthIndex];

  if (isChampion) {
    return [
      clampBenefit(93 + rand() * 7),
      clampBenefit(91 + rand() * 7),
      clampBenefit(88 + rand() * 10),
      clampBenefit(86 + rand() * 12),
      clampCost(5 + rand() * 4),
    ];
  }

  return profile.baseScores.map((base, j) => {
    const drift = (rand() - 0.5) * 16;
    if (j === 4) return clampCost(base + drift * 0.35);
    return clampBenefit(base + drift);
  });
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

const salesProfiles = generateSalesProfiles();

const monthlyWp = PERIODS.map((period, monthIndex) => {
  const monthSales = salesProfiles.map((profile, salesIndex) => ({
    id: `s${salesIndex}`,
    name: profile.name,
    employeeId: profile.employeeId,
    scores: scoresForMonth(profile, monthIndex, salesIndex),
  }));

  const wpResult = computeWP(
    monthSales,
    CRITERIA.map((c, i) => ({ id: `c${i}`, ...c })),
    WEIGHTS
  );

  return { period, monthSales, wpResult };
});

let sql = `-- =============================================================================
-- SIPENS — Seed 100 Sales + Penilaian Jan–Jun 2025
-- Total: 100 sales × 6 bulan = 600 ranking WP
-- Jalankan SETELAH schema.sql (+ fix-rls-recursion.sql jika perlu)
-- Generate: node scripts/generate-seed-100-sales.js
-- =============================================================================

`;

for (const period of PERIODS) {
  sql += `DELETE FROM public.wp_results WHERE period = '${period}';\n`;
  sql += `DELETE FROM public.sales_scores WHERE period = '${period}';\n`;
  sql += `DELETE FROM public.ahp_weights WHERE period = '${period}';\n`;
  sql += `DELETE FROM public.ahp_comparisons WHERE period = '${period}';\n`;
}
sql += `\nDELETE FROM public.sales WHERE employee_id LIKE 'EMP%';\n\n`;

sql += `-- -----------------------------------------------------------------------------
-- 100 Sales
-- -----------------------------------------------------------------------------
INSERT INTO public.sales (name, employee_id) VALUES\n`;
sql += salesProfiles
  .map((s) => `  ('${escapeSql(s.name)}', '${s.employeeId}')`)
  .join(',\n');
sql += `\nON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;\n\n`;

const ahpComparisons = `-- AHP comparisons (sama per bulan, bobot konsisten)
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT :period, a.id, b.id, v.val
FROM (VALUES
  ('Target Omset',      'Profitabilitas',    2),
  ('Target Omset',      'Retensi Pelanggan', 3),
  ('Target Omset',      'Pelanggan Baru',    2),
  ('Target Omset',      'Efektivitas Biaya', 4),
  ('Profitabilitas',    'Retensi Pelanggan', 2),
  ('Profitabilitas',    'Pelanggan Baru',    1),
  ('Profitabilitas',    'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru',    1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru',    'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT :period, c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset',      0.35200000),
  ('Profitabilitas',    0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru',    0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;
`;

for (const { period } of monthlyWp) {
  sql += `-- --- AHP ${period} ---\n`;
  sql += ahpComparisons.replaceAll(':period', `'${period}'`);
  sql += '\n';
}

for (const { period, monthSales } of monthlyWp) {
  sql += `-- --- Nilai sales ${period} (${monthSales.length * CRITERIA.length} baris) ---\n`;
  sql += `INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)\n`;
  sql += `SELECT s.id, c.id, '${period}', v.score\nFROM (VALUES\n`;

  const scoreRows = [];
  for (const sale of monthSales) {
    CRITERIA_NAMES.forEach((cName, j) => {
      scoreRows.push(`  ('${sale.employeeId}', '${cName}', ${sale.scores[j]})`);
    });
  }
  sql += scoreRows.join(',\n');
  sql += `
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

`;
}

for (const { period, wpResult } of monthlyWp) {
  const rankMap = Object.fromEntries(
    wpResult.results.map((r) => [r.employeeId, r])
  );

  sql += `-- --- WP ${period} — Sales Terbaik: ${wpResult.bestSales.name} (V=${(wpResult.bestSales.vValue * 100).toFixed(2)}%) ---\n`;
  sql += `INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)\n`;
  sql += `SELECT s.id, '${period}', r.s_value, r.v_value, r.rank\nFROM (VALUES\n`;

  const wpRows = salesProfiles.map((s) => {
    const r = rankMap[s.employeeId];
    return `  ('${s.employeeId}', ${r.sValue.toFixed(6)}, ${r.vValue.toFixed(6)}, ${r.rank})`;
  });
  sql += wpRows.join(',\n');
  sql += `
) AS r(employee_id, s_value, v_value, rank)
JOIN public.sales s ON s.employee_id = r.employee_id;

`;
}

sql += `-- =============================================================================
-- Ringkasan Sales Terbaik per Bulan
-- =============================================================================
`;
for (const { period, wpResult } of monthlyWp) {
  const best = wpResult.bestSales;
  sql += `-- ${period}: ${best.name} (${best.employeeId}) — V ${(best.vValue * 100).toFixed(2)}%\n`;
}

const outPath = resolve(process.cwd(), 'seed-100-sales.sql');
writeFileSync(outPath, sql, 'utf8');

console.log('Generated:', outPath);
console.log('Sales:', salesProfiles.length);
console.log('Periods:', PERIODS.join(', '));
console.log('\nSales Terbaik per bulan:');
monthlyWp.forEach(({ period, wpResult }) => {
  const b = wpResult.bestSales;
  console.log(`  ${period}: ${b.name} (${b.employeeId}) — V ${(b.vValue * 100).toFixed(2)}%`);
});
