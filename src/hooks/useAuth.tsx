import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  console.log('useAuth called, context:', context)
  if (context === undefined) {
    console.error('AuthContext is undefined - AuthProvider not found in component tree')
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('AuthProvider rendered')
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_role', { user_id: userId })

      if (error) {
        console.error('Error fetching user role:', error)
        setUserRole('guest')
        return 'guest'
      } else {
        const role = data || 'guest'
        setUserRole(role)
        return role
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('guest')
      return 'guest'
    }
  }, [])

  const refreshRole = useCallback(async () => {
    if (user) {
      await fetchUserRole(user.id)
    }
  }, [user, fetchUserRole])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setSession(null)
        setUserRole(null)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user role when session changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }
        
        if (session) {
          setSession(session);
          setUser(session.user);
          
          if (session.user) {
            setTimeout(() => {
              fetchUserRole(session.user.id);
            }, 0);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const isAdmin = user !== null // Allow all authenticated users to be admin

  const value = {
    user,
    session,
    userRole,
    isAdmin,
    loading,
    signIn,
    signOut,
    refreshRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}