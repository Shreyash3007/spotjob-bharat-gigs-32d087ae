import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useToast } from "@/components/ui/use-toast";

interface AuthUser {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  photoURL?: string;
  provider: "phone" | "google" | "truecaller" | "whatsapp" | "magiclink";
  lastLogin: Date;
}

interface AuthError {
  code: string;
  message: string;
}

interface AuthResult {
  user?: AuthUser;
  error?: AuthError;
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  hasAttemptedLogin: boolean;
  
  // Phone auth
  sendOTP: (phone: string) => Promise<AuthResult>;
  verifyOTP: (phone: string, otp: string) => Promise<AuthResult>;
  resendOTP: (phone: string) => Promise<AuthResult>;
  
  // Federated auth
  loginWithGoogle: () => Promise<AuthResult>;
  loginWithTruecaller: () => Promise<AuthResult>;
  loginWithWhatsApp: () => Promise<AuthResult>;
  
  // Magic link auth
  sendMagicLink: (email: string) => Promise<AuthResult>;
  
  // Biometric auth
  loginWithBiometrics: () => Promise<AuthResult>;
  isBiometricsAvailable: boolean;
  setupBiometrics: () => Promise<boolean>;
  
  // Session management
  logout: () => Promise<void>;
  
  // Advanced functions
  refreshSession: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

// Simulate API calls with random success/failure for demo
const simulateAPI = async <T>(
  successData: T, 
  failureRate = 0.1, 
  delay = 1000
): Promise<{data?: T, error?: AuthError}> => {
  await new Promise(resolve => setTimeout(resolve, delay));
  
  if (Math.random() < failureRate) {
    return {
      error: {
        code: "auth/network-error",
        message: "Network request failed. Please try again."
      }
    };
  }
  
  return { data: successData };
};

// Mock session timeout for security demonstration
const SESSION_TIMEOUT = 1000 * 60 * 60; // 1 hour

export function useAuth(): UseAuthReturn {
  const { toast } = useToast();
  const [user, setUser] = useLocalStorage<AuthUser | null>("auth_user", null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [sessionExpiry, setSessionExpiry] = useLocalStorage<number | null>("session_expiry", null);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  
  // Check for biometric availability on mount
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        // In a real app, check if the platform supports biometrics
        // For example using WebAuthn or platform-specific APIs
        const isAvailable = "PublicKeyCredential" in window;
        setIsBiometricsAvailable(isAvailable);
      } catch (error) {
        setIsBiometricsAvailable(false);
      }
    };
    
