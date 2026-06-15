# SIPENS — Sistem Pendukung Keputusan Penilaian Sales Terbaik

Aplikasi web SPK untuk menilai dan menominasikan **Sales Terbaik** menggunakan
**AHP** (bobot kriteria) dan **Weighted Product** (perankingan).

## Stack

| Layer | Teknologi |
|---|---|
| Frontend | React + Vite + JavaScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (PostgreSQL + Auth) |
| Chart | Recharts |
| Deploy | Vercel |

## Setup Lokal

```bash
cp .env.example .env
# Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

### Database Supabase

1. **SQL Editor** → jalankan `schema.sql`
2. **Authentication → Users** → buat user admin (centang **Auto Confirm**)
3. Jalankan `fix-rls-recursion.sql` jika login error infinite recursion
4. Jalankan `seed-30-sales.sql` untuk **30 sales** + data penilaian lengkap (periode 2025-06)

## Deploy ke Vercel

1. Push repo ke GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework Preset: **Vite** (auto-detect)
4. Environment Variables:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | URL project Supabase |
   | `VITE_SUPABASE_ANON_KEY` | Anon/public key |

5. Deploy

File `vercel.json` sudah disertakan untuk SPA routing (React Router).

### Supabase setelah deploy

Di **Authentication → URL Configuration**, tambahkan domain Vercel ke:
- **Site URL** (production URL)
- **Redirect URLs** (jika diperlukan)

## Alur Penilaian

```
Kriteria → AHP (bobot, CR ≤ 0.1) → Input Nilai Sales → Hasil WP → Simpan → Riwayat
```

## Halaman Aplikasi

| Route | Fungsi |
|---|---|
| `/login` | Login admin |
| `/dashboard` | Overview + top 3 sales |
| `/criteria` | CRUD kriteria |
| `/ahp` | Matriks perbandingan + bobot |
| `/sales` | CRUD sales + input nilai |
| `/wp-result` | Ranking WP + chart |
| `/history` | Riwayat per periode |

## Scripts

```bash
npm run dev       # Development
npm run build     # Production build
npm run preview   # Preview build lokal
node scripts/verify-algorithms.js  # Verifikasi AHP & WP
```

## Struktur

```
src/
  components/   UI reusable + modul AHP/WP/Sales
  pages/        Halaman aplikasi
  hooks/        Data fetching & state
  utils/        ahp.js, wp.js (algoritma inti)
  lib/          supabase.js
schema.sql      Schema database
seed-demo.sql   Data demo (opsional)
vercel.json     Konfigurasi deploy
```

## Status Pengembangan

Semua tahap selesai (setup → auth → dashboard → CRUD → AHP → WP → history → deploy ready).
