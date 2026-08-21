import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/icons';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MODES = {
  signin: { submit: 'Masuk' },
  signup: { submit: 'Buat Akun' },
};

const inputCompact =
  '[&_label]:mb-1 [&_label]:text-xs [&_input]:py-1.5 [&_input]:text-sm';

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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (loading) {
    return (
      <div className="h-dvh overflow-hidden flex flex-col items-center justify-center gap-2 bg-slate-50">
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
    <div className="h-dvh overflow-hidden bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[360px]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shrink-0">
              <Icon name="logo" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                SIPENS  
              </h1>
              <p className="text-slate-500 text-sm leading-snug truncate">
                Penilaian & Nominasi Sales Terbaik
              </p>
            </div>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-0.5 mb-4">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={[
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
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
                'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700',
              ].join(' ')}
            >
              Daftar
            </button>
          </div>

          {formError && (
            <Alert variant="error" className="mb-3 px-3 py-2 text-xs">
              {formError}
            </Alert>
          )}
          {formInfo && (
            <Alert variant="info" className="mb-3 px-3 py-2 text-xs">
              {formInfo}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
            {mode === 'signup' && (
              <Input
                className={inputCompact}
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
              className={inputCompact}
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
              className={inputCompact}
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

            <Button type="submit" className="w-full mt-1" size="md" loading={submitting}>
              {copy.submit}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-3">
          AHP & Weighted Product
        </p>
      </div>
    </div>
  );
}
