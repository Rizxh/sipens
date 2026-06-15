import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

export default function ProtectedRoute({ requireAdmin = true }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat sesi...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
