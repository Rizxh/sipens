-- =============================================================================
-- SIPENS — Seed 30 Sales + Data Penilaian Lengkap
-- Periode: 2025-06
-- Jalankan SETELAH schema.sql (+ fix-rls-recursion.sql jika perlu)
-- Generate: node scripts/generate-seed-30-sales.js
-- =============================================================================

DELETE FROM public.wp_results WHERE period = '2025-06';
DELETE FROM public.sales_scores WHERE period = '2025-06';
DELETE FROM public.ahp_weights WHERE period = '2025-06';
DELETE FROM public.ahp_comparisons WHERE period = '2025-06';

-- Hapus sales seed lama (EMP001-EMP030) agar idempotent
DELETE FROM public.sales WHERE employee_id LIKE 'EMP%';

-- -----------------------------------------------------------------------------
-- 30 Sales
-- -----------------------------------------------------------------------------
INSERT INTO public.sales (name, employee_id) VALUES
  ('Budi Santoso', 'EMP001'),
  ('Siti Rahayu', 'EMP002'),
  ('Andi Wijaya', 'EMP003'),
  ('Dewi Lestari', 'EMP004'),
  ('Rizky Pratama', 'EMP005'),
  ('Maya Sari', 'EMP006'),
  ('Agus Hidayat', 'EMP007'),
  ('Rina Kusuma', 'EMP008'),
  ('Hendra Saputra', 'EMP009'),
  ('Fitri Anggraini', 'EMP010'),
  ('Bambang Nugroho', 'EMP011'),
  ('Lestari Permata', 'EMP012'),
  ('Eko Setiawan', 'EMP013'),
  ('Putri Maharani', 'EMP014'),
  ('Joko Susanto', 'EMP015'),
  ('Ani Santoso', 'EMP016'),
  ('Doni Rahayu', 'EMP017'),
  ('Sari Wijaya', 'EMP018'),
  ('Yoga Lestari', 'EMP019'),
  ('Nina Pratama', 'EMP020'),
  ('Fajar Sari', 'EMP021'),
  ('Wulan Hidayat', 'EMP022'),
  ('Rudi Kusuma', 'EMP023'),
  ('Citra Saputra', 'EMP024'),
  ('Bayu Anggraini', 'EMP025'),
  ('Dian Nugroho', 'EMP026'),
  ('Galih Permata', 'EMP027'),
  ('Ayu Setiawan', 'EMP028'),
  ('Dimas Maharani', 'EMP029'),
  ('Melati Susanto', 'EMP030')
ON CONFLICT (employee_id) DO UPDATE SET name = EXCLUDED.name, is_active = TRUE;

