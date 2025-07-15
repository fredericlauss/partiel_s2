import { supabase } from '../lib/supabase'
import type { ConferenceWithRegistration, RegistrationConflict } from '../lib/supabase'

// Récupérer les inscriptions d'un utilisateur
export async function getUserRegistrations(userId: string) {
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
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

// Récupérer les conférences avec statut d'inscription pour un utilisateur
export async function getConferencesWithRegistrationStatus(userId?: string): Promise<ConferenceWithRegistration[]> {
  // Récupérer toutes les conférences
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(*),
      time_slot:time_slots(*)
    `)
    .order('created_at', { ascending: true })

  if (conferencesError) throw conferencesError

  if (!userId || !conferences) return conferences || []

  // Récupérer les inscriptions de l'utilisateur
  const { data: registrations, error: registrationsError } = await supabase
    .from('registrations')
    .select('id, conference_id')
    .eq('user_id', userId)

  if (registrationsError) throw registrationsError

  // Mapper les inscriptions pour un accès rapide
  const registrationMap = new Map(
    registrations?.map(reg => [reg.conference_id, reg.id]) || []
  )

  // Ajouter le statut d'inscription aux conférences
  return conferences.map(conference => ({
    ...conference,
    is_registered: registrationMap.has(conference.id),
    registration_id: registrationMap.get(conference.id)
  }))
}

// Vérifier les conflits horaires pour une inscription
export async function checkTimeConflict(userId: string, conferenceId: string): Promise<RegistrationConflict | null> {
  // Récupérer la conférence cible
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

  // Récupérer les inscriptions existantes de l'utilisateur pour le même créneau
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
    .eq('user_id', userId)

  if (conflictError) {
    console.error('Error checking conflicts:', conflictError)
    return null
  }

  // Trouver le conflit avec le même créneau horaire
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
}

// Récupérer les inscriptions par conférence
export async function getRegistrationsByConference(conferenceId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      user_profile:profiles(*)
    `)
    .eq('conference_id', conferenceId)

  if (error) throw error
  return data || []
}

// Récupérer les statistiques d'inscription par jour
export async function getRegistrationsByDay() {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      conference:conferences(
        time_slot:time_slots(day)
      )
    `)

  if (error) throw error

  // Grouper par jour
  const byDay = data?.reduce((acc, reg) => {
    const day = reg.conference?.time_slot?.day
    if (day) {
      acc[day] = (acc[day] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  return byDay || {}
}

// S'inscrire à une conférence
export async function registerForConference(userId: string, conferenceId: string) {
  const { error, data } = await supabase
    .from('registrations')
    .insert([{ user_id: userId, conference_id: conferenceId }])
    .select()
    .single()

  if (error) throw error
  return data
}

// Se désinscrire d'une conférence
export async function unregisterFromConference(userId: string, conferenceId: string) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .match({ user_id: userId, conference_id: conferenceId })

  if (error) throw error
  return { userId, conferenceId }
}

// Remplacer une inscription (conflit horaire)
export async function replaceRegistration(
  userId: string,
  oldConferenceId: string,
  newConferenceId: string
) {
  // Transaction pour supprimer l'ancienne et créer la nouvelle inscription
  const { error: deleteError } = await supabase
    .from('registrations')
    .delete()
    .match({ user_id: userId, conference_id: oldConferenceId })

  if (deleteError) throw deleteError

  const { error: insertError, data } = await supabase
    .from('registrations')
    .insert([{ user_id: userId, conference_id: newConferenceId }])
    .select()
    .single()

  if (insertError) {
    // Rollback - remettre l'ancienne inscription
    await supabase
      .from('registrations')
      .insert([{ user_id: userId, conference_id: oldConferenceId }])
    throw insertError
  }

  return data
} 