-- =============================================================================
-- SIPENS — Seed 10 Sales Karyawan (Jan–Jun 2025, Juara Berbeda Tiap Bulan)
-- Jalankan: node scripts/generate-seed-10-sales.js
-- Generate: node scripts/generate-seed-10-sales.js
-- =============================================================================

DELETE FROM public.wp_results   WHERE period = '2025-01';
DELETE FROM public.sales_scores WHERE period = '2025-01';
DELETE FROM public.ahp_weights  WHERE period = '2025-01';
DELETE FROM public.ahp_comparisons WHERE period = '2025-01';
DELETE FROM public.wp_results   WHERE period = '2025-02';
DELETE FROM public.sales_scores WHERE period = '2025-02';
DELETE FROM public.ahp_weights  WHERE period = '2025-02';
DELETE FROM public.ahp_comparisons WHERE period = '2025-02';
DELETE FROM public.wp_results   WHERE period = '2025-03';
DELETE FROM public.sales_scores WHERE period = '2025-03';
DELETE FROM public.ahp_weights  WHERE period = '2025-03';
DELETE FROM public.ahp_comparisons WHERE period = '2025-03';
DELETE FROM public.wp_results   WHERE period = '2025-04';
DELETE FROM public.sales_scores WHERE period = '2025-04';
DELETE FROM public.ahp_weights  WHERE period = '2025-04';
DELETE FROM public.ahp_comparisons WHERE period = '2025-04';
DELETE FROM public.wp_results   WHERE period = '2025-05';
DELETE FROM public.sales_scores WHERE period = '2025-05';
DELETE FROM public.ahp_weights  WHERE period = '2025-05';
DELETE FROM public.ahp_comparisons WHERE period = '2025-05';
DELETE FROM public.wp_results   WHERE period = '2025-06';
DELETE FROM public.sales_scores WHERE period = '2025-06';
DELETE FROM public.ahp_weights  WHERE period = '2025-06';
DELETE FROM public.ahp_comparisons WHERE period = '2025-06';
DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';

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

-- AHP: 2025-01
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-01', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-01', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- AHP: 2025-02
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-02', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-02', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- AHP: 2025-03
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-03', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-03', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- AHP: 2025-04
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-04', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-04', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- AHP: 2025-05
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-05', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-05', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- AHP: 2025-06
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-06', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Profitabilitas', 2),
  ('Target Omset', 'Retensi Pelanggan', 3),
  ('Target Omset', 'Pelanggan Baru', 2),
  ('Target Omset', 'Efektivitas Biaya', 4),
  ('Profitabilitas', 'Retensi Pelanggan', 2),
  ('Profitabilitas', 'Pelanggan Baru', 1),
  ('Profitabilitas', 'Efektivitas Biaya', 3),
  ('Retensi Pelanggan', 'Pelanggan Baru', 1),
  ('Retensi Pelanggan', 'Efektivitas Biaya', 2),
  ('Pelanggan Baru', 'Efektivitas Biaya', 2)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a
