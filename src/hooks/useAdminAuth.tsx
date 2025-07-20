import { useEffect, useState, useCallback } from 'react'
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

  const checkAdminStatus = useCallback(async (user: User) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      return profile?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          const isAdmin = await checkAdminStatus(session.user)
          if (mounted) {
            setState({
              user: session.user,
              session,
              isAdmin,
              loading: false
            })
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              session: null,
              isAdmin: false,
              loading: false
            })
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setState({
            user: null,
            session: null,
            isAdmin: false,
            loading: false
          })
        }
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (session?.user) {
          const isAdmin = await checkAdminStatus(session.user)
          if (mounted) {
            setState({
              user: session.user,
              session,
              isAdmin,
              loading: false
            })
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              session: null,
              isAdmin: false,
              loading: false
            })
          }
        }
      }
    )

    initializeAuth()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [checkAdminStatus])

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [])

  return {
    ...state,
    signIn,
    signOut
  }
}