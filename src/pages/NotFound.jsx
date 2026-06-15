import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-brand-200">404</p>
      <h1 className="text-xl font-semibold text-slate-900 mt-2">Halaman tidak ditemukan</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">
        URL yang Anda akses tidak tersedia.
      </p>
      <Link
        to="/dashboard"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
