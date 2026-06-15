import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ConfigMissing from './components/ConfigMissing';
import { AppLayout } from './components/layout/AppLayout';
import { isSupabaseConfigured } from './lib/supabase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Criteria from './pages/Criteria';
import AHP from './pages/AHP';
import SalesData from './pages/SalesData';
import WPResult from './pages/WPResult';
import History from './pages/History';
import NotFound from './pages/NotFound';

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigMissing />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="criteria" element={<Criteria />} />
              <Route path="ahp" element={<AHP />} />
              <Route path="sales" element={<SalesData />} />
              <Route path="wp-result" element={<WPResult />} />
              <Route path="history" element={<History />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
