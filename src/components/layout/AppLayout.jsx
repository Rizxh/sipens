import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon, navItems } from '../icons';
import Button from '../ui/Button';

export default function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-brand-900 text-white">
      <div className="px-6 py-5 border-b border-brand-800">
        <div className="flex items-center gap-2">
          <Icon name="logo" className="w-6 h-6 text-brand-200" />
          <h1 className="text-xl font-bold tracking-tight">SIPENS</h1>
        </div>
        <p className="text-brand-200 text-sm mt-1.5 leading-snug">
          Penilaian &amp; Nominasi Sales Terbaik
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-100 hover:bg-brand-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon name={item.icon} className="w-5 h-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-brand-800">
        <div className="mb-3 px-1">
          <p className="text-sm font-medium truncate">
            {profile?.full_name || 'Admin'}
          </p>
          <p className="text-xs text-brand-300 truncate">{profile?.email}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full text-slate-700!"
          onClick={handleSignOut}
        >
          Keluar
        </Button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between bg-brand-900 text-white px-4 py-3 shadow-md">
      <div className="flex items-center gap-2">
        <Icon name="logo" className="w-5 h-5 text-brand-200" />
        <div>
          <p className="font-bold">SIPENS</p>
          <p className="text-xs text-brand-200 truncate max-w-[200px]">
            {profile?.email}
          </p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={handleSignOut}>
        Keluar
      </Button>
    </header>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64">
        <MobileHeader />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
