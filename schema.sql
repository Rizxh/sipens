-- =============================================================================
-- SIPENS — Schema Database Supabase (PostgreSQL)
-- Sistem Pendukung Keputusan Penilaian Sales Terbaik (AHP + WP)
--
-- Cara pakai:
--   1. Buat project di https://supabase.com
--   2. Buka SQL Editor → paste & jalankan seluruh file ini
--   3. Buat user admin via Authentication → Users (email + password)
--   4. Set role admin di tabel profiles jika perlu (default: admin)
-- =============================================================================

-- Ekstensi UUID (biasanya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABEL: profiles
-- Profil pengguna, terhubung ke auth.users
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  full_name   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Profil admin/manajemen yang terhubung ke Supabase Auth';

-- =============================================================================
-- TABEL: criteria
-- Kriteria penilaian sales
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.criteria (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('benefit', 'cost')),
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT criteria_name_unique UNIQUE (name)
);

COMMENT ON TABLE public.criteria IS 'Kriteria penilaian: benefit (semakin besar semakin baik) atau cost (semakin kecil semakin baik)';

-- =============================================================================
-- TABEL: ahp_comparisons
-- Input matriks perbandingan berpasangan antar kriteria (skala Saaty 1–9)
-- period format: YYYY-MM (contoh: 2025-06)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ahp_comparisons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period          TEXT NOT NULL,
  criteria_a_id   UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  criteria_b_id   UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  value           NUMERIC(10, 6) NOT NULL CHECK (value > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ahp_comparisons_different_criteria CHECK (criteria_a_id <> criteria_b_id),
  CONSTRAINT ahp_comparisons_unique_pair UNIQUE (period, criteria_a_id, criteria_b_id)
);

COMMENT ON TABLE public.ahp_comparisons IS 'Perbandingan berpasangan kriteria AHP per periode penilaian';

-- =============================================================================
-- TABEL: ahp_weights
-- Hasil bobot kriteria dari perhitungan AHP
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ahp_weights (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period        TEXT NOT NULL,
  criteria_id   UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  weight        NUMERIC(12, 8) NOT NULL CHECK (weight >= 0),
  lambda_max    NUMERIC(12, 6),
  ci            NUMERIC(12, 6),
  cr            NUMERIC(12, 6),
  is_consistent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ahp_weights_unique_period_criteria UNIQUE (period, criteria_id)
);

COMMENT ON TABLE public.ahp_weights IS 'Bobot prioritas kriteria hasil AHP per periode';

-- =============================================================================
-- TABEL: sales
-- Data alternatif (sales) yang dinilai
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sales (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  employee_id   TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sales_employee_id_unique UNIQUE (employee_id)
);

COMMENT ON TABLE public.sales IS 'Data sales / alternatif yang dinilai';

-- =============================================================================
-- TABEL: sales_scores
-- Nilai aktual setiap sales per kriteria per periode
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.sales_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_id      UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  criteria_id   UUID NOT NULL REFERENCES public.criteria(id) ON DELETE CASCADE,
  period        TEXT NOT NULL,
  value         NUMERIC(14, 4) NOT NULL CHECK (value > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT sales_scores_unique UNIQUE (sales_id, criteria_id, period)
);

COMMENT ON TABLE public.sales_scores IS 'Nilai aktual sales per kriteria per periode (harus positif untuk WP)';

-- =============================================================================
-- TABEL: wp_results
-- Hasil perankingan Weighted Product per periode (history)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.wp_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_id    UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  period      TEXT NOT NULL,
  s_value     NUMERIC(18, 8) NOT NULL,
  v_value     NUMERIC(12, 8) NOT NULL,
  rank        INTEGER NOT NULL CHECK (rank > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wp_results_unique_sales_period UNIQUE (sales_id, period),
  CONSTRAINT wp_results_unique_rank_period UNIQUE (period, rank)
);

COMMENT ON TABLE public.wp_results IS 'History hasil ranking WP per periode penilaian';

