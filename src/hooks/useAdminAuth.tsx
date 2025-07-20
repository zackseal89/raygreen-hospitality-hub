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
    console.log('useAdminAuth: Hook initialized')
    let mounted = true

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAdminAuth: Auth state change:', event, session?.user?.email)
        if (!mounted) return

        try {
          if (session?.user) {
            console.log('useAdminAuth: Checking admin status for user:', session.user.id)
            // Check if user is admin
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', session.user.id)
              .maybeSingle()

            console.log('useAdminAuth: Profile query result:', profile, error)

            if (!mounted) return

            const newState = {
              user: session.user,
              session,
              isAdmin: profile?.role === 'admin' || false,
              loading: false
            }
            console.log('useAdminAuth: Setting new state:', newState)
            setState(newState)
          } else {
            console.log('useAdminAuth: No session, clearing state')
            setState({
              user: null,
              session: null,
              isAdmin: false,
              loading: false
            })
          }
        } catch (error) {
          console.error('useAdminAuth: Error in auth state change:', error)
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
      console.log('useAdminAuth: Checking initial session')
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        console.log('useAdminAuth: Initial session:', session?.user?.email, sessionError)
        
        if (!mounted) return
        
        if (session?.user) {
          console.log('useAdminAuth: Checking initial admin status for user:', session.user.id)
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()

          console.log('useAdminAuth: Initial profile query result:', profile, profileError)

          if (!mounted) return

          const newState = {
            user: session.user,
            session,
            isAdmin: profile?.role === 'admin' || false,
            loading: false
          }
          console.log('useAdminAuth: Setting initial state:', newState)
          setState(newState)
        } else {
          console.log('useAdminAuth: No initial session')
          setState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          })
        }
      } catch (error) {
        console.error('useAdminAuth: Error checking initial session:', error)
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