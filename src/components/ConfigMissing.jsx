export default function ConfigMissing() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900">Konfigurasi belum lengkap</h1>
        <p className="text-slate-600 mt-2 text-sm leading-relaxed">
          Variabel lingkungan Supabase belum diset saat build. Tanpa ini aplikasi tidak bisa
          berjalan di production.
        </p>

        <div className="mt-5 rounded-lg bg-slate-100 p-4 text-sm font-mono text-slate-800 space-y-1">
          <p>VITE_SUPABASE_URL</p>
          <p>VITE_SUPABASE_ANON_KEY</p>
        </div>

        <ol className="mt-5 text-sm text-slate-600 space-y-2 list-decimal list-inside">
          <li>Buka Vercel → Project → Settings → Environment Variables</li>
          <li>Tambahkan kedua variabel di atas (Production, Preview, Development)</li>
          <li>Redeploy project (Deployments → ⋯ → Redeploy)</li>
        </ol>

        <p className="mt-5 text-xs text-slate-400">
          Vite menyematkan env saat build — setelah menambah variabel, wajib deploy ulang.
        </p>
      </div>
    </div>
  );
}
