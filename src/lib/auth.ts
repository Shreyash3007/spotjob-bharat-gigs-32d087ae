import { User } from "../types";
import { supabase } from "./supabase";

export async function signInWithPhone(phone: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });
    
    return { data, error };
  } catch (error) {
    console.error("Error signing in with phone:", error);
    return { data: null, error };
  }
}

export async function verifyOtp(phone: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: token,
      type: "sms",
    });
    
    return { data, error };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { data: null, error };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    return { data, error };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return { data: null, error };
  }
}

export async function signInWithTruecaller(accessToken: string) {
  try {
    // In a real implementation, you would validate the Truecaller token with your backend
    // Here we're simulating verifying the token and getting user info
    
    // Call your backend API to verify the token and get user info
    const response = await fetch('/api/auth/truecaller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to authenticate with Truecaller');
    }
    
    // Assuming backend returns phone number, we can sign in the user
    // You could use custom claims or a separate user table to track Truecaller users
    return await signInWithPhone(result.phone);
  } catch (error) {
    console.error("Error signing in with Truecaller:", error);
    return { data: null, error };
  }
}

export async function signInWithWhatsApp(phone: string) {
  try {
    // In a real implementation, you would initiate the WhatsApp Business API auth flow
    // For now, we'll reuse the phone verification flow since the implementation would be similar
    return await signInWithPhone(phone);
  } catch (error) {
    console.error("Error signing in with WhatsApp:", error);
    return { data: null, error };
  }
}

export async function signInWithMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    
    return { data, error };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return { data: null, error };
  }
}

export async function signInWithBiometrics() {
  try {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn not supported in this browser');
    }
    
    // Get user ID from local storage (previously stored during setup)
    const bioUserId = localStorage.getItem("biometric_user");
    if (!bioUserId) {
      throw new Error('No biometric credentials found');
    }
    
    // In a real implementation, you would:
    // 1. Request a challenge from your server
    // 2. Use navigator.credentials.get() to perform the biometric authentication
    // 3. Send the credential response to your server for verification
    // 4. Server would validate and return a session token
    
    // For demo, we'll simulate successful auth by fetching the user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', bioUserId)
      .single();
      
    if (userError) throw userError;
    
    // Create a session manually (this is for demo only)
    // In a real implementation, your server would create the session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error("Error signing in with biometrics:", error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    if (data?.user) {
      // Get user profile data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (userError && userError.code !== 'PGRST116') throw userError;
      
      return { 
        user: userData || {
          id: data.user.id,
          name: '',
          phone: data.user.phone || '',
          email: data.user.email || '',
        }, 
        error: null 
      };
    }
    
    return { user: null, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
}

export async function createOrUpdateUserProfile(userData: Partial<User> & { id: string }) {
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userData.id,
        name: userData.name || '',
        phone: userData.phone || '',
        email: userData.email || '',
        avatar: userData.avatar || null,
        location: userData.location || null,
        rating: userData.rating || 0,
        verified: userData.verified || false,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return { data: null, error };
  }
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error refreshing session:", error);
    return { data: null, error };
  }
} 