-- =============================================================================
-- SIPENS — Seed 10 Sales, 3 Kriteria
-- Kriteria: Target Omset (benefit), Pelanggan Baru (benefit), Efektivitas Biaya (cost)
-- Periode : Jan–Jun 2026 | Juara berbeda tiap bulan
-- Juara   : Jan=Budi, Feb=Siti, Mar=Rina, Apr=Rudi, Mei=Andi, Jun=Maya
-- =============================================================================

-- Hapus semua data lama (2025 dan 2026, termasuk 90 sales extra jika ada)
DELETE FROM public.wp_results      WHERE period = '2025-01';
DELETE FROM public.sales_scores    WHERE period = '2025-01';
DELETE FROM public.ahp_weights     WHERE period = '2025-01';
DELETE FROM public.ahp_comparisons WHERE period = '2025-01';
DELETE FROM public.wp_results      WHERE period = '2025-02';
DELETE FROM public.sales_scores    WHERE period = '2025-02';
DELETE FROM public.ahp_weights     WHERE period = '2025-02';
DELETE FROM public.ahp_comparisons WHERE period = '2025-02';
DELETE FROM public.wp_results      WHERE period = '2025-03';
DELETE FROM public.sales_scores    WHERE period = '2025-03';
DELETE FROM public.ahp_weights     WHERE period = '2025-03';
DELETE FROM public.ahp_comparisons WHERE period = '2025-03';
DELETE FROM public.wp_results      WHERE period = '2025-04';
DELETE FROM public.sales_scores    WHERE period = '2025-04';
DELETE FROM public.ahp_weights     WHERE period = '2025-04';
DELETE FROM public.ahp_comparisons WHERE period = '2025-04';
DELETE FROM public.wp_results      WHERE period = '2025-05';
DELETE FROM public.sales_scores    WHERE period = '2025-05';
DELETE FROM public.ahp_weights     WHERE period = '2025-05';
DELETE FROM public.ahp_comparisons WHERE period = '2025-05';
DELETE FROM public.wp_results      WHERE period = '2025-06';
DELETE FROM public.sales_scores    WHERE period = '2025-06';
DELETE FROM public.ahp_weights     WHERE period = '2025-06';
DELETE FROM public.ahp_comparisons WHERE period = '2025-06';
DELETE FROM public.wp_results      WHERE period = '2026-01';
DELETE FROM public.sales_scores    WHERE period = '2026-01';
DELETE FROM public.ahp_weights     WHERE period = '2026-01';
DELETE FROM public.ahp_comparisons WHERE period = '2026-01';
DELETE FROM public.wp_results      WHERE period = '2026-02';
DELETE FROM public.sales_scores    WHERE period = '2026-02';
DELETE FROM public.ahp_weights     WHERE period = '2026-02';
DELETE FROM public.ahp_comparisons WHERE period = '2026-02';
DELETE FROM public.wp_results      WHERE period = '2026-03';
DELETE FROM public.sales_scores    WHERE period = '2026-03';
DELETE FROM public.ahp_weights     WHERE period = '2026-03';
DELETE FROM public.ahp_comparisons WHERE period = '2026-03';
DELETE FROM public.wp_results      WHERE period = '2026-04';
DELETE FROM public.sales_scores    WHERE period = '2026-04';
DELETE FROM public.ahp_weights     WHERE period = '2026-04';
DELETE FROM public.ahp_comparisons WHERE period = '2026-04';
DELETE FROM public.wp_results      WHERE period = '2026-05';
DELETE FROM public.sales_scores    WHERE period = '2026-05';
DELETE FROM public.ahp_weights     WHERE period = '2026-05';
DELETE FROM public.ahp_comparisons WHERE period = '2026-05';
DELETE FROM public.wp_results      WHERE period = '2026-06';
DELETE FROM public.sales_scores    WHERE period = '2026-06';
DELETE FROM public.ahp_weights     WHERE period = '2026-06';
DELETE FROM public.ahp_comparisons WHERE period = '2026-06';
DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';

-- Reset kriteria: nonaktifkan semua, insert/aktifkan 3 kriteria saja
UPDATE public.criteria SET is_active = FALSE;

INSERT INTO public.criteria (name, type, description, is_active) VALUES
  ('Target Omset',      'benefit', 'Pencapaian target omset penjualan (semakin besar semakin baik)', TRUE),
  ('Pelanggan Baru',    'benefit', 'Jumlah pelanggan baru yang berhasil diperoleh (semakin besar semakin baik)', TRUE),
  ('Efektivitas Biaya', 'cost',    'Biaya operasional yang dikeluarkan (semakin kecil semakin baik)', TRUE)
ON CONFLICT (name) DO UPDATE SET is_active = TRUE, type = EXCLUDED.type, description = EXCLUDED.description;

