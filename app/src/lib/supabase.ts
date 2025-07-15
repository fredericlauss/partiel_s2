import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase sont requises')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

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

// Conference management types

export interface Room {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface TimeSlot {
  id: number
  day: number // 1, 2, or 3
  start_time: string // Format: "HH:MM"
  end_time: string // Format: "HH:MM"
  created_at: string
}

export interface Conference {
  id: string
  title: string
  description: string
  speaker_name: string
  speaker_photo?: string
  speaker_bio?: string
  room_id: number
  time_slot_id: number
  sponsored_by_user_id?: string
  created_at: string
  updated_at: string
  
  // Joined data (available when using joins)
  room?: Room
  time_slot?: TimeSlot
  sponsor_profile?: Profile
}

export interface Registration {
  id: string
  user_id: string
  conference_id: string
  created_at: string
  
  // Joined data
  conference?: Conference
  user_profile?: Profile
}

// Utility types for forms and API responses
export interface ConferenceCreateInput {
  title: string
  description: string
  speaker_name: string
  speaker_photo?: string
  speaker_bio?: string
  room_id: number
  time_slot_id: number
  sponsored_by_user_id?: string
}

export interface ConferenceUpdateInput extends Partial<ConferenceCreateInput> {
  id: string
}

// Conference filtering and search
export interface ConferenceFilters {
  day?: number
  room_id?: number
  speaker_name?: string
  search_term?: string
}

// Dashboard statistics
export interface ConferenceStats {
  total_conferences: number
  total_registrations: number
  average_attendance_rate: number
  most_popular_conference: Conference | null
  room_utilization: {
    room: Room
    conference_count: number
    utilization_rate: number
  }[]
} 