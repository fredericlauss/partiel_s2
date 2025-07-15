import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { 
  Registration, 
  ConferenceWithRegistration, 
  RegistrationConflict 
} from '../lib/supabase'

export const useRegistrations = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserRegistrations = useCallback(async (): Promise<Registration[]> => {
    if (!user?.id) return []

    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          conference:conferences(
            *,
            room:rooms(*),
            time_slot:time_slots(*)
          )
        `)
        .eq('user_id', user.id)

      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching user registrations:', err)
      setError('Erreur lors du chargement de vos inscriptions')
      return []
    }
  }, [user?.id])

  const checkTimeConflict = useCallback(async (conferenceId: string): Promise<RegistrationConflict | null> => {
    if (!user?.id) return null

    try {
      // Get the conference we want to register for
      const { data: targetConference, error: targetError } = await supabase
        .from('conferences')
        .select(`
          *,
          room:rooms(*),
          time_slot:time_slots(*)
        `)
        .eq('id', conferenceId)
        .single()

      if (targetError || !targetConference) {
        console.error('Error fetching target conference:', targetError)
        return null
      }

      // Get user's existing registrations for the same time slot
      const { data: conflictingRegistrations, error: conflictError } = await supabase
        .from('registrations')
        .select(`
          *,
          conference:conferences(
            *,
            room:rooms(*),
            time_slot:time_slots(*)
          )
        `)
        .eq('user_id', user.id)

      if (conflictError) {
        console.error('Error checking conflicts:', conflictError)
        return null
      }

      // Find conflict with same time slot
      const conflict = conflictingRegistrations?.find(reg => 
        reg.conference?.time_slot_id === targetConference.time_slot_id
      )

      if (conflict?.conference) {
        return {
          existing_conference: conflict.conference,
          new_conference: targetConference,
          time_slot: targetConference.time_slot
        }
      }

      return null
    } catch (err) {
      console.error('Error checking time conflict:', err)
      return null
    }
  }, [user?.id])

  const registerForConference = useCallback(async (conferenceId: string): Promise<{ success: boolean; conflict?: RegistrationConflict }> => {
    if (!user?.id) {
      setError('Vous devez être connecté pour vous inscrire')
      return { success: false }
    }

    setLoading(true)
    setError(null)

    try {
      // Check for time conflicts first
      const conflict = await checkTimeConflict(conferenceId)
      
      if (conflict) {
        setLoading(false)
        return { success: false, conflict }
      }

      // No conflict, proceed with registration
      const { error } = await supabase
        .from('registrations')
        .insert([{
          user_id: user.id,
          conference_id: conferenceId
        }])

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          setError('Vous êtes déjà inscrit à cette conférence')
        } else {
          setError('Erreur lors de l\'inscription')
        }
        return { success: false }
      }

      return { success: true }
    } catch (err) {
      console.error('Error registering for conference:', err)
      setError('Erreur lors de l\'inscription')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [user?.id, checkTimeConflict])

  const unregisterFromConference = useCallback(async (conferenceId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('Vous devez être connecté')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .match({
          user_id: user.id,
          conference_id: conferenceId
        })

      if (error) {
        setError('Erreur lors de la désinscription')
        return false
      }

      return true
    } catch (err) {
      console.error('Error unregistering from conference:', err)
      setError('Erreur lors de la désinscription')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const replaceRegistration = useCallback(async (oldConferenceId: string, newConferenceId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('Vous devez être connecté')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Use transaction to ensure atomicity
      const { error } = await supabase.rpc('replace_user_registration', {
        p_user_id: user.id,
        p_old_conference_id: oldConferenceId,
        p_new_conference_id: newConferenceId
      })

      if (error) {
        setError('Erreur lors du remplacement de l\'inscription')
        return false
      }

      return true
    } catch (err) {
      console.error('Error replacing registration:', err)
      
      // Fallback: manual transaction
      try {
        await unregisterFromConference(oldConferenceId)
        const result = await registerForConference(newConferenceId)
        return result.success
      } catch (fallbackErr) {
        console.error('Fallback replacement failed:', fallbackErr)
        setError('Erreur lors du remplacement de l\'inscription')
        return false
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, unregisterFromConference, registerForConference])

  const getConferencesWithRegistrationStatus = useCallback(async (): Promise<ConferenceWithRegistration[]> => {
    try {
      // Get all conferences
      const { data: conferences, error: conferencesError } = await supabase
        .from('conferences')
        .select(`
          *,
          room:rooms(*),
          time_slot:time_slots(*)
        `)
        .order('created_at', { ascending: true })

      if (conferencesError) throw conferencesError

      if (!user?.id || !conferences) return conferences || []

      // Get user's registrations
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select('id, conference_id')
        .eq('user_id', user.id)

      if (registrationsError) throw registrationsError

      // Map registrations for quick lookup
      const registrationMap = new Map(
        registrations?.map(reg => [reg.conference_id, reg.id]) || []
      )

      // Add registration status to conferences
      return conferences.map(conference => ({
        ...conference,
        is_registered: registrationMap.has(conference.id),
        registration_id: registrationMap.get(conference.id)
      }))
    } catch (err) {
      console.error('Error fetching conferences with registration status:', err)
      setError('Erreur lors du chargement des conférences')
      return []
    }
  }, [user?.id])

  return {
    loading,
    error,
    getUserRegistrations,
    checkTimeConflict,
    registerForConference,
    unregisterFromConference,
    replaceRegistration,
    getConferencesWithRegistrationStatus,
    clearError: () => setError(null)
  }
} 