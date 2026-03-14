import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Profile = {
  displayName: string | null;
  preferredGenres: string[];
  therapyGoals: string[];
  onboardingComplete: boolean;
};

type OnboardingData = {
  displayName: string;
  preferredGenres: string[];
  therapyGoals: string[];
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  profile: Profile | null;
  onboardingComplete: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  async function loadProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, preferred_genres, therapy_goals, onboarding_complete')
      .eq('id', userId)
      .single();
    if (data) {
      setProfile({
        displayName: data.display_name,
        preferredGenres: data.preferred_genres ?? [],
        therapyGoals: data.therapy_goals ?? [],
        onboardingComplete: data.onboarding_complete ?? false,
      });
    }
  }

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        await loadProfile(session.user.id);
      }
      setIsLoading(false);
    }
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }

  async function signOut() {
    setProfile(null);
    await supabase.auth.signOut();
  }

  async function completeOnboarding(data: OnboardingData) {
    if (!session?.user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: data.displayName,
        preferred_genres: data.preferredGenres,
        therapy_goals: data.therapyGoals,
        onboarding_complete: true,
      })
      .eq('id', session.user.id);

    if (!error) {
      setProfile({
        displayName: data.displayName,
        preferredGenres: data.preferredGenres,
        therapyGoals: data.therapyGoals,
        onboardingComplete: true,
      });
    }

    return { error };
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        profile,
        onboardingComplete: profile?.onboardingComplete ?? false,
        signIn,
        signUp,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
