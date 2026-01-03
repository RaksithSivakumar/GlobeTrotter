'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(url && key && url !== '' && key !== '' && !url.includes('placeholder'));
};

// Dummy mode - use localStorage for mock auth
const DUMMY_AUTH_KEY = 'dummy_auth_user';
const DUMMY_PROFILE_KEY = 'dummy_auth_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [useDummyAuth, setUseDummyAuth] = useState(false);

  const fetchProfile = async (userId: string, isDummy: boolean = false) => {
    if (isDummy || useDummyAuth) {
      const stored = localStorage.getItem(DUMMY_PROFILE_KEY);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
      return;
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  // Initialize auth - check for dummy mode or real Supabase
  useEffect(() => {
    const configured = isSupabaseConfigured();
    
    if (!configured) {
      // Use dummy auth
      setUseDummyAuth(true);
      const storedUser = localStorage.getItem(DUMMY_AUTH_KEY);
      const storedProfile = localStorage.getItem(DUMMY_PROFILE_KEY);
      
      if (storedUser && storedProfile) {
        setUser(JSON.parse(storedUser));
        setProfile(JSON.parse(storedProfile));
        // Create a mock session
        setSession({
          access_token: 'dummy_token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          refresh_token: 'dummy_refresh',
          user: JSON.parse(storedUser),
        } as Session);
      }
      setLoading(false);
      return;
    }

    // Use real Supabase
    setUseDummyAuth(false);
    let subscription: { unsubscribe: () => void } | null = null;
    
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id, false);
        }
        setLoading(false);
      }).catch(() => {
        // If Supabase fails, fall back to dummy mode
        setUseDummyAuth(true);
        setLoading(false);
      });

      const { data } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id, false);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      );
      subscription = data;
    } catch (error) {
      // If Supabase fails to initialize, use dummy mode
      setUseDummyAuth(true);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    if (useDummyAuth) {
      // Create dummy user
      const dummyUser: User = {
        id: `dummy_${Date.now()}`,
        email: email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { full_name: fullName },
        aud: 'authenticated',
        confirmation_sent_at: null,
        recovery_sent_at: null,
        email_confirmed_at: new Date().toISOString(),
        invited_at: null,
        last_sign_in_at: new Date().toISOString(),
        phone: null,
        confirmed_at: new Date().toISOString(),
        email_change_sent_at: null,
        new_email: null,
        phone_confirmed_at: null,
        phone_change: null,
        phone_change_token: null,
        email_change: null,
        email_change_token: null,
        is_anonymous: false,
      };

      const dummyProfile: Profile = {
        id: dummyUser.id,
        email: email,
        full_name: fullName,
        avatar_url: null,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(DUMMY_AUTH_KEY, JSON.stringify(dummyUser));
      localStorage.setItem(DUMMY_PROFILE_KEY, JSON.stringify(dummyProfile));

      setUser(dummyUser);
      setProfile(dummyProfile);
      setSession({
        access_token: 'dummy_token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        refresh_token: 'dummy_refresh',
        user: dummyUser,
      } as Session);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        });
      }
    } catch (error: any) {
      // If Supabase fails (network error, etc.), fall back to dummy mode
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setUseDummyAuth(true);
        await signUp(email, password, fullName); // Recursively call with dummy mode
        return;
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    // Mock authentication for demo purposes
    const mockCredentials = {
      email: 'demo@globetrotter.com',
      password: 'demo123',
    };

    if (email === mockCredentials.email && password === mockCredentials.password) {
      // Create mock user and profile
      const mockUser = {
        id: 'mock-user-id-123',
        email: mockCredentials.email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: undefined,
        recovery_sent_at: undefined,
        email_confirmed_at: new Date().toISOString(),
        invited_at: undefined,
        action_link: undefined,
        phone: undefined,
        phone_confirmed_at: undefined,
        phone_confirmed: false,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString(),
        identities: [],
        factors: undefined,
        is_anonymous: false,
      } as User;

      const mockProfile: Profile = {
        id: mockUser.id,
        email: mockUser.email!,
        full_name: 'Demo User',
        avatar_url: null,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSession = {
        access_token: 'mock-access-token',
        token_type: 'bearer' as const,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: mockUser,
      } as Session;

      setUser(mockUser);
      setProfile(mockProfile);
      setSession(mockSession);
      return;
    }

    // Fallback to real Supabase auth for other credentials
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

      if (storedUser && storedProfile) {
        const user = JSON.parse(storedUser);
        const profile = JSON.parse(storedProfile);
        
        // Update email if different
        if (user.email !== email) {
          user.email = email;
          profile.email = email;
          localStorage.setItem(DUMMY_AUTH_KEY, JSON.stringify(user));
          localStorage.setItem(DUMMY_PROFILE_KEY, JSON.stringify(profile));
        }

        setUser(user);
        setProfile(profile);
        setSession({
          access_token: 'dummy_token',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          refresh_token: 'dummy_refresh',
          user: user,
        } as Session);
      } else {
        // Create new dummy user
        await signUp(email, password, email.split('@')[0]);
      }
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      // If Supabase fails (network error, etc.), fall back to dummy mode
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setUseDummyAuth(true);
        await signIn(email, password); // Recursively call with dummy mode
        return;
      }
      throw error;
    }
  };

  const signOut = async () => {
    // Check if it's a mock user
    if (user?.id === 'mock-user-id-123') {
      setUser(null);
      setProfile(null);
      setSession(null);
      return;
    }
    
    // Fallback to real Supabase auth
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
