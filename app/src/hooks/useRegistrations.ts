import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import type { 
  Registration, 
  ConferenceWithRegistration, 
  RegistrationConflict 
} from '../lib/supabase'
import { RegistrationActions } from '../actions'

export const useRegistrations = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserRegistrations = useCallback(async (): Promise<Registration[]> => {
    if (!user?.id) return []

    try {
      const data = await RegistrationActions.getUserRegistrations(user.id)
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
      const conflict = await RegistrationActions.checkTimeConflict(user.id, conferenceId)
      return conflict
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
      const conflict = await checkTimeConflict(conferenceId)
      
      if (conflict) {
        setLoading(false)
        return { success: false, conflict }
      }

      const result = await RegistrationActions.registerForConference(user.id, conferenceId)

      if (!result || !result.id) {
        setError('Erreur lors de l\'inscription')
        return { success: false }
      }

      return { success: true }
    } catch (err) {
      console.error('Error registering for conference:', err)
      if (err instanceof Error && err.message.includes('already registered')) {
        setError('Vous êtes déjà inscrit à cette conférence')
      } else {
        setError('Erreur lors de l\'inscription')
      }
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
      const result = await RegistrationActions.unregisterFromConference(user.id, conferenceId)

      if (!result) {
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
      const result = await RegistrationActions.replaceRegistration(user.id, oldConferenceId, newConferenceId)

      if (!result || !result.id) {
        setError('Erreur lors du remplacement de l\'inscription')
        return false
      }

      return true
    } catch (err) {
      console.error('Error replacing registration:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du remplacement de l\'inscription')
      return false
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const getConferencesWithRegistrationStatus = useCallback(async (): Promise<ConferenceWithRegistration[]> => {
    try {
      const data = await RegistrationActions.getConferencesWithRegistrationStatus(user?.id)
      return data || []
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