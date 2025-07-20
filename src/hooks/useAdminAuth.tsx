import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AdminAuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
}

export const useAdminAuth = () => {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false
  })


  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          // Check if user is admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle()

          if (mounted) {
            setState({
              user: session.user,
              session,
              isAdmin: profile?.role === 'admin' || false
            })
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              session: null,
              isAdmin: false
            })
          }
        }
      }
    )

    // Check for existing session only once
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (mounted) {
          setState({
            user: session.user,
            session,
            isAdmin: profile?.role === 'admin' || false
          })
        }
      } else {
        if (mounted) {
          setState({
            user: null,
            session: null,
            isAdmin: false
          })
        }
      }
    })

    return () => {
      mounted = false;
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