import { supabase } from '../lib/supabase'
import type { ConferenceCreateInput, ConferenceUpdateInput } from '../lib/supabase'

// Récupérer toutes les conférences avec relations
export async function getConferences() {
  const { data, error } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms!inner(id, name, description),
      time_slot:time_slots!inner(id, day, start_time, end_time)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Récupérer une conférence spécifique
export async function getConference(id: string) {
  const { data, error } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms!inner(*),
      time_slot:time_slots!inner(*),
      sponsor_profile:profiles(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// Récupérer les salles
export async function getRooms() {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Récupérer les créneaux horaires
export async function getTimeSlots() {
  const { data, error } = await supabase
    .from('time_slots')
    .select('*')
    .order('day', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw error
  return data || []
}

// Vérifier la disponibilité d'un créneau
export async function checkConferenceAvailability(
  roomId: number, 
  timeSlotId: number, 
  excludeConferenceId?: string
) {
  let query = supabase
    .from('conferences')
    .select('id')
    .eq('room_id', roomId)
    .eq('time_slot_id', timeSlotId)

  if (excludeConferenceId) {
    query = query.neq('id', excludeConferenceId)
  }

  const { data, error } = await query

  if (error) throw error
  return (data?.length || 0) === 0 // true if available
}

// Récupérer les conférences par jour
export async function getConferencesByDay(day: number) {
  const { data, error } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(*),
      time_slot:time_slots!inner(*)
    `)
    .eq('time_slot.day', day)
    .order('time_slot.start_time')

  if (error) throw error
  return data || []
}

// Récupérer les conférences par salle
export async function getConferencesByRoom(roomId: number) {
  const { data, error } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(*),
      time_slot:time_slots(*)
    `)
    .eq('room_id', roomId)
    .order('time_slot.day')
    .order('time_slot.start_time')

  if (error) throw error
  return data || []
}

// Créer une conférence
export async function createConference(data: ConferenceCreateInput) {
  const { error, data: result } = await supabase
    .from('conferences')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return result
}

// Mettre à jour une conférence
export async function updateConference(data: ConferenceUpdateInput) {
  const { id, ...updateData } = data
  const { error, data: result } = await supabase
    .from('conferences')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

// Supprimer une conférence
export async function deleteConference(conferenceId: string) {
  const { error } = await supabase
    .from('conferences')
    .delete()
    .eq('id', conferenceId)

  if (error) throw error
  return { id: conferenceId }
} 