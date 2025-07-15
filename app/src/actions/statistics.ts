import { supabase } from '../lib/supabase'
import type { Room, Conference } from '../lib/supabase'

interface DashboardStats {
  totalConferences: number
  totalRegistrations: number
  averageAttendanceRate: number
  conferencesPerDay: { day: number; count: number }[]
  roomUtilization: { room: Room; conferenceCount: number; utilizationRate: number }[]
  popularConferences: { conference: Conference; registrationCount: number }[]
  totalRooms: number
  totalTimeSlots: number
  overallUtilizationRate: number
}

// Récupérer toutes les statistiques du dashboard
export async function getDashboardStatistics(): Promise<DashboardStats> {
  // Récupérer toutes les conférences avec leurs relations
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(*),
      time_slot:time_slots(*)
    `)

  if (conferencesError) throw conferencesError

  // Récupérer toutes les inscriptions
  const { data: registrations, error: registrationsError } = await supabase
    .from('registrations')
    .select(`
      *,
      conference:conferences(*)
    `)

  if (registrationsError) throw registrationsError

  // Récupérer toutes les salles
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')

  if (roomsError) throw roomsError

  // Récupérer tous les créneaux horaires
  const { data: timeSlots, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select('*')

  if (timeSlotsError) throw timeSlotsError

  // Calculer les statistiques
  const totalConferences = conferences?.length || 0
  const totalRegistrations = registrations?.length || 0
  const totalRooms = rooms?.length || 0
  const totalTimeSlots = timeSlots?.length || 0

  // Calculer le taux de participation moyen (inscriptions par conférence)
  const averageAttendanceRate = totalConferences > 0 
    ? Math.round((totalRegistrations / totalConferences) * 100) / 100 
    : 0

  // Calculer les conférences par jour
  const conferencesPerDay = [1, 2, 3].map(day => ({
    day,
    count: conferences?.filter(c => c.time_slot?.day === day).length || 0
  }))

  // Calculer l'utilisation des salles
  const roomUtilization = rooms?.map(room => {
    const conferenceCount = conferences?.filter(c => c.room_id === room.id).length || 0
    const maxPossibleConferences = timeSlots?.length || 0
    const utilizationRate = maxPossibleConferences > 0 
      ? Math.round((conferenceCount / maxPossibleConferences) * 100) 
      : 0

    return {
      room,
      conferenceCount,
      utilizationRate
    }
  }) || []

  // Calculer les conférences populaires (avec le plus d'inscriptions)
  const conferenceRegistrationCounts = conferences?.map(conference => {
    const registrationCount = registrations?.filter(r => r.conference_id === conference.id).length || 0
    return { conference, registrationCount }
  }) || []

  const popularConferences = conferenceRegistrationCounts
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, 5) // Top 5

  // Calculer le taux d'utilisation global
  const maxPossibleConferences = totalRooms * totalTimeSlots
  const overallUtilizationRate = maxPossibleConferences > 0 
    ? Math.round((totalConferences / maxPossibleConferences) * 100)
    : 0

  return {
    totalConferences,
    totalRegistrations,
    averageAttendanceRate,
    conferencesPerDay,
    roomUtilization,
    popularConferences,
    totalRooms,
    totalTimeSlots,
    overallUtilizationRate
  }
}

// Récupérer les statistiques d'inscription par conférence
export async function getConferenceRegistrationStats() {
  const { data, error } = await supabase
    .from('conferences')
    .select(`
      id,
      title,
      registrations(count)
    `)

  if (error) throw error
  return data || []
}

// Récupérer les statistiques d'utilisation des salles
export async function getRoomUtilizationStats() {
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')

  if (roomsError) throw roomsError

  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select('room_id')

  if (conferencesError) throw conferencesError

  const { data: timeSlots, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select('id')

  if (timeSlotsError) throw timeSlotsError

  // Calculer l'utilisation pour chaque salle
  const utilization = rooms?.map(room => {
    const conferenceCount = conferences?.filter(c => c.room_id === room.id).length || 0
    const maxPossible = timeSlots?.length || 0
    const utilizationRate = maxPossible > 0 ? Math.round((conferenceCount / maxPossible) * 100) : 0

    return {
      room,
      conferenceCount,
      maxPossible,
      utilizationRate
    }
  }) || []

  return utilization
}

// Récupérer les statistiques par période
export async function getRegistrationsByPeriod() {
  const { data, error } = await supabase
    .from('registrations')
    .select(`
      created_at,
      conference:conferences(
        time_slot:time_slots(day)
      )
    `)

  if (error) throw error

  // Grouper par jour de conférence
  const byDay = data?.reduce((acc, reg) => {
    // Accès sécurisé au jour depuis la structure imbriquée
    const timeSlot = (reg.conference as { time_slot?: { day?: number } })?.time_slot
    const day = timeSlot?.day
    if (day) {
      acc[day] = (acc[day] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>) || {}

  return byDay
}

// Récupérer le top des conférences par inscriptions
export async function getTopConferencesByRegistrations(limit = 10) {
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(name),
      time_slot:time_slots(*)
    `)

  if (conferencesError) throw conferencesError

  // Récupérer le nombre d'inscriptions pour chaque conférence
  const conferencesWithCounts = await Promise.all(
    (conferences || []).map(async (conference) => {
      const { data: registrations, error } = await supabase
        .from('registrations')
        .select('id')
        .eq('conference_id', conference.id)

      const registrationCount = error ? 0 : (registrations?.length || 0)
      return { ...conference, registrationCount }
    })
  )

  // Trier par nombre d'inscriptions
  const sorted = conferencesWithCounts
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, limit)

  return sorted
} 