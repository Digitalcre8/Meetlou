import * as React from 'react'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import {
  DEMO_USER,
  getLocalSession,
  localResetPassword,
  localSignIn,
  localSignOut,
  localSignUp,
  startDemoSession,
  type LocalUser,
} from '@/lib/localAuth'
import { getDataStore, getLocalDataStore, type DataStore } from '@/services/dataStore'

export interface AuthUser {
  id: string
  email: string
  fullName: string
}

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  isDemo: boolean
  usingSupabase: boolean
  dataStore: DataStore
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string, newPassword?: string) => Promise<void>
  continueAsDemo: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [isDemo, setIsDemo] = React.useState(false)
  const usingSupabase = isSupabaseConfigured()

  React.useEffect(() => {
    let active = true

    async function init() {
      if (usingSupabase && supabase) {
        const { data } = await supabase.auth.getSession()
        if (!active) return
        const sessionUser = data.session?.user
        if (sessionUser) {
          setUser({
            id: sessionUser.id,
            email: sessionUser.email ?? '',
            fullName: (sessionUser.user_metadata?.full_name as string) ?? sessionUser.email ?? '',
          })
        }
        setLoading(false)

        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email ?? '',
              fullName: (session.user.user_metadata?.full_name as string) ?? session.user.email ?? '',
            })
            setIsDemo(false)
          } else {
            setUser(null)
          }
        })
        return () => sub.subscription.unsubscribe()
      } else {
        const local = getLocalSession()
        if (local) {
          setUser(local)
          setIsDemo(local.id === DEMO_USER.id)
        }
        setLoading(false)
      }
    }

    init()
    return () => {
      active = false
    }
  }, [usingSupabase])

  const signUp = React.useCallback(
    async (email: string, password: string, fullName: string) => {
      if (usingSupabase && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email ?? email, fullName })
        }
      } else {
        const local: LocalUser = await localSignUp(email, password, fullName)
        setUser(local)
        setIsDemo(false)
      }
    },
    [usingSupabase],
  )

  const signIn = React.useCallback(
    async (email: string, password: string) => {
      if (usingSupabase && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email ?? email,
            fullName: (data.user.user_metadata?.full_name as string) ?? email,
          })
        }
        setIsDemo(false)
      } else {
        const local = await localSignIn(email, password)
        setUser(local)
        setIsDemo(false)
      }
    },
    [usingSupabase],
  )

  const signOut = React.useCallback(async () => {
    if (usingSupabase && supabase) {
      await supabase.auth.signOut()
    } else {
      localSignOut()
    }
    setUser(null)
    setIsDemo(false)
  }, [usingSupabase])

  const resetPassword = React.useCallback(
    async (email: string, newPassword?: string) => {
      if (usingSupabase && supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/reset-password',
        })
        if (error) throw error
      } else if (newPassword) {
        await localResetPassword(email, newPassword)
      }
    },
    [usingSupabase],
  )

  const continueAsDemo = React.useCallback(() => {
    const demoUser = startDemoSession()
    setUser(demoUser)
    setIsDemo(true)
  }, [])

  const dataStore = isDemo ? getLocalDataStore() : getDataStore()

  const value: AuthContextValue = {
    user,
    loading,
    isDemo,
    usingSupabase,
    dataStore,
    signUp,
    signIn,
    signOut,
    resetPassword,
    continueAsDemo,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
