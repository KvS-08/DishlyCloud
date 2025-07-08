import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../lib/database.types';
import toast from 'react-hot-toast';

type User = Tables['users']['Row'] & {
  business?: Tables['businesses']['Row'] | null;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (emailOrUsername: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // First fetch basic user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, username, full_name, avatar_url, role, business_id, is_active')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      if (!userData) throw new Error('User not found');

      // Then fetch business data if user has a business_id
      let businessData = null;
      if (userData.business_id) {
        const { data: business, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', userData.business_id)
          .single();
        
        if (businessError) {
          console.error('Error fetching business data:', businessError);
        } else {
          businessData = business;
        }
      }

      if (mounted) {
        setUser({
          ...userData,
          business: businessData
        });
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      if (mounted) setUser(null);
      throw error;
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Check if the error is related to invalid refresh token
          if (sessionError.message?.includes('Invalid Refresh Token') || 
              sessionError.message?.includes('refresh_token_not_found')) {
            // Clear the invalid session and reset auth state
            await supabase.auth.signOut();
            if (mounted) {
              setUser(null);
              setLoading(false);
            }
            return;
          }
          throw sessionError;
        }
        
        if (session?.user && mounted) {
          await fetchUserData(session.user.id);
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        if (mounted) {
          setUser(null);
          // Clear any potentially corrupted auth state
          await supabase.auth.signOut();
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          try {
            await fetchUserData(session.user.id);
          } catch (error) {
            console.error('Error handling auth state change:', error);
            setUser(null);
          } finally {
            if (mounted) setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Handle successful token refresh
          if (session?.user && mounted) {
            try {
              await fetchUserData(session.user.id);
            } catch (error) {
              console.error('Error after token refresh:', error);
              setUser(null);
            }
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [mounted]);
  
  const signIn = async (emailOrUsername: string, password: string) => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      
      // Helper function to check if input looks like an email
      const isEmail = (input: string) => {
        return input.includes('@') && input.includes('.');
      };
      
      let signInResult = null;
      let signInError = null;
      
      if (isEmail(emailOrUsername)) {
        // If it looks like an email, try direct email login
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: emailOrUsername, 
          password 
        });
        signInResult = data;
        signInError = error;
      } else {
        // If it doesn't look like an email, assume it's a username
        // First find the user by username to get their email
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email')
          .ilike('username', emailOrUsername)
          .maybeSingle();
        
        if (userError) {
          throw new Error('Error al buscar el usuario');
        }
        
        if (!userData || !userData.email) {
          throw new Error('Usuario no encontrado');
        }
        
        // Try to sign in with the found email
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: userData.email, 
          password 
        });
        signInResult = data;
        signInError = error;
      }
      
      // Handle the sign-in result
      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // Check for specific error types
        if (signInError.message?.includes('Invalid login credentials') || 
            signInError.message?.includes('invalid_credentials')) {
          throw new Error('Usuario o contraseña incorrectos');
        } else if (signInError.message?.includes('Email not confirmed')) {
          throw new Error('Por favor confirma tu correo electrónico antes de iniciar sesión');
        } else if (signInError.message?.includes('Too many requests')) {
          throw new Error('Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde');
        } else {
          throw new Error(signInError.message || 'Error al iniciar sesión');
        }
      }
      
      if (signInResult?.user) {
        await fetchUserData(signInResult.user.id);
        if (mounted) {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name')
            .eq('id', signInResult.user.id)
            .single();
          
          if (userData?.full_name) {
            toast.success(`¡Bienvenido de nuevo ${userData.full_name}!`);
          } else {
            toast.success('¡Bienvenido de nuevo!');
          }
        }
      } else {
        throw new Error('Error inesperado al iniciar sesión');
      }
      
    } catch (error: any) {
      console.error('Error signing in:', error);
      if (mounted) {
        setUser(null);
        throw error;
      }
    } finally {
      if (mounted) setLoading(false);
    }
  };
  
  const signOut = async () => {
    if (!mounted) return;
    
    try {
      setLoading(true);
      
      // Check if user is already null (already logged out)
      if (!user) {
        // User is already logged out, no need to make API call
        toast.success('Sesión cerrada correctamente');
        setLoading(false);
        return;
      }
      
      // Always clear the local user state first
      setUser(null);
      
      // Attempt to sign out from Supabase, but don't throw errors if session is already invalid
      const { error } = await supabase.auth.signOut();
      
      // Only log the error if it's not related to missing/invalid session
      if (error && 
          !error.message?.includes('session_not_found') && 
          !error.message?.includes('Auth session missing') &&
          !error.message?.includes('Session from session_id claim in JWT does not exist')) {
        console.error('Error signing out:', error);
        // Don't throw the error, just log it
      }
      
      // Always show success message regardless of Supabase response
      toast.success('Sesión cerrada correctamente');
      
    } catch (error: any) {
      console.error('Unexpected error during sign out:', error);
      // Even if there's an unexpected error, ensure user state is cleared
      setUser(null);
      toast.success('Sesión cerrada correctamente');
    } finally {
      if (mounted) setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);