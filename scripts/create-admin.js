/**
 * Buat user admin via Supabase Service Role (bypass email confirm).
 *
 * 1. Supabase Dashboard → Settings → API → copy "service_role" key (RAHASIA)
 * 2. Jalankan (PowerShell):
 *
 *    $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
 *    node scripts/create-admin.js
 *
 *    atau dengan email/password custom:
 *    node scripts/create-admin.js admin@sipens.com Sipens123!
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFile();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2] || 'admin@sipens.com';
const password = process.argv[3] || 'Sipens123!';

if (!url) {
  console.error('❌ VITE_SUPABASE_URL tidak ada di .env');
  process.exit(1);
}

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY belum diset.\n');
  console.error('Ambil dari: Supabase Dashboard → Settings → API → service_role (secret)\n');
  console.error('PowerShell:');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."');
  console.error('  node scripts/create-admin.js\n');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('Membuat admin:', email);
console.log('Project:', url.replace('https://', '').split('.')[0]);
console.log('---');

const { data: existing } = await supabase.auth.admin.listUsers();
const found = existing?.users?.find((u) => u.email === email);

let userId;

if (found) {
  console.log('User sudah ada, update password & konfirmasi email...');
  const { data, error } = await supabase.auth.admin.updateUserById(found.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error('❌ Gagal update user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin SIPENS' },
  });
  if (error) {
    console.error('❌ Gagal buat user:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('✓ User auth dibuat:', userId);
}

const { error: profileError } = await supabase.from('profiles').upsert(
  {
    id: userId,
    email,
    role: 'admin',
    full_name: 'Admin SIPENS',
  },
  { onConflict: 'id' }
);

if (profileError) {
  console.error('❌ Gagal buat profil:', profileError.message);
  process.exit(1);
}

console.log('✓ Profil admin OK');
console.log('\n========================================');
console.log('  LOGIN SIPENS');
console.log('========================================');
console.log('  Email:   ', email);
console.log('  Password:', password);
console.log('========================================');
console.log('\nBuka: http://localhost:5173/login\n');

// Verifikasi login dengan anon key
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (anonKey) {
  const anon = createClient(url, anonKey);
  const { error: loginErr } = await anon.auth.signInWithPassword({ email, password });
  console.log('Test login:', loginErr ? '❌ ' + loginErr.message : '✓ BERHASIL');
}
