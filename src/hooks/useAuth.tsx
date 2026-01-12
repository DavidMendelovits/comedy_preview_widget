import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { UserType } from '@/lib/types'

interface AuthState {
  user: User | null
  session: Session | null
  userType: UserType | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userType: UserType) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userType: null,
    loading: true,
  })

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        userType: session?.user?.user_metadata?.user_type ?? null,
        loading: false,
      }))
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        userType: session?.user?.user_metadata?.user_type ?? null,
        loading: false,
      }))
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userType: UserType) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { user_type: userType },
      },
    })

    // Email confirmation is needed if user was created but no session exists
    const needsEmailConfirmation = Boolean(!error && data.user && !data.session)

    return { error: error as Error | null, needsEmailConfirmation }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
