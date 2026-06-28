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
-- Nilai Sales: 2026-01
-- Juara: Budi Santoso (EMP001)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-01', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      96),
  ('EMP001', 'Pelanggan Baru',    91),
  ('EMP001', 'Efektivitas Biaya', 7),
  ('EMP002', 'Target Omset',      78),
  ('EMP002', 'Pelanggan Baru',    85),
  ('EMP002', 'Efektivitas Biaya', 14),
  ('EMP003', 'Target Omset',      82),
  ('EMP003', 'Pelanggan Baru',    75),
  ('EMP003', 'Efektivitas Biaya', 12),
  ('EMP004', 'Target Omset',      80),
  ('EMP004', 'Pelanggan Baru',    70),
  ('EMP004', 'Efektivitas Biaya', 16),
  ('EMP005', 'Target Omset',      70),
  ('EMP005', 'Pelanggan Baru',    88),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset',      83),
  ('EMP006', 'Pelanggan Baru',    77),
  ('EMP006', 'Efektivitas Biaya', 15),
  ('EMP007', 'Target Omset',      79),
  ('EMP007', 'Pelanggan Baru',    81),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset',      76),
  ('EMP008', 'Pelanggan Baru',    72),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset',      72),
  ('EMP009', 'Pelanggan Baru',    83),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset',      81),
  ('EMP010', 'Pelanggan Baru',    78),
  ('EMP010', 'Efektivitas Biaya', 13)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-01', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP001', 47.47960548, 0.12314868, 1),
  ('EMP007', 38.80832638, 0.10065783, 2),
  ('EMP003', 38.58708273, 0.10008398, 3),
  ('EMP010', 38.35568232, 0.09948380, 4),
  ('EMP006', 38.23709044, 0.09917620, 5),
  ('EMP002', 38.00009229, 0.09856150, 6),
  ('EMP009', 37.62020401, 0.09757617, 7),
  ('EMP005', 36.73410069, 0.09527787, 8),
  ('EMP004', 36.19010408, 0.09386690, 9),
  ('EMP008', 35.53473753, 0.09216706, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-02
-- Juara: Siti Rahayu (EMP002)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-02', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      83),
  ('EMP001', 'Pelanggan Baru',    80),
  ('EMP001', 'Efektivitas Biaya', 13),
  ('EMP002', 'Target Omset',      97),
  ('EMP002', 'Pelanggan Baru',    93),
  ('EMP002', 'Efektivitas Biaya', 6),
  ('EMP003', 'Target Omset',      74),
  ('EMP003', 'Pelanggan Baru',    72),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset',      70),
  ('EMP004', 'Pelanggan Baru',    68),
  ('EMP004', 'Efektivitas Biaya', 15),
  ('EMP005', 'Target Omset',      80),
  ('EMP005', 'Pelanggan Baru',    88),
  ('EMP005', 'Efektivitas Biaya', 11),
  ('EMP006', 'Target Omset',      76),
  ('EMP006', 'Pelanggan Baru',    76),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset',      83),
  ('EMP007', 'Pelanggan Baru',    85),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset',      70),
  ('EMP008', 'Pelanggan Baru',    69),
  ('EMP008', 'Efektivitas Biaya', 15),
  ('EMP009', 'Target Omset',      84),
  ('EMP009', 'Pelanggan Baru',    90),
  ('EMP009', 'Efektivitas Biaya', 9),
  ('EMP010', 'Target Omset',      74),
  ('EMP010', 'Pelanggan Baru',    77),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-02', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP002', 48.85584451, 0.12697504, 1),
  ('EMP009', 42.36199231, 0.11009769, 2),
  ('EMP007', 40.17552494, 0.10441512, 3),
  ('EMP005', 39.97406502, 0.10389153, 4),
  ('EMP001', 39.21072963, 0.10190765, 5),
  ('EMP006', 36.30427596, 0.09435385, 6),
  ('EMP010', 35.81856528, 0.09309150, 7),
  ('EMP003', 35.47394308, 0.09219584, 8),
  ('EMP008', 33.35961260, 0.08670075, 9),
  ('EMP004', 33.23274476, 0.08637102, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-03
-- Juara: Rina Wati (EMP008)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-03', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      79),
  ('EMP001', 'Pelanggan Baru',    77),
  ('EMP001', 'Efektivitas Biaya', 12),
  ('EMP002', 'Target Omset',      74),
  ('EMP002', 'Pelanggan Baru',    83),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset',      85),
  ('EMP003', 'Pelanggan Baru',    79),
  ('EMP003', 'Efektivitas Biaya', 11),
  ('EMP004', 'Target Omset',      78),
  ('EMP004', 'Pelanggan Baru',    71),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset',      67),
  ('EMP005', 'Pelanggan Baru',    75),
  ('EMP005', 'Efektivitas Biaya', 14),
  ('EMP006', 'Target Omset',      80),
  ('EMP006', 'Pelanggan Baru',    76),
  ('EMP006', 'Efektivitas Biaya', 13),
  ('EMP007', 'Target Omset',      71),
  ('EMP007', 'Pelanggan Baru',    79),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset',      95),
  ('EMP008', 'Pelanggan Baru',    90),
  ('EMP008', 'Efektivitas Biaya', 6),
  ('EMP009', 'Target Omset',      72),
  ('EMP009', 'Pelanggan Baru',    78),
  ('EMP009', 'Efektivitas Biaya', 11),
  ('EMP010', 'Target Omset',      80),
  ('EMP010', 'Pelanggan Baru',    80),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-03', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP008', 47.80488795, 0.12586667, 1),
  ('EMP003', 40.38454797, 0.10632947, 2),
  ('EMP010', 38.00781264, 0.10007171, 3),
  ('EMP001', 37.94711959, 0.09991191, 4),
  ('EMP006', 37.79812997, 0.09951963, 5),
  ('EMP002', 36.26080048, 0.09547196, 6),
  ('EMP004', 36.25640511, 0.09546038, 7),
  ('EMP009', 36.23602386, 0.09540672, 8),
  ('EMP007', 35.70540746, 0.09400965, 9),
  ('EMP005', 33.40463787, 0.08795190, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-04
-- Juara: Rudi Hartono (EMP005)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-04', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      77),
  ('EMP001', 'Pelanggan Baru',    75),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset',      84),
  ('EMP002', 'Pelanggan Baru',    88),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset',      71),
  ('EMP003', 'Pelanggan Baru',    71),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset',      77),
  ('EMP004', 'Pelanggan Baru',    73),
  ('EMP004', 'Efektivitas Biaya', 14),
  ('EMP005', 'Target Omset',      96),
  ('EMP005', 'Pelanggan Baru',    95),
  ('EMP005', 'Efektivitas Biaya', 6),
  ('EMP006', 'Target Omset',      73),
  ('EMP006', 'Pelanggan Baru',    72),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset',      86),
  ('EMP007', 'Pelanggan Baru',    89),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset',      71),
  ('EMP008', 'Pelanggan Baru',    69),
  ('EMP008', 'Efektivitas Biaya', 12),
  ('EMP009', 'Target Omset',      83),
  ('EMP009', 'Pelanggan Baru',    90),
  ('EMP009', 'Efektivitas Biaya', 10),
  ('EMP010', 'Target Omset',      80),
  ('EMP010', 'Pelanggan Baru',    84),
  ('EMP010', 'Efektivitas Biaya', 14)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-04', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP005', 48.80670838, 0.12584061, 1),
  ('EMP007', 41.97016598, 0.10821364, 2),
  ('EMP009', 41.57514068, 0.10719512, 3),
  ('EMP002', 40.50426634, 0.10443404, 4),
  ('EMP010', 38.49490779, 0.09925322, 5),
  ('EMP001', 36.47959827, 0.09405705, 6),
  ('EMP004', 36.22315913, 0.09339586, 7),
  ('EMP006', 34.89454825, 0.08997024, 8),
  ('EMP008', 34.46616282, 0.08886571, 9),
  ('EMP003', 34.43078848, 0.08877451, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-05
-- Juara: Andi Wijaya (EMP003)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-05', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      84),
  ('EMP001', 'Pelanggan Baru',    84),
  ('EMP001', 'Efektivitas Biaya', 11),
  ('EMP002', 'Target Omset',      78),
  ('EMP002', 'Pelanggan Baru',    87),
  ('EMP002', 'Efektivitas Biaya', 13),
  ('EMP003', 'Target Omset',      95),
  ('EMP003', 'Pelanggan Baru',    88),
  ('EMP003', 'Efektivitas Biaya', 7),
  ('EMP004', 'Target Omset',      73),
  ('EMP004', 'Pelanggan Baru',    73),
  ('EMP004', 'Efektivitas Biaya', 15),
  ('EMP005', 'Target Omset',      68),
  ('EMP005', 'Pelanggan Baru',    77),
  ('EMP005', 'Efektivitas Biaya', 13),
  ('EMP006', 'Target Omset',      83),
  ('EMP006', 'Pelanggan Baru',    79),
  ('EMP006', 'Efektivitas Biaya', 12),
  ('EMP007', 'Target Omset',      75),
  ('EMP007', 'Pelanggan Baru',    80),
  ('EMP007', 'Efektivitas Biaya', 12),
  ('EMP008', 'Target Omset',      80),
  ('EMP008', 'Pelanggan Baru',    78),
  ('EMP008', 'Efektivitas Biaya', 11),
  ('EMP009', 'Target Omset',      71),
  ('EMP009', 'Pelanggan Baru',    86),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset',      80),
  ('EMP010', 'Pelanggan Baru',    79),
  ('EMP010', 'Efektivitas Biaya', 12)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-05', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP003', 46.75506093, 0.12136175, 1),
  ('EMP001', 40.73034204, 0.10572343, 2),
  ('EMP006', 39.41521421, 0.10230976, 3),
  ('EMP008', 38.73513094, 0.10054448, 4),
  ('EMP002', 38.53296368, 0.10001971, 5),
  ('EMP010', 38.50733122, 0.09995318, 6),
  ('EMP007', 37.08745687, 0.09626762, 7),
  ('EMP009', 36.50542580, 0.09475685, 8),
  ('EMP004', 34.76521852, 0.09023981, 9),
  ('EMP005', 34.21954461, 0.08882341, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- ─────────────────────────────────────────────────────────────────
-- Nilai Sales: 2026-06
-- Juara: Maya Putri (EMP006)
--   Target Omset (TO)      — makin besar makin baik, bobot 63.3%
--   Pelanggan Baru (PB)    — makin besar makin baik, bobot 26.1%
--   Efektivitas Biaya (EB) — makin kecil makin baik, bobot 10.6%
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2026-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      80),
  ('EMP001', 'Pelanggan Baru',    77),
  ('EMP001', 'Efektivitas Biaya', 14),
  ('EMP002', 'Target Omset',      69),
  ('EMP002', 'Pelanggan Baru',    67),
  ('EMP002', 'Efektivitas Biaya', 14),
  ('EMP003', 'Target Omset',      84),
  ('EMP003', 'Pelanggan Baru',    80),
  ('EMP003', 'Efektivitas Biaya', 13),
  ('EMP004', 'Target Omset',      76),
  ('EMP004', 'Pelanggan Baru',    72),
  ('EMP004', 'Efektivitas Biaya', 17),
  ('EMP005', 'Target Omset',      81),
  ('EMP005', 'Pelanggan Baru',    79),
  ('EMP005', 'Efektivitas Biaya', 10),
  ('EMP006', 'Target Omset',      97),
  ('EMP006', 'Pelanggan Baru',    92),
  ('EMP006', 'Efektivitas Biaya', 6),
  ('EMP007', 'Target Omset',      83),
  ('EMP007', 'Pelanggan Baru',    84),
  ('EMP007', 'Efektivitas Biaya', 11),
  ('EMP008', 'Target Omset',      72),
  ('EMP008', 'Pelanggan Baru',    71),
  ('EMP008', 'Efektivitas Biaya', 14),
  ('EMP009', 'Target Omset',      74),
  ('EMP009', 'Pelanggan Baru',    82),
  ('EMP009', 'Efektivitas Biaya', 12),
  ('EMP010', 'Target Omset',      86),
  ('EMP010', 'Pelanggan Baru',    86),
  ('EMP010', 'Efektivitas Biaya', 10)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name AND c.is_active = TRUE;

INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2026-06', r.s_val, r.v_val, r.rnk
FROM (VALUES
  ('EMP006', 48.71818477, 0.12573863, 1),
  ('EMP010', 42.01860360, 0.10844742, 2),
  ('EMP007', 40.42273565, 0.10432859, 3),
  ('EMP005', 39.56869141, 0.10212435, 4),
  ('EMP003', 39.50911297, 0.10197058, 5),
  ('EMP001', 37.63054162, 0.09712211, 6),
  ('EMP009', 37.01143144, 0.09552422, 7),
  ('EMP004', 35.06640140, 0.09050422, 8),
  ('EMP008', 34.46516226, 0.08895246, 9),
  ('EMP002', 33.04512707, 0.08528743, 10)
) AS r(employee_id, s_val, v_val, rnk)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- =============================================================================
-- Selesai! Jalankan di Supabase SQL Editor.
-- Hasil: 10 sales, 6 bulan (Jan–Jun 2026), juara berbeda tiap bulan:
--   Jan=Budi Santoso   Feb=Siti Rahayu  Mar=Rina Wati
--   Apr=Rudi Hartono   Mei=Andi Wijaya  Jun=Maya Putri
-- =============================================================================