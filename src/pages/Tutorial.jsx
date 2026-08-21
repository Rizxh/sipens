import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/icons';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { APP_NAME } from '../config/app';

const STEPS = [
  { id: 1, icon: 'dashboard', color: 'blue',   title: `Apa itu ${APP_NAME}?`,              emoji: '🏆', short: 'Pengenalan' },
  { id: 2, icon: 'criteria', color: 'purple',  title: 'Langkah 1 — Kelola Kriteria', emoji: '📋', short: 'Kriteria'   },
  { id: 3, icon: 'ahp',      color: 'indigo',  title: 'Langkah 2 — Isi Bobot AHP',   emoji: '⚖️', short: 'AHP'        },
  { id: 4, icon: 'sales',    color: 'teal',    title: 'Langkah 3 — Input Nilai Sales',emoji: '📝', short: 'Nilai'      },
  { id: 5, icon: 'wpResult', color: 'amber',   title: 'Langkah 4 — Lihat Hasil WP',  emoji: '🥇', short: 'Hasil'      },
  { id: 6, icon: 'history',  color: 'rose',    title: 'Langkah 5 — Riwayat Pemenang',emoji: '📁', short: 'Riwayat'   },
];

const COLOR = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'bg-blue-100 text-blue-600',     badge: 'bg-blue-600',   text: 'text-blue-700',   ring: 'ring-blue-500'   },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-600', text: 'text-purple-700', ring: 'ring-purple-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-600', text: 'text-indigo-700', ring: 'ring-indigo-500' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   icon: 'bg-teal-100 text-teal-600',     badge: 'bg-teal-600',   text: 'text-teal-700',   ring: 'ring-teal-500'   },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'bg-amber-100 text-amber-600',   badge: 'bg-amber-600',  text: 'text-amber-700',  ring: 'ring-amber-500'  },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-200',   icon: 'bg-rose-100 text-rose-600',     badge: 'bg-rose-600',   text: 'text-rose-700',   ring: 'ring-rose-500'   },
};

