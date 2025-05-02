import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: Session | null;
  }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{
    error: Error | null;
    data: { user: User | null; session: Session | null };
  }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: {} | null;
  }>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if email is verified - Google OAuth users are auto-verified
        if (session?.user) {
          const isOAuthUser = session.user.app_metadata?.provider === 'google';
          const emailVerified = session.user.email_confirmed_at || isOAuthUser;
          setIsEmailVerified(!!emailVerified);
        } else {
          setIsEmailVerified(false);
        }
        
        // Show appropriate toast notifications for auth events
        if (event === 'SIGNED_IN') {
          toast.success("Signed in successfully!");
        } else if (event === 'SIGNED_OUT') {
          toast.success("Signed out successfully");
        } else if (event === 'USER_UPDATED') {
          toast.success("User profile updated");
        } else if (event === 'PASSWORD_RECOVERY') {
          toast.success("Password recovery email sent");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if email is verified for existing session
      if (session?.user) {
        const isOAuthUser = session.user.app_metadata?.provider === 'google';
        const emailVerified = session.user.email_confirmed_at || isOAuthUser;
        setIsEmailVerified(!!emailVerified);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Check if email has been verified
      const isOAuthUser = data.user?.app_metadata?.provider === 'google';
      const emailVerified = data.user?.email_confirmed_at || isOAuthUser;
      
      if (!emailVerified) {
        // Sign out the user if email is not verified
        await supabase.auth.signOut();
        throw new Error("Please verify your email before signing in. Check your inbox for a verification link.");
      }
      
      return { data: data.session, error: null };
    } catch (error) {
      console.error("Error signing in:", error);
      return { data: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin + '/auth',
        },
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error signing up:", error);
      return { 
        data: { user: null, session: null }, 
        error: error as Error 
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/home',
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth',
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { data: null, error: error as Error };
    }
  };

  const value = {
    session,
    user,
    isEmailVerified,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};
