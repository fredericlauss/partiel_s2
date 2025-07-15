import React, { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AuthUser, Profile } from '../lib/supabase'
import { AuthContext } from './AuthContext'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        loadUserProfile(session.user)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error) {
        console.error('Erreur lors du chargement du profil:', error)
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
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error)
      setUser({
        id: authUser.id,
        email: authUser.email!
      })
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, userData: {
    first_name: string
    last_name: string
    role: string
    company?: string
    phone?: string
  }) => {
    try {
      // 1. Créer l'utilisateur sans metadata
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError || !data.user) {
        return { error: authError }
      }

      const { error: profileError } = await supabase
        .rpc('create_user_profile', {
          user_id: data.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          company: userData.company || null,
          phone: userData.phone || null
        })

      if (profileError) {
        console.error('Erreur de création de profil:', profileError)
        return { error: new Error('Erreur lors de la création du profil') }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) {
      return { error: new Error('Utilisateur non connecté') }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (!error && data) {
        await loadUserProfile({ id: user.id, email: user.email } as User)
      }

      return { error }
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
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 