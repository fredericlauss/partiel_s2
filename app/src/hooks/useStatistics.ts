import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Conference, Room } from '../lib/supabase'

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

export const useStatistics = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Get all conferences with related data
      const { data: conferences, error: conferencesError } = await supabase
        .from('conferences')
        .select(`
          *,
          room:rooms(*),
          time_slot:time_slots(*)
        `)

      if (conferencesError) throw conferencesError

      // Get all registrations
      const { data: registrations, error: registrationsError } = await supabase
        .from('registrations')
        .select(`
          *,
          conference:conferences(*)
        `)

      if (registrationsError) throw registrationsError

      // Get all rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')

      if (roomsError) throw roomsError

      // Get all time slots
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from('time_slots')
        .select('*')

      if (timeSlotsError) throw timeSlotsError

      // Calculate statistics
      const totalConferences = conferences?.length || 0
      const totalRegistrations = registrations?.length || 0
      const totalRooms = rooms?.length || 0
      const totalTimeSlots = timeSlots?.length || 0

      // Calculate average attendance rate (registrations per conference)
      const averageAttendanceRate = totalConferences > 0 
        ? Math.round((totalRegistrations / totalConferences) * 100) / 100 
        : 0

      // Calculate conferences per day
      const conferencesPerDay = [1, 2, 3].map(day => ({
        day,
        count: conferences?.filter(c => c.time_slot?.day === day).length || 0
      }))

      // Calculate room utilization
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

      // Calculate popular conferences (with most registrations)
      const conferenceRegistrationCounts = conferences?.map(conference => {
        const registrationCount = registrations?.filter(r => r.conference_id === conference.id).length || 0
        return { conference, registrationCount }
      }) || []

      const popularConferences = conferenceRegistrationCounts
        .sort((a, b) => b.registrationCount - a.registrationCount)
        .slice(0, 5) // Top 5

      // Calculate overall utilization rate
      const maxPossibleConferences = totalRooms * totalTimeSlots
      const overallUtilizationRate = maxPossibleConferences > 0 
        ? Math.round((totalConferences / maxPossibleConferences) * 100)
        : 0

      setStats({
        totalConferences,
        totalRegistrations,
        averageAttendanceRate,
        conferencesPerDay,
        roomUtilization,
        popularConferences,
        totalRooms,
        totalTimeSlots,
        overallUtilizationRate
      })

    } catch (err) {
      console.error('Error loading statistics:', err)
      setError('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  return {
    stats,
    loading,
    error,
    refresh: loadStatistics
  }
} 