import { supabase } from '../lib/supabase'
import type { Room, Conference } from '../lib/supabase'

interface DashboardStats {
  totalConferences: number
  totalRegistrations: number
  averageAttendanceRate: number
  conferencesPerDay: { day: number; count: number }[]
  roomUtilization: { 
    room: Room; 
    conferenceCount: number; 
    utilizationByDay: { day: number; score: number; conferenceCount: number }[]
    averageScore: number
  }[]
  popularConferences: { conference: Conference; registrationCount: number }[]
  totalRooms: number
  totalTimeSlots: number
  overallUtilizationRate: number
}

export async function getDashboardStatistics(): Promise<DashboardStats> {
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(*),
      time_slot:time_slots(*)
    `)

  if (conferencesError) throw conferencesError

  const { data: registrations, error: registrationsError } = await supabase
    .from('registrations')
    .select(`
      *,
      conference:conferences(*)
    `)

  if (registrationsError) throw registrationsError

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('*')

  if (roomsError) throw roomsError

  const { data: timeSlots, error: timeSlotsError } = await supabase
    .from('time_slots')
    .select('*')

  if (timeSlotsError) throw timeSlotsError

  const totalConferences = conferences?.length || 0
  const totalRegistrations = registrations?.length || 0
  const totalRooms = rooms?.length || 0
  const totalTimeSlots = timeSlots?.length || 0

  const averageAttendanceRate = totalConferences > 0 
    ? Math.round((totalRegistrations / totalConferences) * 100) / 100 
    : 0

  const conferencesPerDay = [1, 2, 3].map(day => ({
    day,
    count: conferences?.filter(c => c.time_slot?.day === day).length || 0
  }))

  const roomUtilization = rooms?.map(room => {
    const roomConferences = conferences?.filter(c => c.room_id === room.id) || []
    
    const utilizationByDay = [1, 2, 3].map(day => {
      const conferencesOnDay = roomConferences.filter(c => c.time_slot?.day === day).length
      return {
        day,
        score: conferencesOnDay,
        conferenceCount: conferencesOnDay
      }
    })

    const totalConferences = roomConferences.length
    const totalScore = utilizationByDay.reduce((sum, dayData) => sum + dayData.score, 0)

    return {
      room,
      conferenceCount: totalConferences,
      utilizationByDay,
      averageScore: Math.round((totalScore / 3) * 10) / 10
    }
  }) || []

  const conferenceRegistrationCounts = conferences?.map(conference => {
    const registrationCount = registrations?.filter(r => r.conference_id === conference.id).length || 0
    return { conference, registrationCount }
  }) || []

  const popularConferences = conferenceRegistrationCounts
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, 5) // Top 5

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

  const byDay = data?.reduce((acc, reg) => {
    const timeSlot = (reg.conference as { time_slot?: { day?: number } })?.time_slot
    const day = timeSlot?.day
    if (day) {
      acc[day] = (acc[day] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>) || {}

  return byDay
}

export async function getTopConferencesByRegistrations(limit = 10) {
  const { data: conferences, error: conferencesError } = await supabase
    .from('conferences')
    .select(`
      *,
      room:rooms(name),
      time_slot:time_slots(*)
    `)

  if (conferencesError) throw conferencesError

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

  const sorted = conferencesWithCounts
    .sort((a, b) => b.registrationCount - a.registrationCount)
    .slice(0, limit)

  return sorted
} 