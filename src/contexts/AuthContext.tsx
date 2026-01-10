import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, AuthChangeEvent } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  phone: string | null;
  full_name: string;
  full_name_ar: string | null;
  avatar_url: string | null;
  bio: string | null;
  bio_ar: string | null;
  date_of_birth: string | null;
  gender: string | null;
  city: string | null;
  country: string;
  phone_verified: boolean;
  email_verified: boolean;
  is_verified: boolean;
  verification_level: number;
  total_trips: number;
  trips_as_driver: number;
  trips_as_passenger: number;
  rating_as_driver: number;
  rating_as_passenger: number;
  total_ratings_received: number;
  smoking_allowed: boolean;
  pets_allowed: boolean;
  music_allowed: boolean;
  conversation_level: string | null;
  preferred_temperature: string | null;
  language: string;
  currency: string;
  notification_enabled: boolean;
  location_sharing_enabled: boolean;
  wallet_balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
  last_active_at: string;
  deleted_at: string | null;
  onboarding_completed_steps?: number[];
  onboarding_current_step?: number;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithFacebook: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  // Create initial profile for new users
  const createProfile = async (user: User, fullName: string, phone?: string) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: fullName,
        phone: phone || null,
        country: 'UAE',
        phone_verified: false,
        email_verified: false,
        is_verified: false,
        verification_level: 0,
        total_trips: 0,
        trips_as_driver: 0,
        trips_as_passenger: 0,
        rating_as_driver: 0.0,
        rating_as_passenger: 0.0,
        total_ratings_received: 0,
        smoking_allowed: false,
        pets_allowed: false,
        music_allowed: true,
        language: 'en',
        currency: 'AED',
        notification_enabled: true,
        location_sharing_enabled: true,
        wallet_balance: 0.0,
        total_earned: 0.0,
        total_spent: 0.0,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        let userProfile = await fetchProfile(session.user.id);

        // If no profile exists, create one
        if (!userProfile) {
          userProfile = await createProfile(session.user, session.user.user_metadata?.full_name || 'User', session.user.user_metadata?.phone);
        }

        setProfile(userProfile);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          let userProfile = await fetchProfile(session.user.id);

          // Create profile if it doesn't exist
          if (!userProfile && event === 'SIGNED_IN') {
            userProfile = await createProfile(
              session.user,
              session.user.user_metadata?.full_name || 'User',
              session.user.user_metadata?.phone
            );
          }

          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) {
        return { error };
      }

      // Profile will be created automatically via the auth state change listener
      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    const userProfile = await fetchProfile(user.id);
    setProfile(userProfile);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