-- =============================================================================
-- INDEX
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_ahp_comparisons_period ON public.ahp_comparisons(period);
CREATE INDEX IF NOT EXISTS idx_ahp_weights_period ON public.ahp_weights(period);
CREATE INDEX IF NOT EXISTS idx_sales_scores_period ON public.sales_scores(period);
CREATE INDEX IF NOT EXISTS idx_sales_scores_sales ON public.sales_scores(sales_id);
CREATE INDEX IF NOT EXISTS idx_wp_results_period ON public.wp_results(period);
CREATE INDEX IF NOT EXISTS idx_wp_results_rank ON public.wp_results(period, rank);

-- =============================================================================
-- TRIGGER: updated_at otomatis
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER criteria_set_updated_at
  BEFORE UPDATE ON public.criteria
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER sales_set_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER sales_scores_set_updated_at
  BEFORE UPDATE ON public.sales_scores
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRIGGER: auto-create profile saat user baru mendaftar via Supabase Auth
-- Role disimpan di tabel profiles (BUKAN user_metadata) — aman untuk RLS
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'admin',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(COALESCE(NEW.email, ''), '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Semua tabel di schema public wajib RLS (best practice Supabase)
-- Akses: hanya user terautentikasi dengan role admin di tabel profiles
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahp_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ahp_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wp_results ENABLE ROW LEVEL SECURITY;

-- Helper: cek admin tanpa infinite recursion RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- profiles: user hanya baca/update profil sendiri (cukup untuk login)
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- criteria: admin full access
CREATE POLICY "criteria_admin_select"
  ON public.criteria FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "criteria_admin_insert"
  ON public.criteria FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "criteria_admin_update"
  ON public.criteria FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "criteria_admin_delete"
  ON public.criteria FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ahp_comparisons
CREATE POLICY "ahp_comparisons_admin_select"
  ON public.ahp_comparisons FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "ahp_comparisons_admin_insert"
  ON public.ahp_comparisons FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "ahp_comparisons_admin_update"
  ON public.ahp_comparisons FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "ahp_comparisons_admin_delete"
  ON public.ahp_comparisons FOR DELETE TO authenticated
  USING (public.is_admin());

-- ahp_weights
CREATE POLICY "ahp_weights_admin_select"
  ON public.ahp_weights FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "ahp_weights_admin_insert"
  ON public.ahp_weights FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "ahp_weights_admin_update"
  ON public.ahp_weights FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "ahp_weights_admin_delete"
  ON public.ahp_weights FOR DELETE TO authenticated
  USING (public.is_admin());

-- sales
CREATE POLICY "sales_admin_select"
  ON public.sales FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "sales_admin_insert"
  ON public.sales FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "sales_admin_update"
  ON public.sales FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "sales_admin_delete"
  ON public.sales FOR DELETE TO authenticated
  USING (public.is_admin());

-- sales_scores
CREATE POLICY "sales_scores_admin_select"
  ON public.sales_scores FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "sales_scores_admin_insert"
  ON public.sales_scores FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "sales_scores_admin_update"
  ON public.sales_scores FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "sales_scores_admin_delete"
  ON public.sales_scores FOR DELETE TO authenticated
  USING (public.is_admin());

-- wp_results
CREATE POLICY "wp_results_admin_select"
  ON public.wp_results FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "wp_results_admin_insert"
  ON public.wp_results FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "wp_results_admin_update"
  ON public.wp_results FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "wp_results_admin_delete"
  ON public.wp_results FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================================
-- SEED: 5 kriteria default
-- =============================================================================
INSERT INTO public.criteria (name, type, description) VALUES
  ('Target Omset',       'benefit', 'Pencapaian target omset penjualan'),
  ('Profitabilitas',     'benefit', 'Margin keuntungan dari penjualan'),
  ('Retensi Pelanggan',  'benefit', 'Kemampuan mempertahankan pelanggan existing'),
  ('Pelanggan Baru',     'benefit', 'Jumlah akuisisi pelanggan baru'),
  ('Efektivitas Biaya',  'cost',    'Efisiensi biaya operasional sales (semakin kecil semakin baik)')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- SEED OPSIONAL: contoh data sales (hapus jika tidak diperlukan)
-- =============================================================================
INSERT INTO public.sales (name, employee_id) VALUES
  ('Budi Santoso',  'EMP001'),
  ('Siti Rahayu',   'EMP002'),
  ('Andi Wijaya',   'EMP003')
ON CONFLICT (employee_id) DO NOTHING;
