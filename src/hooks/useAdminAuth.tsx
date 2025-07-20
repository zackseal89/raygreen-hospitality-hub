import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AdminAuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true
  })

  useEffect(() => {
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        try {
          if (session?.user) {
            // Check if user is admin
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle()

            if (!mounted) return

            setState({
              user: session.user,
              session,
              isAdmin: profile?.role === 'admin' || false,
              loading: false
            })
          } else {
            setState({
              user: null,
              session: null,
              isAdmin: false,
              loading: false
            })
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          if (!mounted) return
          
          setState({
            user: session?.user || null,
            session,
            isAdmin: false,
            loading: false
          })
        }
      }
    )

    // Check for existing session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (!mounted) return

          setState({
            user: session.user,
            session,
            isAdmin: profile?.role === 'admin' || false,
            loading: false
          })
        } else {
          setState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error checking initial session:', error)
        if (!mounted) return
        
        setState(prev => ({
          ...prev,
          loading: false
        }))
      }
    }

    checkInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    ...state,
    signIn,
    signOut
  }
}