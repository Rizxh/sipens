-- =============================================================================
-- SIPENS — Seed 10 Sales, 3 Kriteria (Target Omset, Pelanggan Baru, Efektivitas Biaya)
-- Periode: Jan–Jun 2025 | Juara berbeda tiap bulan
-- Generate: node scripts/generate-seed-10-sales.js
-- =============================================================================

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
DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';

-- Reset kriteria: nonaktifkan semua, aktifkan/insert 3 kriteria saja
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

-- AHP: 2025-01
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-01', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-01', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP: 2025-02
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-02', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-02', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP: 2025-03
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-03', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-03', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP: 2025-04
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-04', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-04', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP: 2025-05
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-05', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-05', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- AHP: 2025-06
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-06', a.id, b.id, v.val
FROM (VALUES
  ('Target Omset', 'Pelanggan Baru', 3),
  ('Target Omset', 'Efektivitas Biaya', 5),
  ('Pelanggan Baru', 'Efektivitas Biaya', 3)
) AS v(criteria_a, criteria_b, val)
JOIN public.criteria a ON a.name = v.criteria_a AND a.is_active = TRUE
JOIN public.criteria b ON b.name = v.criteria_b AND b.is_active = TRUE;

INSERT INTO public.ahp_weights (period, criteria_id, weight, lambda_max, ci, cr, is_consistent)
SELECT '2025-06', c.id, w.weight, 3.041, 0.0205, 0.0353, TRUE
FROM (VALUES
  ('Target Omset', 0.63300000),
  ('Pelanggan Baru', 0.26100000),
  ('Efektivitas Biaya', 0.10600000)
) AS w(name, weight)
JOIN public.criteria c ON c.name = w.name AND c.is_active = TRUE;

