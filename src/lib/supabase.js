import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[SIPENS] VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum diset. ' +
      'Salin .env.example ke .env dan isi kredensial Supabase Anda.'
  );
}

/**
 * Supabase client singleton untuk seluruh aplikasi.
 * Gunakan publishable/anon key saja — jangan expose service_role di frontend.
 */
export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Ambil profil user yang sedang login.
 * @returns {Promise<{ data: object|null, error: object|null }>}
 */
export async function getCurrentProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, full_name, created_at')
    .eq('id', user.id)
    .single();

  return { data, error };
}

/**
 * Cek apakah user saat ini adalah admin.
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const { data } = await getCurrentProfile();
  return data?.role === 'admin';
}

/**
 * Format periode penilaian bulanan: YYYY-MM
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function formatPeriod(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Label periode untuk tampilan UI, contoh: "Juni 2025"
 * @param {string} period - Format YYYY-MM
 * @returns {string}
 */
export function formatPeriodLabel(period) {
  if (!period || !/^\d{4}-\d{2}$/.test(period)) return period;

  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}
