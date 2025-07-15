import React, { useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AuthUser, Profile, UserRole } from '../lib/supabase'
import { AuthContext } from './AuthContext'
import { AuthActions } from '../actions'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = useCallback(async (authUser: User) => {
    try {
      const profile = await AuthActions.getUserProfile(authUser.id)

      if (!profile) {
        console.error('Erreur lors du chargement du profil')
        setUser({
          id: authUser.id,
          email: authUser.email!
        })
      } else {
        setUser({
          id: authUser.id,
          email: authUser.email!,
          profile: {
            id: profile.id,
            email: authUser.email!,
            role: profile.role,
            first_name: profile.first_name,
            last_name: profile.last_name,
            company: profile.company,
            phone: profile.phone,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          }
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setUser({
        id: authUser.id,
        email: authUser.email!
      })
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initialisation de la session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error)
        setLoading(false)
      }
    }

    initAuth()

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setLoading(false)
        } else if (session?.user) {
          loadUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [loadUserProfile])

  const signUp = async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    role: UserRole
    company?: string
    phone?: string
  }) => {
    try {
      const result = await AuthActions.signUp(email, password, userData)
      return { error: result.error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthActions.signIn(email, password)
      return { error: result.error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const result = await AuthActions.signOut()
      if (result.error) {
        console.error('Erreur lors de la déconnexion:', result.error)
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Force le reset local même en cas d'erreur
      setUser(null)
      setSession(null)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('Utilisateur non connecté') }
    }

    try {
      const result = await AuthActions.updateProfile(user.id, updates)

      if (!result.error && result.data) {
        await loadUserProfile({ id: user.id, email: user.email } as User)
      }

      return { error: result.error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const deleteAccount = async () => {
    try {
      const result = await AuthActions.deleteAccount()
      
      if (!result.error) {
        // Reset l'état local après suppression réussie
        setUser(null)
        setSession(null)
      }
      
      return { error: result.error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    deleteAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 