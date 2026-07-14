import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { useToast } from './useToast';

type AuthContextValue = {
  user: any | null;
  profile: { full_name?: string; role?: string } | null;
  loading: boolean;
  refreshProfile: (userId?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_name, role').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (data) setProfile(data as any);
      else setProfile(null);
    } catch (err: any) {
      console.error('Error fetching profile', err);
      showToast?.('Failed to load profile', 'error');
      setProfile(null);
    }
  };

  const refreshProfile = async (userId?: string) => {
    const id = userId ?? user?.id;
    if (!id) return;
    await fetchProfile(id);
  };

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
