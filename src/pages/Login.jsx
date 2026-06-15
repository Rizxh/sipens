import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MODES = {
  signin: {
    title: 'Masuk',
    subtitle: 'Masuk ke dashboard penilaian sales',
    submit: 'Masuk',
  },
  signup: {
    title: 'Daftar',
    subtitle: 'Buat akun admin untuk SIPENS',
    submit: 'Buat Akun',
  },
};

export default function Login() {
  const { signIn, signUp, loading, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from || '/dashboard';
  const copy = MODES[mode];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500">Memuat...</p>
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to={from} replace />;
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setFormError('');
    setFormInfo('');
    setFieldErrors({});
  }

  function validate() {
    const errors = {};

    if (mode === 'signup' && !fullName.trim()) {
      errors.fullName = 'Nama lengkap wajib diisi';
    }

    if (!email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!password) {
      errors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setFormInfo('');

    if (!validate()) return;

    setSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        navigate(from, { replace: true });
      } else {
        const result = await signUp(email, password, fullName);

        if (result.needsEmailConfirmation) {
          setFormInfo(result.message);
          switchMode('signin');
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setFormError(err.message ?? 'Gagal memproses permintaan.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-600 text-white mb-4 shadow-sm">
            <Icon name="logo" className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SIPENS</h1>
          <p className="text-slate-500 text-base mt-1.5">Penilaian & Nominasi Sales Terbaik</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={[
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={[
                'flex-1 rounded-md py-2 text-sm font-medium transition-all',
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              Daftar
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">{copy.title}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{copy.subtitle}</p>
          </div>

          {formError && <Alert variant="error" className="mb-4">{formError}</Alert>}
          {formInfo && <Alert variant="info" className="mb-4">{formInfo}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <Input
                label="Nama Lengkap"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Nama Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={fieldErrors.fullName}
                disabled={submitting}
              />
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete={mode === 'signin' ? 'email' : 'username'}
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              disabled={submitting}
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="Min. 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              disabled={submitting}
            />

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              {copy.submit}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            {copy.toggle}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-brand-600 font-medium hover:text-brand-700 hover:underline"
            >
              {copy.toggleAction}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          AHP & Weighted Product · Dashboard Internal
        </p>
      </div>
    </div>
  );
}
