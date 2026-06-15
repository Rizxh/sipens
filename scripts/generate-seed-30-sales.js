/**
 * Generate seed-30-sales.sql — 30 sales + scores + AHP + WP results
 * Jalankan: node scripts/generate-seed-30-sales.js
 */
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { computeWP } from '../src/utils/wp.js';

const PERIOD = '2025-06';

const FIRST_NAMES = [
  'Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Maya', 'Agus', 'Rina', 'Hendra', 'Fitri',
  'Bambang', 'Lestari', 'Eko', 'Putri', 'Joko', 'Ani', 'Doni', 'Sari', 'Yoga', 'Nina',
  'Fajar', 'Wulan', 'Rudi', 'Citra', 'Bayu', 'Dian', 'Galih', 'Ayu', 'Dimas', 'Melati',
];

const LAST_NAMES = [
  'Santoso', 'Rahayu', 'Wijaya', 'Lestari', 'Pratama', 'Sari', 'Hidayat', 'Kusuma',
  'Saputra', 'Anggraini', 'Nugroho', 'Permata', 'Setiawan', 'Maharani', 'Susanto',
];

const CRITERIA = [
  { name: 'Target Omset', type: 'benefit' },
  { name: 'Profitabilitas', type: 'benefit' },
  { name: 'Retensi Pelanggan', type: 'benefit' },
  { name: 'Pelanggan Baru', type: 'benefit' },
  { name: 'Efektivitas Biaya', type: 'cost' },
];

const WEIGHTS = [0.352, 0.248, 0.198, 0.122, 0.08];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function generateSales() {
  const rand = seededRandom(42);
  return FIRST_NAMES.map((first, i) => {
    const last = LAST_NAMES[i % LAST_NAMES.length];
    const employeeId = `EMP${String(i + 1).padStart(3, '0')}`;
    const base = 60 + rand() * 35;

    const scores = [
      Math.round(base + rand() * 30),
      Math.round(55 + rand() * 40),
      Math.round(50 + rand() * 45),
      Math.round(40 + rand() * 55),
      Math.round(8 + rand() * 12),
    ].map((v, j) => (j === 4 ? Math.max(5, Math.min(25, v)) : Math.max(50, Math.min(100, v))));

    return {
      name: `${first} ${last}`,
      employeeId,
      scores,
    };
  });
}

const sales = generateSales();

const wpResult = computeWP(
  sales.map((s, i) => ({
    id: `s${i}`,
    name: s.name,
    employeeId: s.employeeId,
    scores: s.scores,
  })),
  CRITERIA.map((c, i) => ({ id: `c${i}`, ...c })),
  WEIGHTS
);

const rankMap = Object.fromEntries(
  wpResult.results.map((r) => [r.employeeId, r])
);

let sql = `-- =============================================================================
-- SIPENS — Seed 30 Sales + Data Penilaian Lengkap
-- Periode: ${PERIOD}
-- Jalankan SETELAH schema.sql (+ fix-rls-recursion.sql jika perlu)
-- Generate: node scripts/generate-seed-30-sales.js
-- =============================================================================

DELETE FROM public.wp_results WHERE period = '${PERIOD}';
DELETE FROM public.sales_scores WHERE period = '${PERIOD}';
DELETE FROM public.ahp_weights WHERE period = '${PERIOD}';
DELETE FROM public.ahp_comparisons WHERE period = '${PERIOD}';

-- Hapus sales seed lama (EMP001-EMP030) agar idempotent
DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';

-- -----------------------------------------------------------------------------
-- 30 Sales
-- -----------------------------------------------------------------------------
INSERT INTO public.sales (name, employee_id) VALUES
`;

sql += sales.map((s) => `  ('${s.name.replace(/'/g, "''")}', '${s.employeeId}')`).join(',\n');
sql += `\nON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;\n\n`;

sql += `-- AHP comparisons
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '${PERIOD}', a.id, b.id, v.val
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
SELECT '${PERIOD}', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset',      0.35200000),
  ('Profitabilitas',    0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru',    0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- Sales scores (30 sales x 5 kriteria = 150 rows)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '${PERIOD}', v.score
FROM (VALUES
`;

const scoreRows = [];
for (const sale of sales) {
  const criteriaNames = [
    'Target Omset',
    'Profitabilitas',
    'Retensi Pelanggan',
    'Pelanggan Baru',
    'Efektivitas Biaya',
  ];
  criteriaNames.forEach((cName, j) => {
    scoreRows.push(`  ('${sale.employeeId}', '${cName}', ${sale.scores[j]})`);
  });
}

sql += scoreRows.join(',\n');
sql += `
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- WP results (ranking 30 sales)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '${PERIOD}', r.s_value, r.v_value, r.rank
FROM (VALUES
`;

const wpRows = sales.map((s) => {
  const r = rankMap[s.employeeId];
  return `  ('${s.employeeId}', ${r.sValue.toFixed(6)}, ${r.vValue.toFixed(6)}, ${r.rank})`;
});

sql += wpRows.join(',\n');
sql += `
) AS r(employee_id, s_value, v_value, rank)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Sales Terbaik: ${wpResult.bestSales.name} (Rank #1, V=${(wpResult.bestSales.vValue * 100).toFixed(2)}%)
`;

const outPath = resolve(process.cwd(), 'seed-30-sales.sql');
writeFileSync(outPath, sql, 'utf8');
console.log('Generated:', outPath);
console.log('Sales:', sales.length);
console.log('Best:', wpResult.bestSales.name, `V=${(wpResult.bestSales.vValue * 100).toFixed(2)}%`);
console.log('Top 3:');
wpResult.results.slice(0, 3).forEach((r) => {
  console.log(`  #${r.rank} ${r.name} — ${(r.vValue * 100).toFixed(2)}%`);
});
