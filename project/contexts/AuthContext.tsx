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
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, additionalData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    country?: string;
    avatarUrl?: string;
    additionalInfo?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'admin@globetrotter.com',
    password: 'admin123',
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Check localStorage for cached user data first
    try {
      const cachedUser = localStorage.getItem('globetrotter_user');
      const cachedProfile = localStorage.getItem('globetrotter_profile');
      const cachedSession = localStorage.getItem('globetrotter_session');
      const cachedIsAdmin = localStorage.getItem('globetrotter_is_admin');

      if (cachedUser && cachedProfile && cachedSession) {
        const user = JSON.parse(cachedUser);
        const profile = JSON.parse(cachedProfile);
        const session = JSON.parse(cachedSession);
        const isAdmin = cachedIsAdmin === 'true' || user.role === 'admin';
        
        setUser(user);
        setProfile(profile);
        setSession(session);
        setIsAdmin(isAdmin);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading cached user data:', error);
    }

    // Fallback to Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, additionalData?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
    country?: string;
    avatarUrl?: string;
    additionalInfo?: string;
  }) => {
    // For demo purposes, create a mock user similar to signIn
    // In production, you would use Supabase auth
    const mockUserId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const mockUser = {
      id: mockUserId,
      email: email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      confirmation_sent_at: undefined,
      recovery_sent_at: undefined,
      email_confirmed_at: new Date().toISOString(),
      invited_at: undefined,
      action_link: undefined,
      phone: additionalData?.phone || undefined,
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

    const fullNameFromData = additionalData?.firstName && additionalData?.lastName
      ? `${additionalData.firstName} ${additionalData.lastName}`
      : fullName;

    const mockProfile: Profile = {
      id: mockUser.id,
      email: mockUser.email!,
      full_name: fullNameFromData,
      avatar_url: additionalData?.avatarUrl || null,
      language: 'en',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSession = {
      access_token: `mock-access-token-${mockUserId}`,
      token_type: 'bearer' as const,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: `mock-refresh-token-${mockUserId}`,
      user: mockUser,
    } as Session;

    // Store extended user data in localStorage
    const extendedUserData = {
      ...additionalData,
      fullName: fullNameFromData,
      email: email,
      userId: mockUserId,
    };

    try {
      localStorage.setItem('globetrotter_user_data', JSON.stringify(extendedUserData));
      localStorage.setItem('globetrotter_user', JSON.stringify(mockUser));
      localStorage.setItem('globetrotter_profile', JSON.stringify(mockProfile));
      localStorage.setItem('globetrotter_session', JSON.stringify(mockSession));
    } catch (error) {
      console.error('Error storing user data:', error);
    }

    setUser(mockUser);
    setProfile(mockProfile);
    setSession(mockSession);
    setLoading(false);
  };

  const signIn = async (email: string, password: string): Promise<{ isAdmin: boolean }> => {
    // Check for admin credentials
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create admin user and profile
      const adminUser = {
        id: 'admin-user-id-456',
        email: ADMIN_CREDENTIALS.email,
        created_at: new Date().toISOString(),
        app_metadata: { role: 'admin' },
        user_metadata: { role: 'admin' },
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
        role: 'admin',
        updated_at: new Date().toISOString(),
        identities: [],
        factors: undefined,
        is_anonymous: false,
      } as User;

      const adminProfile: Profile = {
        id: adminUser.id,
        email: adminUser.email!,
        full_name: 'Admin User',
        avatar_url: null,
        language: 'en',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const adminSession = {
        access_token: 'admin-access-token',
        token_type: 'bearer' as const,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'admin-refresh-token',
        user: adminUser,
      } as Session;

      // Store in localStorage
      try {
        localStorage.setItem('globetrotter_user', JSON.stringify(adminUser));
        localStorage.setItem('globetrotter_profile', JSON.stringify(adminProfile));
        localStorage.setItem('globetrotter_session', JSON.stringify(adminSession));
        localStorage.setItem('globetrotter_is_admin', 'true');
      } catch (error) {
        console.error('Error storing admin data:', error);
      }

      setUser(adminUser);
      setProfile(adminProfile);
      setSession(adminSession);
      setIsAdmin(true);
      return { isAdmin: true };
    }

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

      // Store in localStorage
      try {
        localStorage.setItem('globetrotter_user', JSON.stringify(mockUser));
        localStorage.setItem('globetrotter_profile', JSON.stringify(mockProfile));
        localStorage.setItem('globetrotter_session', JSON.stringify(mockSession));
        localStorage.removeItem('globetrotter_is_admin');
      } catch (error) {
        console.error('Error storing user data:', error);
      }

      setUser(mockUser);
      setProfile(mockProfile);
      setSession(mockSession);
      setIsAdmin(false);
      return { isAdmin: false };
    }

    // Fallback to real Supabase auth for other credentials
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    setIsAdmin(false);
    return { isAdmin: false };
  };

  const signOut = async () => {
    // Clear localStorage
    try {
      localStorage.removeItem('globetrotter_user_data');
      localStorage.removeItem('globetrotter_user');
      localStorage.removeItem('globetrotter_profile');
      localStorage.removeItem('globetrotter_session');
      localStorage.removeItem('globetrotter_is_admin');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }

    // Check if it's a mock user or admin
    if (user?.id === 'mock-user-id-123' || user?.id === 'admin-user-id-456' || user?.id?.startsWith('user-')) {
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsAdmin(false);
      return;
    }
    
    // Fallback to real Supabase auth
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
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