-- AHP comparisons
INSERT INTO public.ahp_comparisons (period, criteria_a_id, criteria_b_id, value)
SELECT '2025-06', a.id, b.id, v.val
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
SELECT '2025-06', c.id, w.weight, 5.118, 0.0295, 0.0263, TRUE
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
SELECT s.id, c.id, '2025-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset', 96),
  ('EMP001', 'Profitabilitas', 92),
  ('EMP001', 'Retensi Pelanggan', 81),
  ('EMP001', 'Pelanggan Baru', 81),
  ('EMP001', 'Efektivitas Biaya', 16),
  ('EMP002', 'Target Omset', 83),
  ('EMP002', 'Profitabilitas', 57),
  ('EMP002', 'Retensi Pelanggan', 60),
  ('EMP002', 'Pelanggan Baru', 56),
  ('EMP002', 'Efektivitas Biaya', 20),
  ('EMP003', 'Target Omset', 100),
  ('EMP003', 'Profitabilitas', 69),
  ('EMP003', 'Retensi Pelanggan', 62),
  ('EMP003', 'Pelanggan Baru', 50),
  ('EMP003', 'Efektivitas Biaya', 19),
  ('EMP004', 'Target Omset', 100),
  ('EMP004', 'Profitabilitas', 73),
  ('EMP004', 'Retensi Pelanggan', 63),
  ('EMP004', 'Pelanggan Baru', 86),
  ('EMP004', 'Efektivitas Biaya', 9),
  ('EMP005', 'Target Omset', 100),
  ('EMP005', 'Profitabilitas', 87),
  ('EMP005', 'Retensi Pelanggan', 55),
  ('EMP005', 'Pelanggan Baru', 59),
  ('EMP005', 'Efektivitas Biaya', 16),
  ('EMP006', 'Target Omset', 70),
  ('EMP006', 'Profitabilitas', 75),
  ('EMP006', 'Retensi Pelanggan', 85),
  ('EMP006', 'Pelanggan Baru', 55),
  ('EMP006', 'Efektivitas Biaya', 14),
  ('EMP007', 'Target Omset', 77),
  ('EMP007', 'Profitabilitas', 77),
  ('EMP007', 'Retensi Pelanggan', 79),
  ('EMP007', 'Pelanggan Baru', 79),
  ('EMP007', 'Efektivitas Biaya', 18),
  ('EMP008', 'Target Omset', 95),
  ('EMP008', 'Profitabilitas', 88),
  ('EMP008', 'Retensi Pelanggan', 69),
  ('EMP008', 'Pelanggan Baru', 90),
  ('EMP008', 'Efektivitas Biaya', 10),
  ('EMP009', 'Target Omset', 98),
  ('EMP009', 'Profitabilitas', 56),
  ('EMP009', 'Retensi Pelanggan', 72),
  ('EMP009', 'Pelanggan Baru', 50),
  ('EMP009', 'Efektivitas Biaya', 10),
  ('EMP010', 'Target Omset', 100),
  ('EMP010', 'Profitabilitas', 68),
  ('EMP010', 'Retensi Pelanggan', 78),
  ('EMP010', 'Pelanggan Baru', 80),
  ('EMP010', 'Efektivitas Biaya', 15),
  ('EMP011', 'Target Omset', 100),
  ('EMP011', 'Profitabilitas', 80),
  ('EMP011', 'Retensi Pelanggan', 54),
  ('EMP011', 'Pelanggan Baru', 55),
  ('EMP011', 'Efektivitas Biaya', 9),
  ('EMP012', 'Target Omset', 100),
  ('EMP012', 'Profitabilitas', 65),
  ('EMP012', 'Retensi Pelanggan', 87),
  ('EMP012', 'Pelanggan Baru', 52),
  ('EMP012', 'Efektivitas Biaya', 13),
  ('EMP013', 'Target Omset', 63),
  ('EMP013', 'Profitabilitas', 61),
  ('EMP013', 'Retensi Pelanggan', 66),
  ('EMP013', 'Pelanggan Baru', 70),
  ('EMP013', 'Efektivitas Biaya', 20),
  ('EMP014', 'Target Omset', 86),
  ('EMP014', 'Profitabilitas', 69),
  ('EMP014', 'Retensi Pelanggan', 78),
  ('EMP014', 'Pelanggan Baru', 63),
  ('EMP014', 'Efektivitas Biaya', 8),
  ('EMP015', 'Target Omset', 99),
  ('EMP015', 'Profitabilitas', 88),
  ('EMP015', 'Retensi Pelanggan', 58),
  ('EMP015', 'Pelanggan Baru', 78),
  ('EMP015', 'Efektivitas Biaya', 14),
  ('EMP016', 'Target Omset', 100),
  ('EMP016', 'Profitabilitas', 74),
  ('EMP016', 'Retensi Pelanggan', 69),
  ('EMP016', 'Pelanggan Baru', 53),
  ('EMP016', 'Efektivitas Biaya', 8),
  ('EMP017', 'Target Omset', 88),
  ('EMP017', 'Profitabilitas', 67),
  ('EMP017', 'Retensi Pelanggan', 94),
  ('EMP017', 'Pelanggan Baru', 85),
  ('EMP017', 'Efektivitas Biaya', 15),
  ('EMP018', 'Target Omset', 92),
  ('EMP018', 'Profitabilitas', 78),
  ('EMP018', 'Retensi Pelanggan', 77),
  ('EMP018', 'Pelanggan Baru', 50),
  ('EMP018', 'Efektivitas Biaya', 9),
  ('EMP019', 'Target Omset', 100),
  ('EMP019', 'Profitabilitas', 74),
  ('EMP019', 'Retensi Pelanggan', 85),
  ('EMP019', 'Pelanggan Baru', 75),
  ('EMP019', 'Efektivitas Biaya', 18),
  ('EMP020', 'Target Omset', 76),
  ('EMP020', 'Profitabilitas', 73),
  ('EMP020', 'Retensi Pelanggan', 53),
  ('EMP020', 'Pelanggan Baru', 90),
  ('EMP020', 'Efektivitas Biaya', 12),
  ('EMP021', 'Target Omset', 100),
  ('EMP021', 'Profitabilitas', 58),
  ('EMP021', 'Retensi Pelanggan', 54),
  ('EMP021', 'Pelanggan Baru', 70),
  ('EMP021', 'Efektivitas Biaya', 13),
  ('EMP022', 'Target Omset', 94),
  ('EMP022', 'Profitabilitas', 93),
  ('EMP022', 'Retensi Pelanggan', 92),
  ('EMP022', 'Pelanggan Baru', 74),
  ('EMP022', 'Efektivitas Biaya', 15),
  ('EMP023', 'Target Omset', 92),
  ('EMP023', 'Profitabilitas', 76),
  ('EMP023', 'Retensi Pelanggan', 60),
  ('EMP023', 'Pelanggan Baru', 52),
  ('EMP023', 'Efektivitas Biaya', 9),
  ('EMP024', 'Target Omset', 100),
  ('EMP024', 'Profitabilitas', 80),
  ('EMP024', 'Retensi Pelanggan', 60),
  ('EMP024', 'Pelanggan Baru', 79),
  ('EMP024', 'Efektivitas Biaya', 11),
  ('EMP025', 'Target Omset', 100),
  ('EMP025', 'Profitabilitas', 65),
  ('EMP025', 'Retensi Pelanggan', 53),
  ('EMP025', 'Pelanggan Baru', 70),
  ('EMP025', 'Efektivitas Biaya', 17),
  ('EMP026', 'Target Omset', 90),
  ('EMP026', 'Profitabilitas', 86),
  ('EMP026', 'Retensi Pelanggan', 92),
  ('EMP026', 'Pelanggan Baru', 50),
  ('EMP026', 'Efektivitas Biaya', 8),
  ('EMP027', 'Target Omset', 74),
  ('EMP027', 'Profitabilitas', 73),
  ('EMP027', 'Retensi Pelanggan', 61),
  ('EMP027', 'Pelanggan Baru', 82),
  ('EMP027', 'Efektivitas Biaya', 11),
  ('EMP028', 'Target Omset', 68),
  ('EMP028', 'Profitabilitas', 69),
  ('EMP028', 'Retensi Pelanggan', 52),
  ('EMP028', 'Pelanggan Baru', 85),
  ('EMP028', 'Efektivitas Biaya', 8),
  ('EMP029', 'Target Omset', 93),
  ('EMP029', 'Profitabilitas', 83),
  ('EMP029', 'Retensi Pelanggan', 59),
  ('EMP029', 'Pelanggan Baru', 83),
  ('EMP029', 'Efektivitas Biaya', 12),
  ('EMP030', 'Target Omset', 90),
  ('EMP030', 'Profitabilitas', 72),
  ('EMP030', 'Retensi Pelanggan', 81),
  ('EMP030', 'Pelanggan Baru', 80),
  ('EMP030', 'Efektivitas Biaya', 16)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- WP results (ranking 30 sales)
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-06', r.s_value, r.v_value, r.rank
FROM (VALUES
  ('EMP001', 50.022393, 0.037215, 3),
  ('EMP002', 37.345901, 0.027784, 29),
  ('EMP003', 41.677550, 0.031007, 25),
  ('EMP004', 48.088686, 0.035777, 5),
  ('EMP005', 44.597132, 0.033179, 18),
  ('EMP006', 41.414141, 0.030811, 27),
  ('EMP007', 43.522447, 0.032380, 20),
  ('EMP008', 50.222707, 0.037364, 2),
  ('EMP009', 42.607729, 0.031699, 21),
  ('EMP010', 46.901488, 0.034893, 9),
  ('EMP011', 45.181966, 0.033614, 17),
  ('EMP012', 45.484588, 0.033839, 16),
  ('EMP013', 36.092664, 0.026852, 30),
  ('EMP014', 45.591629, 0.033919, 15),
  ('EMP015', 47.097660, 0.035039, 8),
  ('EMP016', 46.749400, 0.034780, 10),
  ('EMP017', 46.698784, 0.034743, 11),
  ('EMP018', 46.233086, 0.034396, 13),
  ('EMP019', 47.635430, 0.035440, 6),
  ('EMP020', 41.461037, 0.030846, 26),
  ('EMP021', 41.718684, 0.031038, 24),
  ('EMP022', 50.759079, 0.037763, 1),
  ('EMP023', 43.932108, 0.032684, 19),
  ('EMP024', 47.450343, 0.035302, 7),
  ('EMP025', 41.848046, 0.031134, 23),
  ('EMP026', 49.148030, 0.036565, 4),
  ('EMP027', 42.047755, 0.031282, 22),
  ('EMP028', 40.177997, 0.029891, 28),
  ('EMP029', 46.479248, 0.034579, 12),
  ('EMP030', 45.945104, 0.034182, 14)
) AS r(employee_id, s_value, v_value, rank)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Sales Terbaik: Wulan Hidayat (Rank #1, V=3.78%)
