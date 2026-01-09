/**
 * AuthContext - Manages Supabase authentication state
 * Provides user session, loading state, and auth methods
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

// Profile type from user_accounts table
export interface UserProfile {
  id: string
  email: string
  display_name?: string
  created_at: string
  updated_at: string
}

export interface ProfileUpdateData {
  display_name?: string
  [key: string]: unknown
}

export interface AuthResult<T = unknown> {
  data: T | null
  error: Error | AuthError | null
}

export interface SignInResult {
  data: { user: User | null; session: Session | null } | null
  error: Error | AuthError | null
}

export interface AuthContextValue {
  // State
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null

  // Computed
  isAuthenticated: boolean
  displayName: string

  // Methods
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (email: string, password: string, displayName?: string) => Promise<SignInResult>
  signOut: () => Promise<{ error: Error | AuthError | null }>
  updateProfile: (updates: ProfileUpdateData) => Promise<AuthResult<UserProfile>>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user account from user_accounts table
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(null)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    let isInitialized = false

    // Listen for auth changes - this is the primary way to get auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Set user immediately (sync operation)
        setUser(session?.user ?? null)

        // Mark as initialized and stop loading BEFORE async operations
        if (!isInitialized) {
          isInitialized = true
          setLoading(false)
        }

        // Fetch profile async (non-blocking for initial load)
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        // Clear error on successful auth change
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setError(null)
        }
      }
    )

    // Fallback: if no auth state change happens within 3 seconds, stop loading
    // This handles edge cases where the auth state is null and no event fires
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        isInitialized = true
        setLoading(false)
      }
    }, 3000)

    return () => {
      subscription?.unsubscribe()
      clearTimeout(timeout)
    }
  }, [fetchProfile])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in error'
      setError(errorMessage)
      return { data: null, error: err as Error | AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, displayName?: string): Promise<SignInResult> => {
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      })

      if (error) throw error
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up error'
      setError(errorMessage)
      return { data: null, error: err as Error | AuthError }
    } finally {
      setLoading(false)
    }
  }, [])

  // Sign out
  const signOut = useCallback(async (): Promise<{ error: Error | AuthError | null }> => {
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out error'
      setError(errorMessage)
      return { error: err as Error | AuthError }
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (updates: ProfileUpdateData): Promise<AuthResult<UserProfile>> => {
    if (!user) return { data: null, error: new Error('Not authenticated') }

    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data as UserProfile)
      return { data: data as UserProfile, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }, [user])

  // Clear error
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  const value: AuthContextValue = {
    // State
    user,
    profile,
    loading,
    error,

    // Computed
    isAuthenticated: !!user,
    displayName: profile?.display_name || user?.email?.split('@')[0] || 'Utilisateur',

    // Methods
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