function StepContent({ step }) {
  const c = COLOR[step.color];
  if (step.id === 1) return <Step1 c={c} />;
  if (step.id === 2) return <Step2 c={c} />;
  if (step.id === 3) return <Step3 c={c} />;
  if (step.id === 4) return <Step4 c={c} />;
  if (step.id === 5) return <Step5 c={c} />;
  if (step.id === 6) return <Step6 c={c} />;
  return null;
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────

function Step1({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="👋" title={`Halo! Selamat datang di ${APP_NAME}`}>
        {APP_NAME} adalah sistem yang membantu kamu memilih <strong>siapa sales terbaik bulan ini</strong> secara adil dan otomatis — bukan pakai perasaan, tapi pakai <strong>rumus matematika</strong>.
      </Callout>

      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard emoji="🤔" title="Masalahnya apa?" color={c}
          desc="Kalau ada 10 sales, susah banget menentukan siapa yang terbaik. Semua punya kelebihan masing-masing. Ada yang omsetnya tinggi, ada yang pelanggannya banyak, ada yang biayanya rendah." />
        <InfoCard emoji="✅" title="Solusinya?" color={c}
          desc={`${APP_NAME} pakai 2 metode ilmiah: AHP untuk menentukan seberapa penting tiap kriteria, dan WP untuk menghitung skor setiap sales secara otomatis.`} />
      </div>

      <h3 className="text-base font-bold text-slate-800 mt-2">Alur kerja {APP_NAME} — 5 langkah mudah:</h3>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {[
          { n: 1, label: 'Tentukan Kriteria', icon: '📋', desc: 'Apa saja yang mau dinilai?' },
          { n: 2, label: 'Bobot AHP',         icon: '⚖️', desc: 'Kriteria mana yang paling penting?' },
          { n: 3, label: 'Input Nilai',        icon: '📝', desc: 'Masukkan nilai tiap sales (1–10)' },
          { n: 4, label: 'Hitung WP',          icon: '🧮', desc: 'Sistem menghitung otomatis' },
          { n: 5, label: 'Lihat Hasil',        icon: '🏆', desc: 'Sales terbaik ketahuan!' },
        ].map((s) => (
          <div key={s.n} className="flex sm:flex-col items-center gap-2 sm:gap-1 sm:text-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white text-lg font-bold">
              {s.icon}
            </div>
            <div className="flex-1 sm:flex-none">
              <p className="text-sm font-semibold text-slate-800">{s.label}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <Callout color={c} emoji="💡" title="Ingat!">
        Kamu harus mengisi langkah 1 → 2 → 3 secara berurutan baru bisa lihat hasil. Kalau ada yang kelewat, sistem akan kasih tahu kamu apa yang kurang.
      </Callout>
    </div>
  );
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────

function Step2({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="📋" title="Kriteria = hal yang dinilai dari sales">
        Kriteria adalah <strong>aspek penilaian</strong> yang kamu gunakan untuk menilai performa sales. Di {APP_NAME} sudah ada 3 kriteria default.
      </Callout>

      <h3 className="text-base font-bold text-slate-800">3 Kriteria yang digunakan:</h3>
      <div className="space-y-3">
        <CriteriaCard name="Target Omset" type="benefit" emoji="💰" color={c}
          desc='Seberapa baik pencapaian penjualan sales bulan ini. Makin tinggi nilainya makin bagus → disebut "Benefit".'
          example='Contoh: Budi tampil sangat baik bulan ini → nilai = 10 (nilai maksimal, skala 1–10)' />
        <CriteriaCard name="Pelanggan Baru" type="benefit" emoji="👥" color={c}
          desc='Seberapa banyak pelanggan baru yang berhasil didapat. Makin besar makin bagus → disebut "Benefit".'
          example='Contoh: Siti mendapat banyak pelanggan baru → nilai = 9 dari 10' />
        <CriteriaCard name="Efektivitas Biaya" type="cost" emoji="📉" color={c}
          desc='Seberapa hemat biaya yang dikeluarkan sales. Makin kecil angkanya makin bagus → disebut "Cost" (kebalikan dari Benefit).'
          example='Contoh: Maya sangat hemat biaya bulan ini → nilai = 2 (mendekati 1 = paling hemat = bagus)' />
      </div>

      <Callout color={c} emoji="⚠️" title="Benefit vs Cost — jangan bingung!">
        <ul className="mt-1 space-y-1 text-sm">
          <li><strong>Benefit</strong> = nilai besar → bagus. Contoh: skor omset 10 = prestasi terbaik.</li>
          <li><strong>Cost</strong> = nilai kecil → bagus. Contoh: skor biaya 2 = paling efisien.</li>
          <li><strong>Skala penilaian: 1–10</strong> untuk semua kriteria (sesuai jumlah 10 karyawan).</li>
        </ul>
      </Callout>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
        <p className="text-sm font-semibold text-slate-700 mb-2">Cara akses menu ini:</p>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="rounded-lg bg-white border border-slate-200 px-2 py-1 font-mono text-xs">Klik menu "Kriteria" di sidebar kiri</span>
          <span>→</span>
          <span>aktifkan/nonaktifkan kriteria sesuai kebutuhan</span>
        </div>
        <Link to="/criteria" className={`inline-flex items-center gap-1.5 mt-3 text-sm font-semibold ${c.text} hover:underline`}>
          <Icon name="criteria" className="w-4 h-4" />
          Buka menu Kriteria →
        </Link>
      </div>
    </div>
  );
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

function Step3({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="⚖️" title="AHP = sistem untuk menentukan seberapa penting tiap kriteria">
        Bayangkan kamu punya 3 bahan masakan. AHP membantu kamu menentukan: <em>bahan mana yang paling penting untuk rasa masakan?</em> Begitu juga di {APP_NAME} — AHP menentukan <strong>bobot (seberapa penting)</strong> tiap kriteria.
      </Callout>

      <h3 className="text-base font-bold text-slate-800">Cara kerja AHP — 4 langkah aplikasi:</h3>
      <div className="space-y-3">
        {[
          { n: 1, title: 'Pilih periode (bulan)', emoji: '📅', desc: 'Tentukan bulan yang mau dihitung. Contoh: pilih "Januari 2026".' },
          { n: 2, title: 'Isi matriks perbandingan', emoji: '📊', desc: 'Bandingkan setiap pasang kriteria: "Seberapa lebih penting Target Omset dibanding Pelanggan Baru?" Pakai skala 1–9.' },
          { n: 3, title: 'Cek CR (Consistency Ratio)', emoji: '✅', desc: 'CR harus ≤ 0,1. Ini artinya perbandingan yang kamu isi "masuk akal" dan tidak kontradiksi. Kalau CR > 0,1 berarti ada yang aneh — coba sesuaikan nilainya.' },
          { n: 4, title: 'Simpan bobot', emoji: '💾', desc: 'Klik "Simpan Bobot". Bobot ini akan dipakai oleh WP untuk menghitung ranking.' },
        ].map((s) => (
          <div key={s.n} className={`flex gap-3 rounded-xl border ${c.border} ${c.bg} p-4`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${c.badge} text-white text-sm font-bold`}>{s.n}</div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{s.emoji} {s.title}</p>
              <p className="text-sm text-slate-600 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-base font-bold text-slate-800">Skala perbandingan (Saaty 1–9):</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Angka</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Artinya</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Contoh</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ['1', 'Sama penting',          'Target Omset sama pentingnya dengan Pelanggan Baru'],
              ['3', 'Sedikit lebih penting', 'Target Omset sedikit lebih penting'],
              ['5', 'Lebih penting',          'Target Omset jelas lebih penting'],
              ['7', 'Sangat lebih penting',   'Target Omset sangat lebih penting'],
              ['9', 'Mutlak lebih penting',   'Target Omset jauh lebih penting'],
            ].map(([n, label, ex]) => (
              <tr key={n} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-bold text-slate-800">{n}</td>
                <td className="px-4 py-2.5 text-slate-700">{label}</td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">{ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Rumus AHP Lengkap ── */}
      <h3 className="text-base font-bold text-slate-800">📐 Contoh perhitungan AHP lengkap (3 kriteria):</h3>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-3`}>
        <p className="text-sm font-semibold text-slate-800">Langkah A — Matriks Perbandingan Berpasangan</p>
        <p className="text-xs text-slate-500">Nilai: TO lebih penting 3× dari PB, TO lebih penting 5× dari EB, PB lebih penting 3× dari EB. Diagonal selalu = 1. Segitiga bawah = kebalikan (1/nilai).</p>
        <div className="overflow-x-auto">
          <table className="text-sm font-mono border-collapse">
            <thead>
              <tr>
                <th className="border border-slate-300 px-4 py-2 bg-slate-100 text-slate-600 text-xs"> </th>
                <th className="border border-slate-300 px-4 py-2 bg-indigo-100 text-indigo-800 text-xs font-bold">TO</th>
                <th className="border border-slate-300 px-4 py-2 bg-indigo-100 text-indigo-800 text-xs font-bold">PB</th>
                <th className="border border-slate-300 px-4 py-2 bg-indigo-100 text-indigo-800 text-xs font-bold">EB</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['TO', '1',    '3',    '5'],
                ['PB', '1/3',  '1',    '3'],
                ['EB', '1/5',  '1/3',  '1'],
              ].map(([row, ...vals]) => (
                <tr key={row}>
                  <td className="border border-slate-300 px-4 py-2 bg-indigo-100 font-bold text-indigo-800 text-xs">{row}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`border border-slate-300 px-4 py-2 text-center text-sm ${v === '1' ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-700'}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-3`}>
        <p className="text-sm font-semibold text-slate-800">Langkah B — Normalisasi Kolom → Hitung Bobot</p>
        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600 space-y-0.5">
          <p>Jumlah kolom TO = 1 + 0.333 + 0.200 = <strong>1.533</strong></p>
          <p>Jumlah kolom PB = 3 + 1 + 0.333 = <strong>4.333</strong></p>
          <p>Jumlah kolom EB = 5 + 3 + 1 = <strong>9.000</strong></p>
        </div>
        <p className="text-xs text-slate-500">Tiap sel dibagi jumlah kolomnya, lalu rata-rata baris = bobot (w):</p>
        <div className="overflow-x-auto">
          <table className="text-xs font-mono border-collapse w-full">
            <thead>
              <tr>
                <th className="border border-slate-300 px-3 py-1.5 bg-slate-100 text-slate-600"> </th>
                <th className="border border-slate-300 px-3 py-1.5 bg-indigo-100 text-indigo-800">TO</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-indigo-100 text-indigo-800">PB</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-indigo-100 text-indigo-800">EB</th>
                <th className="border border-slate-300 px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold">Bobot (w)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['TO', '1.000÷1.533=0.652', '3.000÷4.333=0.692', '5.000÷9.000=0.556', '0.633 (63.3%)'],
                ['PB', '0.333÷1.533=0.217', '1.000÷4.333=0.231', '3.000÷9.000=0.333', '0.260 (26.0%)'],
                ['EB', '0.200÷1.533=0.130', '0.333÷4.333=0.077', '1.000÷9.000=0.111', '0.106 (10.6%)'],
              ].map(([row, ...vals]) => (
                <tr key={row}>
                  <td className="border border-slate-300 px-3 py-1.5 bg-indigo-100 font-bold text-indigo-800">{row}</td>
                  {vals.slice(0, 3).map((v, i) => (
                    <td key={i} className="border border-slate-300 px-3 py-1.5 text-center bg-white text-slate-600">{v}</td>
                  ))}
                  <td className="border border-slate-300 px-3 py-1.5 text-center bg-emerald-50 font-bold text-emerald-800">{vals[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">Bobot TO = rata-rata baris = (0.652 + 0.692 + 0.556) ÷ 3 = <strong>0.633</strong></p>
      </div>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-3`}>
        <p className="text-sm font-semibold text-slate-800">Langkah C — Hitung λmax, CI, RI, CR</p>
        <div className="space-y-2">
          <div className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-600 space-y-1">
            <p className="font-sans text-xs font-semibold text-slate-700 mb-1.5">λmax = rata-rata dari (jumlah tiap baris × bobot) ÷ bobot:</p>
            <p>Baris TO: (1×0.633 + 3×0.260 + 5×0.106) ÷ 0.633 = 1.943 ÷ 0.633 = 3.069</p>
            <p>Baris PB: (⅓×0.633 + 1×0.260 + 3×0.106) ÷ 0.260 = 0.789 ÷ 0.260 = 3.035</p>
            <p>Baris EB: (⅕×0.633 + ⅓×0.260 + 1×0.106) ÷ 0.106 = 0.320 ÷ 0.106 = 3.019</p>
            <p className="font-bold text-indigo-700 mt-1">λmax = (3.069 + 3.035 + 3.019) ÷ 3 = <strong>3.041</strong></p>
          </div>
          <div className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-xs font-mono text-slate-600 space-y-1">
            <p>CI = (λmax − n) ÷ (n − 1) = (3.041 − 3) ÷ (3 − 1) = 0.041 ÷ 2 = <strong>0.021</strong></p>
            <p>RI = <strong>0.58</strong>  <span className="font-sans text-slate-400">(tabel Saaty, n = 3)</span></p>
            <p className="text-indigo-700 font-bold mt-1">CR = CI ÷ RI = 0.021 ÷ 0.58 = <strong>0.036</strong>  ≤  0.1  →  ✅ KONSISTEN</p>
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-500">
          <strong>Tabel RI Saaty:</strong> n=1→0 | n=2→0 | n=3→0.58 | n=4→0.90 | n=5→1.12 | n=6→1.24 | n=7→1.32
        </div>
      </div>

      <Callout color={c} emoji="🎯" title={`Bobot akhir ${APP_NAME} (hasil AHP di atas):`}>
        <ul className="mt-1 space-y-1 text-sm">
          <li><strong>Target Omset = 63.3%</strong> — paling penting karena langsung berpengaruh ke pendapatan</li>
          <li><strong>Pelanggan Baru = 26.0%</strong> — penting untuk pertumbuhan bisnis</li>
          <li><strong>Efektivitas Biaya = 10.6%</strong> — penting tapi paling rendah bobotnya</li>
          <li className="text-slate-500 text-xs mt-1">Total = 99.9% ≈ 100% ✓  |  CR = 0.036 ≤ 0.1 ✓</li>
        </ul>
      </Callout>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
        <Link to="/ahp" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} hover:underline`}>
          <Icon name="ahp" className="w-4 h-4" />
          Buka menu AHP Bobot →
        </Link>
      </div>
    </div>
  );
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────

function Step4({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="📝" title="Input Nilai = masukkan rapor setiap sales">
        Setelah kriteria dan bobot sudah ada, sekarang saatnya isi nilai masing-masing sales untuk setiap kriteria di bulan yang dipilih. <strong>Skala nilai: 1–10</strong>.
      </Callout>

      <h3 className="text-base font-bold text-slate-800">Contoh nilai Januari 2026 (5 dari 10 sales):</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Sales</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Target Omset <span className="font-normal text-green-600">(↑ besar bagus)</span></th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Pelanggan Baru <span className="font-normal text-green-600">(↑ besar bagus)</span></th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Efektivitas Biaya <span className="font-normal text-orange-600">(↓ kecil bagus)</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ['🏆 Budi Santoso', '10', '9', '2', true],
              ['Siti Rahayu',     '8',  '8', '4', false],
              ['Andi Wijaya',     '8',  '7', '3', false],
              ['Rudi Hartono',    '6',  '9', '3', false],
              ['Maya Putri',      '8',  '7', '5', false],
            ].map(([name, to, pb, eb, winner]) => (
              <tr key={name} className={winner ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                <td className={`px-4 py-2.5 font-medium ${winner ? 'text-amber-800' : 'text-slate-700'}`}>{name}</td>
                <td className={`px-4 py-2.5 text-center font-bold text-base ${winner ? 'text-amber-700' : 'text-slate-600'}`}>{to}</td>
                <td className={`px-4 py-2.5 text-center font-bold text-base ${winner ? 'text-amber-700' : 'text-slate-600'}`}>{pb}</td>
                <td className={`px-4 py-2.5 text-center font-bold text-base ${winner ? 'text-amber-700' : 'text-slate-600'}`}>{eb}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">* Data 5 dari 10 sales sebagai contoh. Budi 🏆 unggul karena skor omset 10 (tertinggi) dan biaya 2 (terendah = paling hemat).</p>

      <h3 className="text-base font-bold text-slate-800">Cara input nilai di aplikasi:</h3>
      <div className="space-y-3">
        {[
          { n: 1, emoji: '👤', text: 'Buka menu "Data Sales" → pastikan 10 karyawan sudah terdaftar di tab "Daftar Sales"' },
          { n: 2, emoji: '📅', text: 'Pindah ke tab "Input Nilai" → pilih bulan yang mau diisi (contoh: Januari 2026)' },
          { n: 3, emoji: '✏️', text: 'Isi nilai tiap sales untuk tiap kriteria (skala 1–10) di tabel yang muncul' },
          { n: 4, emoji: '💾', text: 'Klik "Simpan" → nilai tersimpan, siap dihitung WP' },
        ].map((s) => (
          <div key={s.n} className={`flex gap-3 rounded-xl border ${c.border} ${c.bg} p-3.5`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${c.badge} text-white text-xs font-bold`}>{s.n}</div>
            <p className="text-sm text-slate-700">{s.emoji} {s.text}</p>
          </div>
        ))}
      </div>

      <Callout color={c} emoji="💡" title="Panduan skala nilai 1–10">
        <ul className="mt-1 space-y-1 text-sm">
          <li><strong>Benefit (TO, PB):</strong> 10 = performa terbaik, 1 = performa terburuk</li>
          <li><strong>Cost (EB):</strong> 1 = paling hemat (terbaik), 10 = paling boros (terburuk)</li>
          <li>Semua sales wajib dinilai dengan skala yang sama setiap bulannya</li>
        </ul>
      </Callout>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
        <Link to="/sales" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} hover:underline`}>
          <Icon name="sales" className="w-4 h-4" />
          Buka menu Data Sales →
        </Link>
      </div>
    </div>
  );
}

// ─── Step 5 ──────────────────────────────────────────────────────────────────

function Step5({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="🥇" title="Hasil WP = inilah momen penentu!">
        Setelah bobot AHP dan nilai sales sudah diisi, sistem otomatis menghitung siapa yang terbaik menggunakan metode <strong>Weighted Product (WP)</strong>.
      </Callout>

      {/* Rumus WP */}
      <h3 className="text-base font-bold text-slate-800">📐 Rumus Weighted Product (WP):</h3>
      <div className="space-y-3">
        <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
          <p className="text-sm font-semibold text-slate-800 mb-2">🔢 Nilai S — skor WP tiap sales:</p>
          <div className="rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <p className="font-mono">S<sub>i</sub> = (x<sub>1</sub>)<sup>w₁</sup> × (x<sub>2</sub>)<sup>w₂</sup> × (x<sub>3</sub>)<sup>−w₃</sup></p>
          </div>
          <ul className="mt-2 space-y-1 text-xs text-slate-500">
            <li><strong>x</strong> = nilai sales untuk tiap kriteria (skala 1–10)</li>
            <li><strong>w</strong> = bobot kriteria dari AHP (sudah ternormalisasi, total = 1)</li>
            <li>Kriteria <em>benefit</em> → eksponen <strong className="text-emerald-700">positif (+w)</strong> — nilai besar → S besar → bagus</li>
            <li>Kriteria <em>cost</em> → eksponen <strong className="text-orange-600">negatif (−w)</strong> — nilai kecil → S besar → bagus</li>
          </ul>
        </div>

        <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
          <p className="text-sm font-semibold text-slate-800 mb-2">📊 Nilai V — persentase relatif tiap sales:</p>
          <div className="rounded-lg bg-white border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <p className="font-mono">V<sub>i</sub> = S<sub>i</sub> ÷ (S<sub>1</sub> + S<sub>2</sub> + … + S<sub>n</sub>)</p>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Sales dengan <strong>V terbesar = Ranking #1 = Sales Terbaik</strong>. Total semua V = 100%.
          </p>
        </div>
      </div>

      {/* Contoh perhitungan lengkap */}
      <h3 className="text-base font-bold text-slate-800">🧮 Contoh perhitungan WP lengkap — Januari 2026:</h3>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-2`}>
        <p className="text-sm font-semibold text-slate-800">Bobot dari AHP:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-white border border-emerald-200 px-3 py-1 font-mono text-emerald-700">w(TO) = 0.633  [benefit]</span>
          <span className="rounded-full bg-white border border-emerald-200 px-3 py-1 font-mono text-emerald-700">w(PB) = 0.261  [benefit]</span>
          <span className="rounded-full bg-white border border-orange-200 px-3 py-1 font-mono text-orange-700">w(EB) = 0.106  [cost → negatif]</span>
        </div>
      </div>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-3`}>
        <p className="text-sm font-semibold text-slate-800">Hitung nilai S untuk setiap sales:</p>
        <div className="space-y-2 text-xs">
          {[
            { name: 'Budi Santoso', vals: 'TO=10, PB=9, EB=2', line1: 'S = 10^0.633 × 9^0.261 × 2^(−0.106)', line2: '  = 4.297 × 1.774 × 0.929', s: '7.08', winner: true },
            { name: 'Siti Rahayu',  vals: 'TO=8,  PB=8, EB=4', line1: 'S = 8^0.633 × 8^0.261 × 4^(−0.106)',  line2: '  = 3.729 × 1.721 × 0.863', s: '5.54' },
            { name: 'Andi Wijaya',  vals: 'TO=8,  PB=7, EB=3', line1: 'S = 8^0.633 × 7^0.261 × 3^(−0.106)',  line2: '  = 3.729 × 1.662 × 0.890', s: '5.51' },
            { name: 'Rudi Hartono', vals: 'TO=6,  PB=9, EB=3', line1: 'S = 6^0.633 × 9^0.261 × 3^(−0.106)',  line2: '  = 3.108 × 1.774 × 0.890', s: '4.91' },
            { name: 'Maya Putri',   vals: 'TO=8,  PB=7, EB=5', line1: 'S = 8^0.633 × 7^0.261 × 5^(−0.106)',  line2: '  = 3.729 × 1.662 × 0.843', s: '5.22' },
          ].map((row) => (
            <div key={row.name} className={`rounded-lg border px-3 py-2.5 ${row.winner ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
              <p className={`font-semibold text-xs mb-1 ${row.winner ? 'text-amber-800' : 'text-slate-700'}`}>{row.winner ? '🏆 ' : ''}{row.name}  ({row.vals})</p>
              <p className="font-mono text-slate-600">{row.line1}</p>
              <p className="font-mono text-slate-600">{row.line2}</p>
              <p className={`font-mono font-bold mt-0.5 ${row.winner ? 'text-amber-700' : 'text-slate-800'}`}>  = <strong>{row.s}</strong></p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600">
          <p>Total S semua 10 sales = 7.08 + 5.54 + 5.51 + 5.22 + 5.09 + 4.92 + 4.91 + 4.76 + 4.61 + 4.18 = <strong>51.83</strong></p>
        </div>
      </div>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4 space-y-2`}>
        <p className="text-sm font-semibold text-slate-800">Hitung nilai V (normalisasi S):</p>
        <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-mono text-slate-600 space-y-1">
          <p className="text-amber-700 font-bold">V(Budi) = 7.08 ÷ 51.83 = 0.1367 = <strong>13.67%</strong>  ← terbesar → Rank #1 🏆</p>
          <p>V(Siti) = 5.54 ÷ 51.83 = 0.1069 = 10.69%</p>
          <p>V(Andi) = 5.51 ÷ 51.83 = 0.1064 = 10.64%</p>
          <p>V(Maya) = 5.22 ÷ 51.83 = 0.1008 = 10.08%</p>
          <p>V(Rudi) = 4.91 ÷ 51.83 = 0.0947 =  9.47%</p>
          <p className="text-slate-400">…dst. Total semua V = 100%</p>
        </div>
      </div>

      <h3 className="text-base font-bold text-slate-800">Hasil akhir ranking Januari 2026 (Top 5):</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Rank</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Sales</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Nilai S</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Nilai V (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ['#1', '🏆 Budi Santoso', '7.08', '13.67%', true],
              ['#2', 'Siti Rahayu',     '5.54', '10.69%', false],
              ['#3', 'Andi Wijaya',     '5.51', '10.64%', false],
              ['#4', 'Maya Putri',      '5.22', '10.08%', false],
              ['#5', 'Agus Setiawan',   '5.09', '9.82%',  false],
            ].map(([rank, name, s, v, winner]) => (
              <tr key={name} className={winner ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                <td className={`px-4 py-2.5 text-center font-bold ${winner ? 'text-amber-700 text-lg' : 'text-slate-500'}`}>{rank}</td>
                <td className={`px-4 py-2.5 font-medium ${winner ? 'text-amber-800' : 'text-slate-700'}`}>{name}</td>
                <td className="px-4 py-2.5 text-center font-mono text-slate-600">{s}</td>
                <td className={`px-4 py-2.5 text-center font-bold ${winner ? 'text-amber-700' : 'text-slate-600'}`}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">* Budi menang karena nilai S-nya paling besar (7.08) → V terbesar (13.67%). Kunci: skor TO=10 (maks) dan EB=2 (paling hemat).</p>

      <Callout color={c} emoji="🚀" title="Cara lihat hasil WP:">
        Buka menu "Hasil WP" → pilih bulan → klik "Hitung Ulang" → lihat siapa juaranya! Klik "Simpan Hasil" untuk menyimpan ke riwayat.
      </Callout>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
        <Link to="/wp-result" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} hover:underline`}>
          <Icon name="wpResult" className="w-4 h-4" />
          Buka menu Hasil WP →
        </Link>
      </div>
    </div>
  );
}

// ─── Step 6 ──────────────────────────────────────────────────────────────────

function Step6({ c }) {
  return (
    <div className="space-y-6">
      <Callout color={c} emoji="📁" title="Riwayat = arsip pemenang setiap bulan">
        Menu Riwayat menyimpan semua hasil WP yang sudah pernah disimpan. Kamu bisa lihat siapa juara di bulan-bulan sebelumnya.
      </Callout>

      <h3 className="text-base font-bold text-slate-800">Yang bisa dilihat di Riwayat:</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard emoji="🏆" title="Sales Terbaik per Bulan" color={c} desc="Nama pemenang, nilai V-nya, dan ranking lengkap semua sales di bulan itu." />
        <InfoCard emoji="🔍" title="Filter & Cari" color={c} desc='Ketik nama bulan (contoh: "Januari") atau nama sales di kotak pencarian untuk filter data.' />
        <InfoCard emoji="📊" title="CR AHP" color={c} desc='Lihat apakah bobot AHP bulan itu valid (CR ≤ 0,1). Ada badge merah kalau tidak valid.' />
        <InfoCard emoji="📅" title="Semua Periode" color={c} desc="Lihat pola: siapa yang sering menang? Siapa yang konsisten di posisi atas?" />
      </div>

      <h3 className="text-base font-bold text-slate-800">Pemenang Jan–Jun 2026:</h3>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Bulan</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Sales Terbaik</th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700">Nilai V</th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">Keunggulan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              ['Januari 2026',  'Budi Santoso',  '13.67%', 'Skor TO=10 (tertinggi), EB=2 (paling hemat)'],
              ['Februari 2026', 'Siti Rahayu',   '13.60%', 'Skor TO=10, PB=9, EB=2 — dominan semua kriteria'],
              ['Maret 2026',    'Rina Wati',     '13.90%', 'Skor TO=10, PB=9, EB=2 — V tertinggi sepanjang semester'],
              ['April 2026',    'Rudi Hartono',  '13.46%', 'Skor TO=10, PB=9, EB=2 — sprint di bulan keempat'],
              ['Mei 2026',      'Andi Wijaya',   '13.49%', 'Skor TO=10, PB=9, EB=2 — konsisten naik peringkat'],
              ['Juni 2026',     'Maya Putri',    '13.33%', 'Skor TO=10, PB=9, EB=2 — penutup semester terbaik'],
            ].map(([bln, name, v, ket]) => (
              <tr key={bln} className="hover:bg-slate-50">
                <td className="px-4 py-2.5 text-slate-700">{bln}</td>
                <td className="px-4 py-2.5 font-semibold text-amber-700">🏆 {name}</td>
                <td className="px-4 py-2.5 text-center font-bold text-brand-700">{v}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{ket}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
        <Link to="/history" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${c.text} hover:underline`}>
          <Icon name="history" className="w-4 h-4" />
          Buka menu Riwayat →
        </Link>
      </div>

      <Callout color={c} emoji="🎉" title={`Selesai! Kamu sudah paham cara kerja ${APP_NAME}.`}>
        Ingat urutannya: <strong>Kriteria → AHP → Input Nilai (1–10) → Hasil WP → Simpan → Riwayat</strong>. Ulangi setiap bulan untuk menentukan sales terbaik secara konsisten dan adil!
      </Callout>
    </div>
  );
}

// ─── Komponen bantu ──────────────────────────────────────────────────────────

function Callout({ color: c, emoji, title, children }) {
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className="text-base font-bold text-slate-800 mb-1.5">{emoji} {title}</p>
      <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function InfoCard({ emoji, title, color: c, desc }) {
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className="text-2xl mb-2">{emoji}</p>
      <p className="text-sm font-bold text-slate-800 mb-1">{title}</p>
      <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function CriteriaCard({ name, type, emoji, color: c, desc, example }) {
  const isCost = type === 'cost';
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <span className={['text-xs rounded-full px-2 py-0.5 font-semibold', isCost ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'].join(' ')}>
            {isCost ? 'Cost — nilai kecil = bagus ↓' : 'Benefit — nilai besar = bagus ↑'}
          </span>
        </div>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed mb-2">{desc}</p>
      <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-500 italic">{example}</div>
    </div>
  );
}

// ─── Halaman utama ────────────────────────────────────────────────────────────

export default function Tutorial() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const c = COLOR[step.color];
  const isFirst = active === 0;
  const isLast  = active === STEPS.length - 1;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Tutorial"
        description={`Panduan lengkap ${APP_NAME} — termasuk rumus AHP & WP dengan contoh perhitungan!`}
      />

      {/* Progress bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
        {STEPS.map((s, i) => {
          const done = i < active;
          const cur  = i === active;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={[
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all shrink-0',
                done ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : cur ? `${COLOR[s.color].badge} text-white shadow-sm`
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
              ].join(' ')}
            >
              {done ? <Icon name="checkSimple" className="w-3.5 h-3.5 shrink-0" /> : <span className="text-sm">{s.emoji}</span>}
              <span className="hidden sm:inline">{s.short}</span>
            </button>
          );
        })}
      </div>

      {/* Konten step aktif */}
      <Card>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${c.icon}`}>{step.emoji}</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {active === 0 ? 'Pengenalan' : `Langkah ${active} dari ${STEPS.length - 1}`}
            </p>
            <h2 className="text-xl font-bold text-slate-900">{step.title}</h2>
          </div>
        </div>

        <StepContent step={step} />

        {/* Navigasi */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActive((p) => p - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Sebelumnya
          </button>
          <span className="text-xs text-slate-400 font-medium">{active + 1} / {STEPS.length}</span>
          {isLast ? (
            <Link to="/dashboard" className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
              Mulai pakai {APP_NAME} 🚀
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setActive((p) => p + 1)}
              className={`flex items-center gap-2 rounded-lg ${c.badge} px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity`}
            >
              Lanjut →
            </button>
          )}
        </div>
      </Card>

      {/* Quick jump grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STEPS.map((s, i) => {
          const sc = COLOR[s.color];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={[
                'flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-sm',
                i === active ? `${sc.border} ${sc.bg} ring-2 ${sc.ring}` : 'border-slate-200 bg-white hover:border-slate-300',
              ].join(' ')}
            >
              <span className="text-xl shrink-0">{s.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{i === 0 ? 'Intro' : `Langkah ${i}`}</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{s.short}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
