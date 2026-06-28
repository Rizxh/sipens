import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { formatPeriod, formatPeriodLabel } from '../lib/supabase';
import { Icon, RankIcon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PageHeader from '../components/ui/PageHeader';

const quickActions = [
  {
    to: '/criteria',
    title: 'Kriteria',
    description: 'Kelola kriteria penilaian',
    icon: 'criteria',
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50 border-violet-200',
    step: 1,
  },
  {
    to: '/ahp',
    title: 'AHP Bobot',
    description: 'Matriks perbandingan berpasangan',
    icon: 'ahp',
    gradient: 'from-blue-500 to-indigo-600',
    light: 'bg-blue-50 border-blue-200',
    step: 2,
  },
  {
    to: '/sales',
    title: 'Data Sales',
    description: 'Input nilai aktual per periode',
    icon: 'sales',
    gradient: 'from-teal-500 to-emerald-600',
    light: 'bg-teal-50 border-teal-200',
    step: 3,
  },
  {
    to: '/wp-result',
    title: 'Hasil WP',
    description: 'Ranking & sales terbaik',
    icon: 'wpResult',
    gradient: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50 border-amber-200',
    step: 4,
  },
  {
    to: '/tutorial',
    title: 'Tutorial',
    description: 'Panduan cara pakai SIPENS',
    icon: 'tutorial',
    gradient: 'from-rose-500 to-pink-600',
    light: 'bg-rose-50 border-rose-200',
    step: null,
  },
];

const rankStyles = {
  1: 'bg-amber-100 text-amber-800 border-amber-200',
  2: 'bg-slate-200 text-slate-700 border-slate-300',
  3: 'bg-orange-100 text-orange-800 border-orange-200',
};

export default function Dashboard() {
  const { profile } = useAuth();
  const { stats, loading, error, refetch } = useDashboardStats();
  const currentPeriod = formatPeriod();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${profile?.full_name || profile?.email}`}
      >
        <Button variant="secondary" size="sm" onClick={refetch}>
          Refresh
        </Button>
      </PageHeader>

      {error && (
        <Alert variant="error">
          {error}
          <button
            type="button"
            onClick={refetch}
            className="ml-2 underline font-medium"
          >
            Coba lagi
          </button>
        </Alert>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Sales Aktif"
          value={stats.salesCount}
          icon="users"
          accent="brand"
        />
        <StatCard
          label="Kriteria Aktif"
          value={stats.criteriaCount}
          icon="criteria"
          accent="brand"
        />
        <StatCard
          label="Periode Penilaian Terakhir"
          value={stats.lastPeriodLabel ?? 'Belum ada'}
          icon="calendar"
          accent={stats.lastPeriod ? 'brand' : 'muted'}
          subtext={stats.lastPeriod ? stats.lastPeriod : 'Input data penilaian terlebih dahulu'}
        />
        <StatCard
          label="Periode Berjalan"
          value={formatPeriodLabel(currentPeriod)}
          icon="calendarDays"
          accent="success"
          subtext={currentPeriod}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 sm:mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Top 3 Sales Terbaik
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {stats.lastPeriodLabel
                  ? `Periode ${stats.lastPeriodLabel}`
                  : 'Belum ada hasil perankingan'}
              </p>
            </div>
            {stats.hasWpResults && (
              <Link
                to="/wp-result"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Lihat semua →
              </Link>
            )}
          </div>

          {!stats.hasWpResults ? (
            <EmptyTopSales />
          ) : (
            <div className="space-y-3">
              {stats.topSales.map((sales) => (
                <div
                  key={`${sales.salesId}-${sales.rank}`}
                  className={[
                    'flex items-center gap-3 sm:gap-4 rounded-xl border p-3 sm:p-4 transition-colors',
                    sales.rank === 1
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
                      rankStyles[sales.rank] ?? 'bg-slate-100 text-slate-600 border-slate-200',
                    ].join(' ')}
                  >
                    <RankIcon rank={sales.rank} className="w-5 h-5" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">
                        {sales.name}
                      </p>
                      {sales.rank === 1 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-900">
                          <Icon name="star" className="w-3 h-3" />
                          Sales Terbaik
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{sales.employeeId}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-brand-700">
                      {(sales.vValue * 100).toFixed(2)}%
                    </p>
                    <p className="text-xs text-slate-500">
                      Rank #{sales.rank}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Menu Utama</h2>
          <div className="grid grid-cols-1 gap-2.5">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm`}>
                  <Icon name={action.icon} className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-700 transition-colors">
                      {action.title}
                    </p>
                    {action.step && (
                      <span className="text-[10px] rounded-full bg-slate-100 text-slate-500 px-1.5 py-0.5 font-semibold">
                        Langkah {action.step}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{action.description}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-brand-500 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          Alur Penilaian
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { step: 1, label: 'Kriteria', desc: 'Pastikan kriteria aktif' },
            { step: 2, label: 'AHP', desc: 'Hitung bobot (CR ≤ 0.1)' },
            { step: 3, label: 'Nilai Sales', desc: 'Input skor per periode' },
            { step: 4, label: 'WP Ranking', desc: 'Generate & simpan hasil' },
          ].map((item) => (
            <div
              key={item.step}
              className="relative rounded-lg bg-slate-50 border border-slate-200 p-4"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white text-xs font-bold">
                {item.step}
              </span>
              <p className="font-medium text-slate-900 mt-2">{item.label}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon, accent = 'brand', subtext }) {
  const accents = {
    brand: 'border-brand-100 bg-brand-50',
    success: 'border-emerald-100 bg-emerald-50',
    muted: 'border-slate-200 bg-slate-50',
  };

  const valueColors = {
    brand: 'text-brand-800',
    success: 'text-emerald-700',
    muted: 'text-slate-600',
  };

  const iconColors = {
    brand: 'text-brand-600',
    success: 'text-emerald-600',
    muted: 'text-slate-400',
  };

  return (
    <div className={`rounded-xl border p-4 sm:p-5 ${accents[accent] ?? accents.brand}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <Icon
          name={icon}
          className={`w-5 h-5 shrink-0 ${iconColors[accent] ?? iconColors.brand}`}
        />
      </div>
      <p
        className={`text-xl sm:text-2xl font-bold mt-2 ${valueColors[accent] ?? valueColors.brand}`}
      >
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-slate-500 mt-1 truncate">{subtext}</p>
      )}
    </div>
  );
}

function EmptyTopSales() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <Icon name="trophy" className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-700">
        Belum ada hasil perankingan
      </p>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        Lengkapi bobot AHP, input nilai sales, lalu jalankan perhitungan WP
        untuk melihat top 3 sales terbaik di sini.
      </p>
      <Link
        to="/wp-result"
        className="inline-block mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Ke Hasil WP →
      </Link>
    </div>
  );
}
