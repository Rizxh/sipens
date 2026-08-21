import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icon, navItems } from '../icons';
import Button from '../ui/Button';
import { APP_NAME, APP_TAGLINE } from '../../config/app';

function navLinkClass(isActive, compact = false) {
  return [
    'flex items-center rounded-lg font-medium transition-colors',
    compact
      ? 'flex-col gap-0.5 justify-center px-0.5 py-2 text-[10px] leading-tight min-w-0'
      : 'gap-3 px-3 py-2.5 text-sm',
    isActive
      ? compact
        ? 'text-brand-600 bg-brand-50'
        : 'bg-brand-700 text-white'
      : compact
        ? 'text-slate-500 hover:text-brand-600'
        : 'text-brand-100 hover:bg-brand-800 hover:text-white',
  ].join(' ');
}

function SidebarNav({ compact = false, onNavigate }) {
  return (
    <nav className={compact ? 'space-y-1' : 'flex-1 px-3 py-4 space-y-1 overflow-y-auto'}>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          title={item.label}
          className={({ isActive }) =>
            [
              navLinkClass(isActive, compact),
              !compact && 'md:justify-center lg:justify-start',
            ].join(' ')
          }
        >
          <Icon name={item.icon} className="w-5 h-5 shrink-0" />
          <span
            className={
              compact
                ? 'truncate w-full text-center'
                : 'hidden lg:inline truncate'
            }
          >
            {item.label}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}

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
    <aside className="hidden md:flex md:w-18 lg:w-64 md:flex-col md:fixed md:inset-y-0 bg-brand-900 text-white z-30">
      <div className="px-3 lg:px-6 py-4 lg:py-5 border-b border-brand-800">
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <Icon name="logo" className="w-6 h-6 text-brand-200 shrink-0" />
          <h1 className="hidden lg:block text-xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        <p className="hidden lg:block text-brand-200 text-sm mt-1.5 leading-snug">
          {APP_TAGLINE}
        </p>
      </div>

      <SidebarNav />

      <div className="hidden md:flex lg:hidden mt-auto px-2 py-3 border-t border-brand-800 flex-col items-center">
        <button
          type="button"
          onClick={handleSignOut}
          title="Keluar"
          className="w-full flex items-center justify-center rounded-lg p-2.5 text-brand-200 hover:bg-brand-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      <div className="hidden lg:block px-4 py-4 border-t border-brand-800 mt-auto">
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

function MobileDrawer({ open, onClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  async function handleSignOut() {
    onClose();
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      navigate('/login', { replace: true });
    }
  }

  if (!open) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Tutup menu"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 left-0 w-[min(100%,280px)] bg-brand-900 text-white flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-brand-800">
          <div className="flex items-center gap-2 min-w-0">
            <Icon name="logo" className="w-6 h-6 text-brand-200 shrink-0" />
            <div className="min-w-0">
              <p className="font-bold">{APP_NAME}</p>
              <p className="text-xs text-brand-300 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-brand-200 hover:bg-brand-800"
            aria-label="Tutup"
          >
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <SidebarNav onNavigate={onClose} />

        <div className="mt-auto px-4 py-4 border-t border-brand-800">
          <p className="text-sm font-medium truncate mb-3">
            {profile?.full_name || 'Admin'}
          </p>
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
    </div>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
    >
      <div className="grid grid-cols-7 gap-0 px-0.5 pt-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to
            || (item.to === '/dashboard' && location.pathname === '/');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={navLinkClass(isActive, true)}
            >
              <Icon name={item.icon} className="w-5 h-5 shrink-0" />
              <span className="truncate w-full text-center px-0.5">
                {item.shortLabel ?? item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileHeader({ onMenuOpen }) {
  const location = useLocation();
  const currentPage = navItems.find((item) => item.to === location.pathname);

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center gap-3 bg-brand-900 text-white px-4 py-3 shadow-md">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-lg p-2 -ml-1 text-brand-100 hover:bg-brand-800"
        aria-label="Buka menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Icon name="logo" className="w-5 h-5 text-brand-200 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold leading-tight">{APP_NAME}</p>
          <p className="text-xs text-brand-200 truncate">
            {currentPage?.label ?? 'Dashboard'}
          </p>
        </div>
      </div>
    </header>
  );
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <BottomNav />

      <div className="md:pl-18 lg:pl-64 pb-[4.75rem] md:pb-0 min-h-screen flex flex-col">
        <MobileHeader onMenuOpen={() => setDrawerOpen(true)} />
        <main className="flex-1 p-3 sm:p-5 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
