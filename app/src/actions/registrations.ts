import { supabase } from '../lib/supabase'
import type { ConferenceWithRegistration, RegistrationConflict } from '../lib/supabase'

export async function getUserRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      *,
      conference:conferences(
        *,
        speaker:speakers(*),
        room:rooms(*),
        time_slot:time_slots(*)
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export async function getConferencesWithRegistrationStatus(userId?: string): Promise<ConferenceWithRegistration[]> {
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      speaker:speakers(*),
      room:rooms(*),
      time_slot:time_slots(*)
    `)
    .order('created_at', { ascending: true })

  if (conferencesError) throw conferencesError

  if (!userId || !conferences) return conferences || []

  const { data: registrations, error: registrationsError } = await supabase
    .from('registrations')
    .select('id, conference_id')
    .eq('user_id', userId)

  if (registrationsError) throw registrationsError

  const registrationMap = new Map(
    registrations?.map(reg => [reg.conference_id, reg.id]) || []
  )

  return conferences.map(conference => ({
    ...conference,
    is_registered: registrationMap.has(conference.id),
    registration_id: registrationMap.get(conference.id)
  }))
}

export async function checkTimeConflict(userId: string, conferenceId: string): Promise<RegistrationConflict | null> {
  const { data: targetConference, error: targetError } = await supabase
    .from('conferences')
    .select(`
      *,
      speaker:speakers(*),
      room:rooms(*),
      time_slot:time_slots(*)
    `)
    .eq('id', conferenceId)
    .single()

  if (targetError || !targetConference) {
    console.error('Error fetching target conference:', targetError)
    return null
  }

  const { data: conflictingRegistrations, error: conflictError } = await supabase
    .from('registrations')
    .select(`
      *,
      conference:conferences(
        *,
        speaker:speakers(*),
        room:rooms(*),
        time_slot:time_slots(*)
      )
    `)
    .eq('user_id', userId)

  if (conflictError) {
    console.error('Error checking conflicts:', conflictError)
    return null
  }

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

  const byDay = data?.reduce((acc, reg) => {
    const day = reg.conference?.time_slot?.day
    if (day) {
      acc[day] = (acc[day] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  return byDay || {}
}

export async function registerForConference(userId: string, conferenceId: string) {
  const { error, data } = await supabase
    .from('registrations')
    .insert([{ user_id: userId, conference_id: conferenceId }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function unregisterFromConference(userId: string, conferenceId: string) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .match({ user_id: userId, conference_id: conferenceId })

  if (error) throw error
  return { userId, conferenceId }
}

export async function replaceRegistration(
  userId: string,
  oldConferenceId: string,
  newConferenceId: string
) {
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
    await supabase
      .from('registrations')
      .insert([{ user_id: userId, conference_id: oldConferenceId }])
    throw insertError
  }

  return data
} 