-- 10 Sales Karyawan
INSERT INTO public.sales (name, employee_id) VALUES
  ('Budi Santoso', 'EMP001'),
  ('Siti Rahayu', 'EMP002'),
  ('Andi Wijaya', 'EMP003'),
  ('Dewi Kusuma', 'EMP004'),
  ('Rudi Hartono', 'EMP005'),
  ('Maya Putri', 'EMP006'),
  ('Agus Setiawan', 'EMP007'),
  ('Rina Wati', 'EMP008'),
  ('Hendra Gunawan', 'EMP009'),
  ('Lina Sari', 'EMP010');

-- AHP Bobot: 2026-01
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-01', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-01', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP Bobot: 2026-02
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-02', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-02', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP Bobot: 2026-03
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-03', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-03', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP Bobot: 2026-04
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-04', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-04', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP Bobot: 2026-05
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-05', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-05', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP Bobot: 2026-06
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2026-06', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2026-06', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-01  |  Juara: Budi Santoso (EMP001)
-- Skala penilaian: 1–10  |  TO=benefit, PB=benefit, EB=cost
-- S = TO^0.633 × PB^0.261 × EB^(-0.106)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-01', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      10),
  ('EMP001', 'Pelanggan Baru',     9),
  ('EMP001', 'Efektivitas Biaya',  2),
  ('EMP002', 'Target Omset',       8),
  ('EMP002', 'Pelanggan Baru',     8),
  ('EMP002', 'Efektivitas Biaya',  4),
  ('EMP003', 'Target Omset',       8),
  ('EMP003', 'Pelanggan Baru',     7),
  ('EMP003', 'Efektivitas Biaya',  3),
  ('EMP004', 'Target Omset',       7),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',       6),
  ('EMP005', 'Pelanggan Baru',     9),
  ('EMP005', 'Efektivitas Biaya',  3),
  ('EMP006', 'Target Omset',       8),
  ('EMP006', 'Pelanggan Baru',     7),
  ('EMP006', 'Efektivitas Biaya',  5),
  ('EMP007', 'Target Omset',       7),
  ('EMP007', 'Pelanggan Baru',     8),
  ('EMP007', 'Efektivitas Biaya',  4),
  ('EMP008', 'Target Omset',       6),
  ('EMP008', 'Pelanggan Baru',     6),
  ('EMP008', 'Efektivitas Biaya',  5),
  ('EMP009', 'Target Omset',       6),
  ('EMP009', 'Pelanggan Baru',     8),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       7),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  4)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-01', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP001', 7.08180000, 0.13661800, 1),
  ('EMP002', 5.54040000, 0.10688200, 2),
  ('EMP003', 5.51640000, 0.10641900, 3),
  ('EMP006', 5.22300000, 0.10076400, 4),
  ('EMP007', 5.09160000, 0.09823000, 5),
  ('EMP010', 4.91620000, 0.09484300, 6),
  ('EMP005', 4.90950000, 0.09471400, 7),
  ('EMP009', 4.76110000, 0.09185400, 8),
  ('EMP004', 4.61260000, 0.08899300, 9),
  ('EMP008', 4.18330000, 0.08070300, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-02  |  Juara: Siti Rahayu (EMP002)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-02', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',       8),
  ('EMP001', 'Pelanggan Baru',     8),
  ('EMP001', 'Efektivitas Biaya',  4),
  ('EMP002', 'Target Omset',      10),
  ('EMP002', 'Pelanggan Baru',     9),
  ('EMP002', 'Efektivitas Biaya',  2),
  ('EMP003', 'Target Omset',       7),
  ('EMP003', 'Pelanggan Baru',     6),
  ('EMP003', 'Efektivitas Biaya',  3),
  ('EMP004', 'Target Omset',       6),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',       7),
  ('EMP005', 'Pelanggan Baru',     8),
  ('EMP005', 'Efektivitas Biaya',  4),
  ('EMP006', 'Target Omset',       7),
  ('EMP006', 'Pelanggan Baru',     7),
  ('EMP006', 'Efektivitas Biaya',  5),
  ('EMP007', 'Target Omset',       8),
  ('EMP007', 'Pelanggan Baru',     7),
  ('EMP007', 'Efektivitas Biaya',  4),
  ('EMP008', 'Target Omset',       6),
  ('EMP008', 'Pelanggan Baru',     7),
  ('EMP008', 'Efektivitas Biaya',  5),
  ('EMP009', 'Target Omset',       8),
  ('EMP009', 'Pelanggan Baru',     9),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       7),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  4)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-02', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP002', 7.08180000, 0.13596800, 1),
  ('EMP009', 5.89090000, 0.11310500, 2),
  ('EMP001', 5.54040000, 0.10637300, 3),
  ('EMP007', 5.35100000, 0.10273900, 4),
  ('EMP005', 5.09160000, 0.09776200, 5),
  ('EMP010', 4.91620000, 0.09439200, 6),
  ('EMP003', 4.86920000, 0.09349000, 7),
  ('EMP006', 4.80240000, 0.09220700, 8),
  ('EMP008', 4.35730000, 0.08365900, 9),
  ('EMP004', 4.18330000, 0.08031900, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-03  |  Juara: Rina Wati (EMP008)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-03', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',       7),
  ('EMP001', 'Pelanggan Baru',     8),
  ('EMP001', 'Efektivitas Biaya',  5),
  ('EMP002', 'Target Omset',       8),
  ('EMP002', 'Pelanggan Baru',     7),
  ('EMP002', 'Efektivitas Biaya',  4),
  ('EMP003', 'Target Omset',       7),
  ('EMP003', 'Pelanggan Baru',     6),
  ('EMP003', 'Efektivitas Biaya',  5),
  ('EMP004', 'Target Omset',       6),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',       7),
  ('EMP005', 'Pelanggan Baru',     7),
  ('EMP005', 'Efektivitas Biaya',  4),
  ('EMP006', 'Target Omset',       7),
  ('EMP006', 'Pelanggan Baru',     6),
  ('EMP006', 'Efektivitas Biaya',  4),
  ('EMP007', 'Target Omset',       8),
  ('EMP007', 'Pelanggan Baru',     8),
  ('EMP007', 'Efektivitas Biaya',  3),
  ('EMP008', 'Target Omset',      10),
  ('EMP008', 'Pelanggan Baru',     9),
  ('EMP008', 'Efektivitas Biaya',  2),
  ('EMP009', 'Target Omset',       6),
  ('EMP009', 'Pelanggan Baru',     7),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       7),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  5)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-03', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP008', 7.08180000, 0.13895900, 1),
  ('EMP007', 5.71750000, 0.11219600, 2),
  ('EMP002', 5.35100000, 0.10500000, 3),
  ('EMP001', 4.97340000, 0.09759500, 4),
  ('EMP005', 4.91620000, 0.09647400, 5),
  ('EMP010', 4.80240000, 0.09423800, 6),
  ('EMP006', 4.72450000, 0.09270700, 7),
  ('EMP003', 4.61260000, 0.09051100, 8),
  ('EMP009', 4.59910000, 0.09024600, 9),
  ('EMP004', 4.18330000, 0.08207300, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-04  |  Juara: Rudi Hartono (EMP005)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-04', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',       8),
  ('EMP001', 'Pelanggan Baru',     7),
  ('EMP001', 'Efektivitas Biaya',  3),
  ('EMP002', 'Target Omset',       8),
  ('EMP002', 'Pelanggan Baru',     8),
  ('EMP002', 'Efektivitas Biaya',  4),
  ('EMP003', 'Target Omset',       7),
  ('EMP003', 'Pelanggan Baru',     6),
  ('EMP003', 'Efektivitas Biaya',  3),
  ('EMP004', 'Target Omset',       6),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',      10),
  ('EMP005', 'Pelanggan Baru',     9),
  ('EMP005', 'Efektivitas Biaya',  2),
  ('EMP006', 'Target Omset',       7),
  ('EMP006', 'Pelanggan Baru',     7),
  ('EMP006', 'Efektivitas Biaya',  3),
  ('EMP007', 'Target Omset',       7),
  ('EMP007', 'Pelanggan Baru',     8),
  ('EMP007', 'Efektivitas Biaya',  4),
  ('EMP008', 'Target Omset',       7),
  ('EMP008', 'Pelanggan Baru',     7),
  ('EMP008', 'Efektivitas Biaya',  5),
  ('EMP009', 'Target Omset',       7),
  ('EMP009', 'Pelanggan Baru',     8),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       8),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  5)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-04', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP005', 7.08180000, 0.13454800, 1),
  ('EMP002', 5.54040000, 0.10526000, 2),
  ('EMP001', 5.51640000, 0.10480400, 3),
  ('EMP009', 5.24840000, 0.09972000, 4),
  ('EMP010', 5.22390000, 0.09925400, 5),
  ('EMP007', 5.09160000, 0.09674100, 6),
  ('EMP006', 5.07150000, 0.09636000, 7),
  ('EMP003', 4.86920000, 0.09251800, 8),
  ('EMP008', 4.80240000, 0.09124800, 9),
  ('EMP004', 4.18330000, 0.07946500, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-05  |  Juara: Andi Wijaya (EMP003)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-05', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',       8),
  ('EMP001', 'Pelanggan Baru',     8),
  ('EMP001', 'Efektivitas Biaya',  4),
  ('EMP002', 'Target Omset',       8),
  ('EMP002', 'Pelanggan Baru',     7),
  ('EMP002', 'Efektivitas Biaya',  3),
  ('EMP003', 'Target Omset',      10),
  ('EMP003', 'Pelanggan Baru',     9),
  ('EMP003', 'Efektivitas Biaya',  2),
  ('EMP004', 'Target Omset',       6),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',       7),
  ('EMP005', 'Pelanggan Baru',     8),
  ('EMP005', 'Efektivitas Biaya',  4),
  ('EMP006', 'Target Omset',       8),
  ('EMP006', 'Pelanggan Baru',     7),
  ('EMP006', 'Efektivitas Biaya',  4),
  ('EMP007', 'Target Omset',       7),
  ('EMP007', 'Pelanggan Baru',     8),
  ('EMP007', 'Efektivitas Biaya',  5),
  ('EMP008', 'Target Omset',       7),
  ('EMP008', 'Pelanggan Baru',     7),
  ('EMP008', 'Efektivitas Biaya',  4),
  ('EMP009', 'Target Omset',       7),
  ('EMP009', 'Pelanggan Baru',     7),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       7),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  5)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-05', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP003', 7.08180000, 0.13481800, 1),
  ('EMP001', 5.54040000, 0.10547400, 2),
  ('EMP002', 5.51640000, 0.10501700, 3),
  ('EMP006', 5.35100000, 0.10187000, 4),
  ('EMP005', 5.09160000, 0.09693100, 5),
  ('EMP009', 5.07150000, 0.09654800, 6),
  ('EMP007', 4.97340000, 0.09468100, 7),
  ('EMP008', 4.91620000, 0.09359300, 8),
  ('EMP010', 4.80240000, 0.09142600, 9),
  ('EMP004', 4.18330000, 0.07963900, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-06  |  Juara: Maya Putri (EMP006)
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',       8),
  ('EMP001', 'Pelanggan Baru',     7),
  ('EMP001', 'Efektivitas Biaya',  4),
  ('EMP002', 'Target Omset',       8),
  ('EMP002', 'Pelanggan Baru',     8),
  ('EMP002', 'Efektivitas Biaya',  4),
  ('EMP003', 'Target Omset',       8),
  ('EMP003', 'Pelanggan Baru',     8),
  ('EMP003', 'Efektivitas Biaya',  5),
  ('EMP004', 'Target Omset',       6),
  ('EMP004', 'Pelanggan Baru',     6),
  ('EMP004', 'Efektivitas Biaya',  5),
  ('EMP005', 'Target Omset',       7),
  ('EMP005', 'Pelanggan Baru',     7),
  ('EMP005', 'Efektivitas Biaya',  4),
  ('EMP006', 'Target Omset',      10),
  ('EMP006', 'Pelanggan Baru',     9),
  ('EMP006', 'Efektivitas Biaya',  2),
  ('EMP007', 'Target Omset',       7),
  ('EMP007', 'Pelanggan Baru',     8),
  ('EMP007', 'Efektivitas Biaya',  4),
  ('EMP008', 'Target Omset',       8),
  ('EMP008', 'Pelanggan Baru',     7),
  ('EMP008', 'Efektivitas Biaya',  3),
  ('EMP009', 'Target Omset',       7),
  ('EMP009', 'Pelanggan Baru',     8),
  ('EMP009', 'Efektivitas Biaya',  3),
  ('EMP010', 'Target Omset',       7),
  ('EMP010', 'Pelanggan Baru',     7),
  ('EMP010', 'Efektivitas Biaya',  5)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-06', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP006', 7.08180000, 0.13325500, 1),
  ('EMP002', 5.54040000, 0.10425300, 2),
  ('EMP008', 5.51640000, 0.10380100, 3),
  ('EMP003', 5.41130000, 0.10182800, 4),
  ('EMP001', 5.35100000, 0.10069200, 5),
  ('EMP009', 5.24840000, 0.09876200, 6),
  ('EMP007', 5.09160000, 0.09581200, 7),
  ('EMP005', 4.91620000, 0.09251200, 8),
  ('EMP010', 4.80240000, 0.09037300, 9),
  ('EMP004', 4.18330000, 0.07870600, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- =============================================================================
-- Selesai! Jalankan di Supabase SQL Editor.
-- Nilai: skala 1–10 | S = TO^0.633 × PB^0.261 × EB^(-0.106)
-- Hasil: 10 sales, 6 bulan (Jan–Jun 2026), juara berbeda tiap bulan:
--   Jan=Budi Santoso   Feb=Siti Rahayu  Mar=Rina Wati
--   Apr=Rudi Hartono   Mei=Andi Wijaya  Jun=Maya Putri
-- =============================================================================