-- Nilai Sales: 2025-01 (Juara: Budi Santoso)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-01', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 100),
  ('EMP001', 'Pelanggan Baru', 91),
  ('EMP001', 'Efektivitas Biaya', 6),
  ('EMP002', 'Target Omset', 76),
  ('EMP002', 'Pelanggan Baru', 95),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 85),
  ('EMP003', 'Pelanggan Baru', 76),
  ('EMP003', 'Efektivitas Biaya', 12),
  ('EMP004', 'Target Omset', 88),
  ('EMP004', 'Pelanggan Baru', 70),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 68),
  ('EMP005', 'Pelanggan Baru', 90),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset', 85),
  ('EMP006', 'Pelanggan Baru', 78),
  ('EMP006', 'Efektivitas Biaya', 15),
  ('EMP007', 'Target Omset', 80),
  ('EMP007', 'Pelanggan Baru', 82),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 80),
  ('EMP008', 'Pelanggan Baru', 72),
  ('EMP008', 'Efektivitas Biaya', 16),
  ('EMP009', 'Target Omset', 70),
  ('EMP009', 'Pelanggan Baru', 87),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset', 81),
  ('EMP010', 'Pelanggan Baru', 79),
  ('EMP010', 'Efektivitas Biaya', 13)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-01', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP001', 49.52514672, 0.12614587, 1),
  ('EMP003', 39.61150246, 0.10089475, 2),
  ('EMP007', 39.24404388, 0.09995879, 3),
  ('EMP006', 38.94872073, 0.09920657, 4),
  ('EMP010', 38.48342282, 0.09802141, 5),
  ('EMP004', 38.44071011, 0.09791262, 6),
  ('EMP002', 38.20104044, 0.09730215, 7),
  ('EMP009', 37.41208206, 0.09529259, 8),
  ('EMP008', 36.45717603, 0.09286034, 9),
  ('EMP005', 36.27837386, 0.09240491, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-02 (Juara: Siti Rahayu)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-02', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 83),
  ('EMP001', 'Pelanggan Baru', 80),
  ('EMP001', 'Efektivitas Biaya', 13),
  ('EMP002', 'Target Omset', 100),
  ('EMP002', 'Pelanggan Baru', 98),
  ('EMP002', 'Efektivitas Biaya', 7),
  ('EMP003', 'Target Omset', 75),
  ('EMP003', 'Pelanggan Baru', 73),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 70),
  ('EMP004', 'Pelanggan Baru', 68),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 80),
  ('EMP005', 'Pelanggan Baru', 88),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset', 78),
  ('EMP006', 'Pelanggan Baru', 76),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset', 82),
  ('EMP007', 'Pelanggan Baru', 85),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Pelanggan Baru', 70),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset', 85),
  ('EMP009', 'Pelanggan Baru', 91),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset', 74),
  ('EMP010', 'Pelanggan Baru', 77),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-02', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP002', 49.67405496, 0.12827213, 1),
  ('EMP009', 42.80379519, 0.11053122, 2),
  ('EMP005', 39.97406502, 0.10322408, 3),
  ('EMP007', 39.86844491, 0.10295134, 4),
  ('EMP001', 39.21072963, 0.10125294, 5),
  ('EMP006', 36.90614293, 0.09530186, 6),
  ('EMP003', 35.90567131, 0.09271836, 7),
  ('EMP010', 35.81856528, 0.09249343, 8),
  ('EMP008', 34.08759688, 0.08802359, 9),
  ('EMP004', 33.00617267, 0.08523106, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-03 (Juara: Rina Wati)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-03', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 79),
  ('EMP001', 'Pelanggan Baru', 77),
  ('EMP001', 'Efektivitas Biaya', 12),
  ('EMP002', 'Target Omset', 76),
  ('EMP002', 'Pelanggan Baru', 84),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 88),
  ('EMP003', 'Pelanggan Baru', 80),
  ('EMP003', 'Efektivitas Biaya', 11),
  ('EMP004', 'Target Omset', 79),
  ('EMP004', 'Pelanggan Baru', 72),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset', 68),
  ('EMP005', 'Pelanggan Baru', 76),
  ('EMP005', 'Efektivitas Biaya', 14),
  ('EMP006', 'Target Omset', 82),
  ('EMP006', 'Pelanggan Baru', 77),
  ('EMP006', 'Efektivitas Biaya', 13),
  ('EMP007', 'Target Omset', 70),
  ('EMP007', 'Pelanggan Baru', 80),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset', 100),
  ('EMP008', 'Pelanggan Baru', 91),
  ('EMP008', 'Efektivitas Biaya', 5),
  ('EMP009', 'Target Omset', 72),
  ('EMP009', 'Pelanggan Baru', 79),
  ('EMP009', 'Efektivitas Biaya', 11),
  ('EMP010', 'Target Omset', 80),
  ('EMP010', 'Pelanggan Baru', 81),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-03', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP008', 50.49158255, 0.13084647, 1),
  ('EMP003', 41.41678595, 0.10732958, 2),
  ('EMP006', 38.52478756, 0.09983511, 3),
  ('EMP010', 38.13124452, 0.09881526, 4),
  ('EMP001', 37.94711959, 0.09833811, 5),
  ('EMP002', 36.99356829, 0.09586703, 6),
  ('EMP004', 36.68361768, 0.09506380, 7),
  ('EMP009', 36.35670501, 0.09421663, 8),
  ('EMP007', 35.50261426, 0.09200329, 9),
  ('EMP005', 33.83614813, 0.08768473, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-04 (Juara: Rudi Hartono)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-04', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 78),
  ('EMP001', 'Pelanggan Baru', 76),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset', 84),
  ('EMP002', 'Pelanggan Baru', 88),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset', 70),
  ('EMP003', 'Pelanggan Baru', 72),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 77),
  ('EMP004', 'Pelanggan Baru', 74),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset', 100),
  ('EMP005', 'Pelanggan Baru', 100),
  ('EMP005', 'Efektivitas Biaya', 6),
  ('EMP006', 'Target Omset', 74),
  ('EMP006', 'Pelanggan Baru', 73),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset', 86),
  ('EMP007', 'Pelanggan Baru', 90),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Pelanggan Baru', 70),
  ('EMP008', 'Efektivitas Biaya', 12),
  ('EMP009', 'Target Omset', 83),
  ('EMP009', 'Pelanggan Baru', 91),
  ('EMP009', 'Efektivitas Biaya', 10),
  ('EMP010', 'Target Omset', 80),
  ('EMP010', 'Pelanggan Baru', 85),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-04', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP005', 50.75934011, 0.12968717, 1),
  ('EMP007', 42.09273934, 0.10754450, 2),
  ('EMP009', 41.69521675, 0.10652886, 3),
  ('EMP002', 40.50426634, 0.10348605, 4),
  ('EMP010', 38.61399443, 0.09865651, 5),
  ('EMP001', 36.90614293, 0.09429305, 6),
  ('EMP004', 36.35201895, 0.09287730, 7),
  ('EMP006', 35.32330842, 0.09024900, 8),
  ('EMP008', 34.90348939, 0.08917639, 9),
  ('EMP003', 34.24781316, 0.08750117, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-05 (Juara: Andi Wijaya)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-05', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 88),
  ('EMP001', 'Pelanggan Baru', 85),
  ('EMP001', 'Efektivitas Biaya', 11),
  ('EMP002', 'Target Omset', 78),
  ('EMP002', 'Pelanggan Baru', 85),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset', 100),
  ('EMP003', 'Pelanggan Baru', 90),
  ('EMP003', 'Efektivitas Biaya', 6),
  ('EMP004', 'Target Omset', 73),
  ('EMP004', 'Pelanggan Baru', 74),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset', 67),
  ('EMP005', 'Pelanggan Baru', 78),
  ('EMP005', 'Efektivitas Biaya', 14),
  ('EMP006', 'Target Omset', 84),
  ('EMP006', 'Pelanggan Baru', 80),
  ('EMP006', 'Efektivitas Biaya', 12),
  ('EMP007', 'Target Omset', 74),
  ('EMP007', 'Pelanggan Baru', 80),
  ('EMP007', 'Efektivitas Biaya', 13),
  ('EMP008', 'Target Omset', 81),
  ('EMP008', 'Pelanggan Baru', 78),
  ('EMP008', 'Efektivitas Biaya', 11),
  ('EMP009', 'Target Omset', 71),
  ('EMP009', 'Pelanggan Baru', 87),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset', 79),
  ('EMP010', 'Pelanggan Baru', 80),
  ('EMP010', 'Efektivitas Biaya', 12)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-05', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP003', 49.38252161, 0.12712645, 1),
  ('EMP001', 42.07733702, 0.10832056, 2),
  ('EMP006', 39.84575521, 0.10257576, 3),
  ('EMP008', 39.04092363, 0.10050386, 4),
  ('EMP010', 38.32756451, 0.09866745, 5),
  ('EMP002', 38.29977545, 0.09859591, 6),
  ('EMP009', 36.61574270, 0.09426067, 7),
  ('EMP007', 36.46298089, 0.09386741, 8),
  ('EMP004', 34.65102861, 0.08920286, 9),
  ('EMP005', 33.74834418, 0.08687906, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Nilai Sales: 2025-06 (Juara: Maya Putri)
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 80),
  ('EMP001', 'Pelanggan Baru', 77),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset', 70),
  ('EMP002', 'Pelanggan Baru', 76),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset', 84),
  ('EMP003', 'Pelanggan Baru', 81),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset', 77),
  ('EMP004', 'Pelanggan Baru', 73),
  ('EMP004', 'Efektivitas Biaya', 17),
  ('EMP005', 'Target Omset', 82),
  ('EMP005', 'Pelanggan Baru', 87),
  ('EMP005', 'Efektivitas Biaya', 12),
  ('EMP006', 'Target Omset', 100),
  ('EMP006', 'Pelanggan Baru', 91),
  ('EMP006', 'Efektivitas Biaya', 5),
  ('EMP007', 'Target Omset', 83),
  ('EMP007', 'Pelanggan Baru', 85),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset', 72),
  ('EMP008', 'Pelanggan Baru', 71),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset', 74),
  ('EMP009', 'Pelanggan Baru', 82),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset', 87),
  ('EMP010', 'Pelanggan Baru', 86),
  ('EMP010', 'Efektivitas Biaya', 10)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-06', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP006', 50.49158255, 0.12891420, 1),
  ('EMP010', 42.32722363, 0.10806911, 2),
  ('EMP007', 40.54778616, 0.10352588, 3),
  ('EMP005', 40.11118398, 0.10241116, 4),
  ('EMP003', 39.63742038, 0.10120155, 5),
  ('EMP001', 37.63054162, 0.09607762, 6),
  ('EMP009', 37.01143144, 0.09449692, 7),
  ('EMP004', 35.48528600, 0.09060040, 8),
  ('EMP008', 34.21402952, 0.08735465, 9),
  ('EMP002', 34.21162740, 0.08734851, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Selesai! Buka Riwayat → lihat 10 sales per bulan (Jan–Jun 2025), juara berbeda tiap bulan.
-- Jan=Budi, Feb=Siti, Mar=Rina, Apr=Rudi, Mei=Andi, Jun=Maya