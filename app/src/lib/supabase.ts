import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont requises')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'organizer' | 'visitor' | 'sponsor'

export interface Profile {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  company?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: Profile
} 