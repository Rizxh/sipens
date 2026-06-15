-- =============================================================================
-- SIPENS — Seed Data Demo (opsional)
-- Jalankan SETELAH schema.sql, untuk mengisi data penilaian contoh periode 2025-06.
--
-- Isi:
--   - Matriks perbandingan AHP (10 pasang kriteria)
--   - Bobot AHP tersimpan (CR konsisten)
--   - Nilai sales per kriteria
--   - Hasil ranking WP (Budi #1, Siti #2, Andi #3)
-- =============================================================================

-- PERIODE DEMO: 2025-06

-- Bersihkan data demo periode ini (idempotent)
DELETE FROM public.wp_results WHERE period = '2025-06';
DELETE FROM public.sales_scores WHERE period = '2025-06';
DELETE FROM public.ahp_weights WHERE period = '2025-06';
DELETE FROM public.ahp_comparisons WHERE period = '2025-06';

-- -----------------------------------------------------------------------------
-- AHP: perbandingan berpasangan (skala Saaty 1–9)
-- Urutan kriteria: Target Omset, Profitabilitas, Retensi, Pelanggan Baru, Biaya
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- AHP: bobot hasil perhitungan (eigen vector, CR ≈ 0.03)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Nilai aktual sales per kriteria
-- -----------------------------------------------------------------------------
INSERT INTO public.sales_scores (sales_id, criteria_id, period, value)
SELECT s.id, c.id, '2025-06', v.score
FROM (VALUES
  ('EMP001', 'Target Omset',      90),
  ('EMP001', 'Profitabilitas',    85),
  ('EMP001', 'Retensi Pelanggan', 88),
  ('EMP001', 'Pelanggan Baru',    75),
  ('EMP001', 'Efektivitas Biaya', 12),
  ('EMP002', 'Target Omset',      95),
  ('EMP002', 'Profitabilitas',    78),
  ('EMP002', 'Retensi Pelanggan', 80),
  ('EMP002', 'Pelanggan Baru',    90),
  ('EMP002', 'Efektivitas Biaya', 15),
  ('EMP003', 'Target Omset',      80),
  ('EMP003', 'Profitabilitas',    92),
  ('EMP003', 'Retensi Pelanggan', 85),
  ('EMP003', 'Pelanggan Baru',    70),
  ('EMP003', 'Efektivitas Biaya', 10)
) AS v(employee_id, criteria_name, score)
JOIN public.sales s ON s.employee_id = v.employee_id
JOIN public.criteria c ON c.name = v.criteria_name;

-- -----------------------------------------------------------------------------
-- Hasil WP (Weighted Product) — Budi Sales Terbaik
-- -----------------------------------------------------------------------------
INSERT INTO public.wp_results (sales_id, period, s_value, v_value, rank)
SELECT s.id, '2025-06', r.s_value, r.v_value, r.rank
FROM (VALUES
  ('EMP001', 49.410563, 0.337713, 1),
  ('EMP002', 48.589259, 0.332099, 2),
  ('EMP003', 48.309658, 0.330188, 3)
) AS r(employee_id, s_value, v_value, rank)
JOIN public.sales s ON s.employee_id = r.employee_id;

-- Selesai. Buka app → Dashboard / Hasil WP / Riwayat → periode Juni 2025