    checkBiometrics();
  }, []);
  
  // Session expiry check and auto-logout
  useEffect(() => {
    if (!user || !sessionExpiry) return;
    
    const checkSession = () => {
      const now = Date.now();
      if (now > sessionExpiry) {
        // Session expired
        logout();
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      }
    };
    
    // Check immediately and then periodically
    checkSession();
    const interval = setInterval(checkSession, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, sessionExpiry, toast]);
  
  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check for existing session
      try {
        // In a real app, verify token with backend
        if (user && sessionExpiry && Date.now() < sessionExpiry) {
          // Valid session exists
          setIsLoading(false);
          setHasAttemptedLogin(true);
        } else if (user) {
          // Session expired
          await logout();
          setIsLoading(false);
          setHasAttemptedLogin(true);
        } else {
          // No session
          setIsLoading(false);
          setHasAttemptedLogin(false);
        }
      } catch (error) {
        setUser(null);
        setSessionExpiry(null);
        setIsLoading(false);
        setHasAttemptedLogin(true);
      }
    };
    
    initAuth();
  }, []);
  
  // Helper to set authenticated session
  const setAuthenticated = useCallback((newUser: AuthUser) => {
    setUser(newUser);
    const expiry = Date.now() + SESSION_TIMEOUT;
    setSessionExpiry(expiry);
    setHasAttemptedLogin(true);
  }, [setUser, setSessionExpiry]);
  
  // Phone authentication methods
  const sendOTP = useCallback(async (phone: string): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Rate limiting check
      const lastAttempt = localStorage.getItem(`otp_last_attempt_${phone}`);
      const attemptsCount = parseInt(localStorage.getItem(`otp_attempts_${phone}`) || "0");
      
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        if (timeSinceLastAttempt < 60000 && attemptsCount > 2) { // 1 minute cooldown after 3 attempts
          return {
            error: {
              code: "auth/too-many-requests",
              message: "Too many attempts. Please try again later."
            }
          };
        }
      }
      
      // Update rate limiting data
      localStorage.setItem(`otp_last_attempt_${phone}`, Date.now().toString());
      localStorage.setItem(`otp_attempts_${phone}`, (attemptsCount + 1).toString());
      
      // Simulate API call to send OTP
      const result = await simulateAPI({ success: true });
      
      if (result.error) return { error: result.error };
      
      // Store the phone number for later verification
      localStorage.setItem("auth_pending_phone", phone);
      
      // Create OTP expiry (5 minutes)
      const otpExpiry = Date.now() + 5 * 60 * 1000;
      localStorage.setItem("otp_expiry", otpExpiry.toString());
      
      return { user: undefined };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to send OTP"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);
  
  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Check OTP expiry
      const otpExpiry = parseInt(localStorage.getItem("otp_expiry") || "0");
      if (Date.now() > otpExpiry) {
        return {
          error: {
            code: "auth/code-expired",
            message: "Verification code has expired. Please request a new one."
          }
        };
      }
      
      // Simulate OTP verification
      // In a real app, send the OTP to your backend for validation
      const result = await simulateAPI({
        id: "user_" + Math.random().toString(36).substr(2, 9),
        phone,
        provider: "phone" as const,
        lastLogin: new Date()
      });
      
      if (result.error) return { error: result.error };
      if (!result.data) {
        return {
          error: {
            code: "auth/invalid-verification-code",
            message: "Invalid verification code"
          }
        };
      }
      
      // Clear rate limiting and temp data
      localStorage.removeItem(`otp_last_attempt_${phone}`);
      localStorage.removeItem(`otp_attempts_${phone}`);
      localStorage.removeItem("auth_pending_phone");
      localStorage.removeItem("otp_expiry");
      
      // Set authenticated session
      setAuthenticated(result.data);
      
      return { user: result.data };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to verify OTP"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [setAuthenticated]);
  
  const resendOTP = useCallback(async (phone: string): Promise<AuthResult> => {
    return sendOTP(phone);
  }, [sendOTP]);
  
  // Federated authentication methods
  const loginWithGoogle = useCallback(async (): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Simulate Google authentication
      // In a real app, use Google Identity Services or Firebase Auth
      const result = await simulateAPI({
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email: "user@example.com",
        name: "Demo User",
        photoURL: "https://ui-avatars.com/api/?name=Demo+User",
        provider: "google" as const,
        lastLogin: new Date()
      });
      
      if (result.error) return { error: result.error };
      if (!result.data) {
        return {
          error: {
            code: "auth/cancelled-popup-request",
            message: "The authentication process was cancelled"
          }
        };
      }
      
      // Set authenticated session
      setAuthenticated(result.data);
      
      return { user: result.data };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to authenticate with Google"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [setAuthenticated]);
  
  const loginWithTruecaller = useCallback(async (): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Simulate Truecaller authentication
      // In a real app, implement the Truecaller JS SDK
      // Reference: https://developer.truecaller.com/truecaller-sdk
      const result = await simulateAPI({
        id: "user_" + Math.random().toString(36).substr(2, 9),
        phone: "+919876543210",
        name: "Truecaller User",
        photoURL: "https://ui-avatars.com/api/?name=Truecaller+User",
        provider: "truecaller" as const,
        lastLogin: new Date()
      });
      
      if (result.error) return { error: result.error };
      if (!result.data) {
        return {
          error: {
            code: "auth/truecaller-error",
            message: "Failed to authenticate with Truecaller"
          }
        };
      }
      
      // Set authenticated session
      setAuthenticated(result.data);
      
      return { user: result.data };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to authenticate with Truecaller"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [setAuthenticated]);
  
  const loginWithWhatsApp = useCallback(async (): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Simulate WhatsApp authentication
      // In a real app, implement WhatsApp Business API for authentication
      const result = await simulateAPI({
        id: "user_" + Math.random().toString(36).substr(2, 9),
        phone: "+919876543210",
        provider: "whatsapp" as const,
        lastLogin: new Date()
      });
      
      if (result.error) return { error: result.error };
      if (!result.data) {
        return {
          error: {
            code: "auth/whatsapp-error",
            message: "Failed to authenticate with WhatsApp"
          }
        };
      }
      
      // Set authenticated session
      setAuthenticated(result.data);
      
      return { user: result.data };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to authenticate with WhatsApp"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [setAuthenticated]);
  
  // Magic link authentication
  const sendMagicLink = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      setIsAuthenticating(true);
      
      // Simulate sending a magic link email
      // In a real app, email the user a link with a token
      const result = await simulateAPI({ success: true });
      
      if (result.error) return { error: result.error };
      
      // For demo, we'll simulate successful authentication immediately
      // In a real app, the user would click the link in their email
      const userData = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        email,
        provider: "magiclink" as const,
        lastLogin: new Date()
      };
      
      // Set authenticated session
      setAuthenticated(userData);
      
      return { user: userData };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to send magic link"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [setAuthenticated]);
  
  // Biometric authentication
  const setupBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      if (!isBiometricsAvailable || !user) return false;
      
      // Store user ID to associate with biometric credential
      localStorage.setItem("biometric_user", user.id);
      
      // In a real app, register a WebAuthn credential
      // For this demo, we'll simulate success
      return true;
    } catch (error) {
      return false;
    }
  }, [isBiometricsAvailable, user]);
  
  const loginWithBiometrics = useCallback(async (): Promise<AuthResult> => {
    try {
      if (!isBiometricsAvailable) {
        return {
          error: {
            code: "auth/biometric-not-available",
            message: "Biometric authentication is not available on this device"
          }
        };
      }
      
      setIsAuthenticating(true);
      
      // Check if biometrics are set up for a user
      const bioUserId = localStorage.getItem("biometric_user");
      if (!bioUserId) {
        return {
          error: {
            code: "auth/biometric-not-enrolled",
            message: "Biometric authentication has not been set up"
          }
        };
      }
      
      // Simulate biometric verification
      // In a real app, use WebAuthn to verify the user
      const result = await simulateAPI({
        id: bioUserId,
        provider: "phone" as const, // Assume original registration was via phone
        lastLogin: new Date()
      });
      
      if (result.error) return { error: result.error };
      if (!result.data) {
        return {
          error: {
            code: "auth/biometric-error",
            message: "Biometric authentication failed"
          }
        };
      }
      
      // Set authenticated session
      setAuthenticated(result.data);
      
      return { user: result.data };
    } catch (error: any) {
      return {
        error: {
          code: "auth/unknown",
          message: error.message || "Failed to authenticate with biometrics"
        }
      };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isBiometricsAvailable, setAuthenticated]);
  
  // Session management
  const logout = useCallback(async (): Promise<void> => {
    // In a real app, invalidate the session token on the backend
    setUser(null);
    setSessionExpiry(null);
    
    // Don't clear biometric registration
  }, [setUser, setSessionExpiry]);
  
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    // In a real app, validate and refresh the session token with your backend
    const expiry = Date.now() + SESSION_TIMEOUT;
    setSessionExpiry(expiry);
  }, [user, setSessionExpiry]);
  
  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!user || !sessionExpiry || Date.now() > sessionExpiry) {
      return null;
    }
    
    // In a real app, return the actual JWT token
    // For demo, we'll simulate a JWT
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXIuaWR9IiwibmFtZSI6IiR7dXNlci5uYW1lIHx8ICdVc2VyJ30iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6JHtzZXNzaW9uRXhwaXJ5fX0.signature`;
  }, [user, sessionExpiry]);
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAuthenticating,
    hasAttemptedLogin,
    
    // Phone auth
    sendOTP,
    verifyOTP,
    resendOTP,
    
    // Federated auth
    loginWithGoogle,
    loginWithTruecaller,
    loginWithWhatsApp,
    
    // Magic link auth
    sendMagicLink,
    
    // Biometric auth
    loginWithBiometrics,
    isBiometricsAvailable,
    setupBiometrics,
    
    // Session management
    logout,
    
    // Advanced functions
    refreshSession,
    getIdToken,
  };
} 