JOIN public.criteria b ON b.name = v.criteria_b;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-06', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
FROM (VALUES
  ('Target Omset', 0.35200000),
  ('Profitabilitas', 0.24800000),
  ('Retensi Pelanggan', 0.19800000),
  ('Pelanggan Baru', 0.12200000),
  ('Efektivitas Biaya', 0.08000000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name;

-- Nilai Sales: 2025-01
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-01', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 100),
  ('EMP001', 'Profitabilitas', 100),
  ('EMP001', 'Retensi Pelanggan', 91),
  ('EMP001', 'Pelanggan Baru', 85),
  ('EMP001', 'Efektivitas Biaya', 6),
  ('EMP002', 'Target Omset', 76),
  ('EMP002', 'Profitabilitas', 78),
  ('EMP002', 'Retensi Pelanggan', 79),
  ('EMP002', 'Pelanggan Baru', 95),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 85),
  ('EMP003', 'Profitabilitas', 85),
  ('EMP003', 'Retensi Pelanggan', 81),
  ('EMP003', 'Pelanggan Baru', 76),
  ('EMP003', 'Efektivitas Biaya', 12),
  ('EMP004', 'Target Omset', 88),
  ('EMP004', 'Profitabilitas', 90),
  ('EMP004', 'Retensi Pelanggan', 82),
  ('EMP004', 'Pelanggan Baru', 70),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 68),
  ('EMP005', 'Profitabilitas', 72),
  ('EMP005', 'Retensi Pelanggan', 74),
  ('EMP005', 'Pelanggan Baru', 90),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset', 85),
  ('EMP006', 'Profitabilitas', 82),
  ('EMP006', 'Retensi Pelanggan', 80),
  ('EMP006', 'Pelanggan Baru', 78),
  ('EMP006', 'Efektivitas Biaya', 15),
  ('EMP007', 'Target Omset', 80),
  ('EMP007', 'Profitabilitas', 76),
  ('EMP007', 'Retensi Pelanggan', 88),
  ('EMP007', 'Pelanggan Baru', 82),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 80),
  ('EMP008', 'Profitabilitas', 84),
  ('EMP008', 'Retensi Pelanggan', 75),
  ('EMP008', 'Pelanggan Baru', 72),
  ('EMP008', 'Efektivitas Biaya', 16),
  ('EMP009', 'Target Omset', 70),
  ('EMP009', 'Profitabilitas', 78),
  ('EMP009', 'Retensi Pelanggan', 83),
  ('EMP009', 'Pelanggan Baru', 87),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset', 81),
  ('EMP010', 'Profitabilitas', 78),
  ('EMP010', 'Retensi Pelanggan', 85),
  ('EMP010', 'Pelanggan Baru', 79),
  ('EMP010', 'Efektivitas Biaya', 13)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-01 (Juara: Budi Santoso)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-01', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP001', 57.68025937, 0.12256854, 1),
  ('EMP003', 47.71513399, 0.10139299, 2),
  ('EMP004', 47.51355742, 0.10096465, 3),
  ('EMP007', 46.93652042, 0.09973847, 4),
  ('EMP006', 46.48805278, 0.09878549, 5),
  ('EMP010', 46.28562926, 0.09835535, 6),
  ('EMP009', 45.60089661, 0.09690031, 7),
  ('EMP002', 45.10357737, 0.09584353, 8),
  ('EMP008', 44.52829175, 0.09462107, 9),
  ('EMP005', 42.74404794, 0.09082961, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-02
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-02', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 83),
  ('EMP001', 'Profitabilitas', 80),
  ('EMP001', 'Retensi Pelanggan', 89),
  ('EMP001', 'Pelanggan Baru', 80),
  ('EMP001', 'Efektivitas Biaya', 13),
  ('EMP002', 'Target Omset', 100),
  ('EMP002', 'Profitabilitas', 99),
  ('EMP002', 'Retensi Pelanggan', 88),
  ('EMP002', 'Pelanggan Baru', 92),
  ('EMP002', 'Efektivitas Biaya', 7),
  ('EMP003', 'Target Omset', 75),
  ('EMP003', 'Profitabilitas', 82),
  ('EMP003', 'Retensi Pelanggan', 78),
  ('EMP003', 'Pelanggan Baru', 73),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 70),
  ('EMP004', 'Profitabilitas', 78),
  ('EMP004', 'Retensi Pelanggan', 72),
  ('EMP004', 'Pelanggan Baru', 68),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 80),
  ('EMP005', 'Profitabilitas', 84),
  ('EMP005', 'Retensi Pelanggan', 85),
  ('EMP005', 'Pelanggan Baru', 88),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset', 78),
  ('EMP006', 'Profitabilitas', 75),
  ('EMP006', 'Retensi Pelanggan', 79),
  ('EMP006', 'Pelanggan Baru', 76),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset', 82),
  ('EMP007', 'Profitabilitas', 79),
  ('EMP007', 'Retensi Pelanggan', 83),
  ('EMP007', 'Pelanggan Baru', 85),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Profitabilitas', 73),
  ('EMP008', 'Retensi Pelanggan', 74),
  ('EMP008', 'Pelanggan Baru', 70),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset', 85),
  ('EMP009', 'Profitabilitas', 88),
  ('EMP009', 'Retensi Pelanggan', 87),
  ('EMP009', 'Pelanggan Baru', 91),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset', 74),
  ('EMP010', 'Profitabilitas', 76),
  ('EMP010', 'Retensi Pelanggan', 80),
  ('EMP010', 'Pelanggan Baru', 77),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-02 (Juara: Siti Rahayu)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-02', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP002', 57.00321741, 0.12245507, 1),
  ('EMP009', 51.05939043, 0.10968647, 2),
  ('EMP005', 48.20025733, 0.10354444, 3),
  ('EMP001', 47.48129298, 0.10199995, 4),
  ('EMP007', 47.13093616, 0.10124731, 5),
  ('EMP003', 44.41115338, 0.09540463, 6),
  ('EMP006', 44.10945308, 0.09475652, 7),
  ('EMP010', 43.61991142, 0.09370488, 8),
  ('EMP008', 41.40069662, 0.08893753, 9),
  ('EMP004', 41.08679778, 0.08826321, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-03
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-03', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 79),
  ('EMP001', 'Profitabilitas', 78),
  ('EMP001', 'Retensi Pelanggan', 87),
  ('EMP001', 'Pelanggan Baru', 77),
  ('EMP001', 'Efektivitas Biaya', 12),
  ('EMP002', 'Target Omset', 76),
  ('EMP002', 'Profitabilitas', 79),
  ('EMP002', 'Retensi Pelanggan', 78),
  ('EMP002', 'Pelanggan Baru', 84),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 88),
  ('EMP003', 'Profitabilitas', 91),
  ('EMP003', 'Retensi Pelanggan', 82),
  ('EMP003', 'Pelanggan Baru', 80),
  ('EMP003', 'Efektivitas Biaya', 11),
  ('EMP004', 'Target Omset', 79),
  ('EMP004', 'Profitabilitas', 76),
  ('EMP004', 'Retensi Pelanggan', 79),
  ('EMP004', 'Pelanggan Baru', 72),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset', 68),
  ('EMP005', 'Profitabilitas', 70),
  ('EMP005', 'Retensi Pelanggan', 72),
  ('EMP005', 'Pelanggan Baru', 76),
  ('EMP005', 'Efektivitas Biaya', 14),
  ('EMP006', 'Target Omset', 82),
  ('EMP006', 'Profitabilitas', 85),
  ('EMP006', 'Retensi Pelanggan', 80),
  ('EMP006', 'Pelanggan Baru', 77),
  ('EMP006', 'Efektivitas Biaya', 13),
  ('EMP007', 'Target Omset', 70),
  ('EMP007', 'Profitabilitas', 72),
  ('EMP007', 'Retensi Pelanggan', 85),
  ('EMP007', 'Pelanggan Baru', 80),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset', 100),
  ('EMP008', 'Profitabilitas', 100),
  ('EMP008', 'Retensi Pelanggan', 91),
  ('EMP008', 'Pelanggan Baru', 85),
  ('EMP008', 'Efektivitas Biaya', 5),
  ('EMP009', 'Target Omset', 72),
  ('EMP009', 'Profitabilitas', 75),
  ('EMP009', 'Retensi Pelanggan', 78),
  ('EMP009', 'Pelanggan Baru', 79),
  ('EMP009', 'Efektivitas Biaya', 11),
  ('EMP010', 'Target Omset', 80),
  ('EMP010', 'Profitabilitas', 82),
  ('EMP010', 'Retensi Pelanggan', 83),
  ('EMP010', 'Pelanggan Baru', 81),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-03 (Juara: Rina Wati)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-03', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP008', 58.52773323, 0.12608318, 1),
  ('EMP003', 49.90003753, 0.10749699, 2),
  ('EMP006', 46.77422359, 0.10076322, 3),
  ('EMP010', 46.30585447, 0.09975423, 4),
  ('EMP001', 46.24304018, 0.09961892, 5),
  ('EMP002', 44.45978996, 0.09577736, 6),
  ('EMP004', 44.16121289, 0.09513415, 7),
  ('EMP009', 43.81573020, 0.09438989, 8),
  ('EMP007', 43.44706015, 0.09359569, 9),
  ('EMP005', 40.56470303, 0.08738638, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-04
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-04', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 78),
  ('EMP001', 'Profitabilitas', 74),
  ('EMP001', 'Retensi Pelanggan', 81),
  ('EMP001', 'Pelanggan Baru', 76),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset', 84),
  ('EMP002', 'Profitabilitas', 87),
  ('EMP002', 'Retensi Pelanggan', 83),
  ('EMP002', 'Pelanggan Baru', 88),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset', 70),
  ('EMP003', 'Profitabilitas', 73),
  ('EMP003', 'Retensi Pelanggan', 76),
  ('EMP003', 'Pelanggan Baru', 72),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 77),
  ('EMP004', 'Profitabilitas', 79),
  ('EMP004', 'Retensi Pelanggan', 81),
  ('EMP004', 'Pelanggan Baru', 74),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset', 100),
  ('EMP005', 'Profitabilitas', 100),
  ('EMP005', 'Retensi Pelanggan', 90),
  ('EMP005', 'Pelanggan Baru', 94),
  ('EMP005', 'Efektivitas Biaya', 6),
  ('EMP006', 'Target Omset', 74),
  ('EMP006', 'Profitabilitas', 76),
  ('EMP006', 'Retensi Pelanggan', 79),
  ('EMP006', 'Pelanggan Baru', 73),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset', 86),
  ('EMP007', 'Profitabilitas', 89),
  ('EMP007', 'Retensi Pelanggan', 85),
  ('EMP007', 'Pelanggan Baru', 90),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Profitabilitas', 75),
  ('EMP008', 'Retensi Pelanggan', 73),
  ('EMP008', 'Pelanggan Baru', 70),
  ('EMP008', 'Efektivitas Biaya', 12),
  ('EMP009', 'Target Omset', 83),
  ('EMP009', 'Profitabilitas', 86),
  ('EMP009', 'Retensi Pelanggan', 87),
  ('EMP009', 'Pelanggan Baru', 91),
  ('EMP009', 'Efektivitas Biaya', 10),
  ('EMP010', 'Target Omset', 80),
  ('EMP010', 'Profitabilitas', 83),
  ('EMP010', 'Retensi Pelanggan', 85),
  ('EMP010', 'Pelanggan Baru', 85),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-04 (Juara: Rudi Hartono)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-04', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP005', 58.26523668, 0.12394009, 1),
  ('EMP007', 50.29482428, 0.10698566, 2),
  ('EMP009', 49.92280355, 0.10619431, 3),
  ('EMP002', 48.57758982, 0.10333281, 4),
  ('EMP010', 46.93997519, 0.09984933, 5),
  ('EMP004', 44.55457595, 0.09477517, 6),
  ('EMP001', 44.18102790, 0.09398057, 7),
  ('EMP006', 43.22914504, 0.09195576, 8),
  ('EMP008', 42.31570877, 0.09001272, 9),
  ('EMP003', 41.82719750, 0.08897358, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-05
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-05', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 88),
  ('EMP001', 'Profitabilitas', 92),
  ('EMP001', 'Retensi Pelanggan', 93),
  ('EMP001', 'Pelanggan Baru', 85),
  ('EMP001', 'Efektivitas Biaya', 11),
  ('EMP002', 'Target Omset', 78),
  ('EMP002', 'Profitabilitas', 81),
  ('EMP002', 'Retensi Pelanggan', 79),
  ('EMP002', 'Pelanggan Baru', 85),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset', 100),
  ('EMP003', 'Profitabilitas', 100),
  ('EMP003', 'Retensi Pelanggan', 80),
  ('EMP003', 'Pelanggan Baru', 84),
  ('EMP003', 'Efektivitas Biaya', 6),
  ('EMP004', 'Target Omset', 73),
  ('EMP004', 'Profitabilitas', 76),
  ('EMP004', 'Retensi Pelanggan', 78),
  ('EMP004', 'Pelanggan Baru', 74),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 67),
  ('EMP005', 'Profitabilitas', 70),
  ('EMP005', 'Retensi Pelanggan', 72),
  ('EMP005', 'Pelanggan Baru', 78),
  ('EMP005', 'Efektivitas Biaya', 14),
  ('EMP006', 'Target Omset', 84),
  ('EMP006', 'Profitabilitas', 88),
  ('EMP006', 'Retensi Pelanggan', 85),
  ('EMP006', 'Pelanggan Baru', 80),
  ('EMP006', 'Efektivitas Biaya', 12),
  ('EMP007', 'Target Omset', 74),
  ('EMP007', 'Profitabilitas', 77),
  ('EMP007', 'Retensi Pelanggan', 80),
  ('EMP007', 'Pelanggan Baru', 80),
  ('EMP007', 'Efektivitas Biaya', 13),
  ('EMP008', 'Target Omset', 81),
  ('EMP008', 'Profitabilitas', 84),
  ('EMP008', 'Retensi Pelanggan', 82),
  ('EMP008', 'Pelanggan Baru', 78),
  ('EMP008', 'Efektivitas Biaya', 11),
  ('EMP009', 'Target Omset', 71),
  ('EMP009', 'Profitabilitas', 74),
  ('EMP009', 'Retensi Pelanggan', 82),
  ('EMP009', 'Pelanggan Baru', 87),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset', 79),
  ('EMP010', 'Profitabilitas', 82),
  ('EMP010', 'Retensi Pelanggan', 84),
  ('EMP010', 'Pelanggan Baru', 80),
  ('EMP010', 'Efektivitas Biaya', 12)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-05 (Juara: Andi Wijaya)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-05', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP003', 56.14638383, 0.12002692, 1),
  ('EMP001', 51.67905930, 0.11047690, 2),
  ('EMP006', 48.69063488, 0.10408839, 3),
  ('EMP008', 47.36605981, 0.10125678, 4),
  ('EMP010', 46.71327853, 0.09986130, 5),
  ('EMP002', 45.84852724, 0.09801268, 6),
  ('EMP007', 44.22752054, 0.09454737, 7),
  ('EMP009', 44.09957430, 0.09427385, 8),
  ('EMP004', 42.52876978, 0.09091587, 9),
  ('EMP005', 40.48179651, 0.08653995, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-06
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 80),
  ('EMP001', 'Profitabilitas', 76),
  ('EMP001', 'Retensi Pelanggan', 82),
  ('EMP001', 'Pelanggan Baru', 77),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset', 70),
  ('EMP002', 'Profitabilitas', 73),
  ('EMP002', 'Retensi Pelanggan', 74),
  ('EMP002', 'Pelanggan Baru', 76),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 84),
  ('EMP003', 'Profitabilitas', 87),
  ('EMP003', 'Retensi Pelanggan', 83),
  ('EMP003', 'Pelanggan Baru', 81),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 77),
  ('EMP004', 'Profitabilitas', 79),
  ('EMP004', 'Retensi Pelanggan', 80),
  ('EMP004', 'Pelanggan Baru', 73),
  ('EMP004', 'Efektivitas Biaya', 17),
  ('EMP005', 'Target Omset', 82),
  ('EMP005', 'Profitabilitas', 84),
  ('EMP005', 'Retensi Pelanggan', 86),
  ('EMP005', 'Pelanggan Baru', 87),
  ('EMP005', 'Efektivitas Biaya', 12),
  ('EMP006', 'Target Omset', 100),
  ('EMP006', 'Profitabilitas', 100),
  ('EMP006', 'Retensi Pelanggan', 91),
  ('EMP006', 'Pelanggan Baru', 85),
  ('EMP006', 'Efektivitas Biaya', 5),
  ('EMP007', 'Target Omset', 83),
  ('EMP007', 'Profitabilitas', 85),
  ('EMP007', 'Retensi Pelanggan', 87),
  ('EMP007', 'Pelanggan Baru', 85),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Profitabilitas', 74),
  ('EMP008', 'Retensi Pelanggan', 76),
  ('EMP008', 'Pelanggan Baru', 71),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset', 74),
  ('EMP009', 'Profitabilitas', 75),
  ('EMP009', 'Retensi Pelanggan', 79),
  ('EMP009', 'Pelanggan Baru', 82),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset', 87),
  ('EMP010', 'Profitabilitas', 90),
  ('EMP010', 'Retensi Pelanggan', 88),
  ('EMP010', 'Pelanggan Baru', 86),
  ('EMP010', 'Efektivitas Biaya', 10)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- Hasil WP: 2025-06 (Juara: Maya Putri)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-06', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP006', 58.52773323, 0.12419545, 1),
  ('EMP010', 51.09510540, 0.10842347, 2),
  ('EMP007', 48.99072745, 0.10395799, 3),
  ('EMP005', 48.32827361, 0.10255227, 4),
  ('EMP003', 48.08883431, 0.10204418, 5),
  ('EMP001', 45.05325930, 0.09560271, 6),
  ('EMP009', 44.24515420, 0.09388792, 7),
  ('EMP004', 43.68753556, 0.09270465, 8),
  ('EMP008', 41.83288477, 0.08876910, 9),
  ('EMP002', 41.40553661, 0.08786227, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Selesai. Buka Riwayat → pilih periode → lihat ranking 10 sales per bulan.