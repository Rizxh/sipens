import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, getCurrentProfile } from '../lib/supabase';

const AuthContext = createContext(null);

function mapAuthError(error) {
  const msg = error?.message ?? '';

  if (msg === 'Invalid login credentials') {
    return 'Email atau password salah';
  }
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'Email sudah terdaftar. Silakan masuk.';
  }
  if (msg.includes('rate limit')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Password minimal 6 karakter';
  }

  return msg || 'Terjadi kesalahan autentikasi';
}

async function validateAdminProfile(fetchProfile) {
  const userProfile = await fetchProfile();

  if (!userProfile) {
    await supabase.auth.signOut();
    throw new Error('Profil admin tidak ditemukan. Hubungi administrator.');
  }

  if (userProfile.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('Akun tidak memiliki akses admin.');
  }

  return userProfile;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const { data, error: profileError } = await getCurrentProfile();

    if (profileError) {
      setProfile(null);
      setError(profileError.message);
      return null;
    }

    setProfile(data);
    setError(null);
    return data;
  }, []);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          await fetchProfile();
        }
      } catch (err) {
        if (mounted) {
          setError(err.message ?? 'Gagal memuat sesi');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile();
        } else {
          setProfile(null);
          setError(null);
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    setError(null);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      throw new Error(mapAuthError(signInError));
    }

    await validateAdminProfile(fetchProfile);
    return data;
  }, [fetchProfile]);

  const signUp = useCallback(async (email, password, fullName = '') => {
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim() || email.trim().split('@')[0],
        },
      },
    });

    if (signUpError) {
      throw new Error(mapAuthError(signUpError));
    }

    if (!data.session) {
      return {
        needsEmailConfirmation: true,
        message: 'Registrasi berhasil. Cek email untuk konfirmasi, lalu masuk.',
      };
    }

    await validateAdminProfile(fetchProfile);
    return { needsEmailConfirmation: false, data };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      throw new Error(signOutError.message);
    }

    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      error,
      isAuthenticated: Boolean(session?.user),
      isAdmin: profile?.role === 'admin',
      signIn,
      signUp,
      signOut,
      refreshProfile: fetchProfile,
    }),
    [session, user, profile, loading, error, signIn, signUp, signOut, fetchProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }

  return context;
}
