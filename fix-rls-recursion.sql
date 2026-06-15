-- =============================================================================
-- FIX: infinite recursion on profiles RLS (error 42P17)
--
-- Penyebab: policy profiles_select_admin SELECT dari profiles
--           di dalam policy ON profiles → loop tak terbatas.
--
-- Jalankan di Supabase SQL Editor (sekali saja).
-- =============================================================================

-- Helper: cek admin tanpa trigger RLS (SECURITY DEFINER)
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

-- Hapus policy yang bikin recursion
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- =============================================================================
-- Recreate policies pakai is_admin() — drop dulu yang lama
-- =============================================================================

-- criteria
DROP POLICY IF EXISTS "criteria_admin_select" ON public.criteria;
DROP POLICY IF EXISTS "criteria_admin_insert" ON public.criteria;
DROP POLICY IF EXISTS "criteria_admin_update" ON public.criteria;
DROP POLICY IF EXISTS "criteria_admin_delete" ON public.criteria;

CREATE POLICY "criteria_admin_select" ON public.criteria FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "criteria_admin_insert" ON public.criteria FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "criteria_admin_update" ON public.criteria FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "criteria_admin_delete" ON public.criteria FOR DELETE TO authenticated USING (public.is_admin());

-- ahp_comparisons
DROP POLICY IF EXISTS "ahp_comparisons_admin_select" ON public.ahp_comparisons;
DROP POLICY IF EXISTS "ahp_comparisons_admin_insert" ON public.ahp_comparisons;
DROP POLICY IF EXISTS "ahp_comparisons_admin_update" ON public.ahp_comparisons;
DROP POLICY IF EXISTS "ahp_comparisons_admin_delete" ON public.ahp_comparisons;

CREATE POLICY "ahp_comparisons_admin_select" ON public.ahp_comparisons FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "ahp_comparisons_admin_insert" ON public.ahp_comparisons FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "ahp_comparisons_admin_update" ON public.ahp_comparisons FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "ahp_comparisons_admin_delete" ON public.ahp_comparisons FOR DELETE TO authenticated USING (public.is_admin());

-- ahp_weights
DROP POLICY IF EXISTS "ahp_weights_admin_select" ON public.ahp_weights;
DROP POLICY IF EXISTS "ahp_weights_admin_insert" ON public.ahp_weights;
DROP POLICY IF EXISTS "ahp_weights_admin_update" ON public.ahp_weights;
DROP POLICY IF EXISTS "ahp_weights_admin_delete" ON public.ahp_weights;

CREATE POLICY "ahp_weights_admin_select" ON public.ahp_weights FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "ahp_weights_admin_insert" ON public.ahp_weights FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "ahp_weights_admin_update" ON public.ahp_weights FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "ahp_weights_admin_delete" ON public.ahp_weights FOR DELETE TO authenticated USING (public.is_admin());

-- sales
DROP POLICY IF EXISTS "sales_admin_select" ON public.sales;
DROP POLICY IF EXISTS "sales_admin_insert" ON public.sales;
DROP POLICY IF EXISTS "sales_admin_update" ON public.sales;
DROP POLICY IF EXISTS "sales_admin_delete" ON public.sales;

CREATE POLICY "sales_admin_select" ON public.sales FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "sales_admin_insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "sales_admin_update" ON public.sales FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "sales_admin_delete" ON public.sales FOR DELETE TO authenticated USING (public.is_admin());

-- sales_scores
DROP POLICY IF EXISTS "sales_scores_admin_select" ON public.sales_scores;
DROP POLICY IF EXISTS "sales_scores_admin_insert" ON public.sales_scores;
DROP POLICY IF EXISTS "sales_scores_admin_update" ON public.sales_scores;
DROP POLICY IF EXISTS "sales_scores_admin_delete" ON public.sales_scores;

CREATE POLICY "sales_scores_admin_select" ON public.sales_scores FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "sales_scores_admin_insert" ON public.sales_scores FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "sales_scores_admin_update" ON public.sales_scores FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "sales_scores_admin_delete" ON public.sales_scores FOR DELETE TO authenticated USING (public.is_admin());

-- wp_results
DROP POLICY IF EXISTS "wp_results_admin_select" ON public.wp_results;
DROP POLICY IF EXISTS "wp_results_admin_insert" ON public.wp_results;
DROP POLICY IF EXISTS "wp_results_admin_update" ON public.wp_results;
DROP POLICY IF EXISTS "wp_results_admin_delete" ON public.wp_results;

CREATE POLICY "wp_results_admin_select" ON public.wp_results FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "wp_results_admin_insert" ON public.wp_results FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "wp_results_admin_update" ON public.wp_results FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "wp_results_admin_delete" ON public.wp_results FOR DELETE TO authenticated USING (public.is_admin());

-- Pastikan profil admin ada untuk user yang sudah dibuat
INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'admin', COALESCE(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'admin';

-- Selesai. Logout → login lagi di app.
