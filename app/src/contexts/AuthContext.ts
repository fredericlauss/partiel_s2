import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AuthUser, Profile } from '../lib/supabase'

export interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, userData: {
    first_name: string
    last_name: string
    role: string
    company?: string
    phone?: string
  }) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined) 