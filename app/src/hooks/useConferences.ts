import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput, Room, TimeSlot } from '../lib/supabase'

export const useConferences = () => {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load all conferences with joined room and time slot data
  const loadConferences = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conferences')
        .select(`
          *,
          room:rooms!inner(id, name, description),
          time_slot:time_slots!inner(id, day, start_time, end_time)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setConferences(data || [])
    } catch (err) {
      console.error('Error loading conferences:', err)
      setError('Failed to load conferences')
    } finally {
      setLoading(false)
    }
  }

  // Load rooms for form dropdowns
  const loadRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name')

      if (error) throw error
      setRooms(data || [])
    } catch (err) {
      console.error('Error loading rooms:', err)
    }
  }

  // Load time slots for form dropdowns
  const loadTimeSlots = async () => {
    try {
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('day', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      setTimeSlots(data || [])
    } catch (err) {
      console.error('Error loading time slots:', err)
    }
  }

  // Create a new conference
  const createConference = async (conferenceData: ConferenceCreateInput): Promise<boolean> => {
    try {
      setError(null)
      const { error } = await supabase
        .from('conferences')
        .insert([conferenceData])

      if (error) throw error
      
      await loadConferences() // Refresh the list
      return true
    } catch (err) {
      console.error('Error creating conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to create conference')
      return false
    }
  }

  // Update an existing conference
  const updateConference = async (conferenceData: ConferenceUpdateInput): Promise<boolean> => {
    try {
      setError(null)
      const { id, ...updateData } = conferenceData
      const { error } = await supabase
        .from('conferences')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      
      await loadConferences() // Refresh the list
      return true
    } catch (err) {
      console.error('Error updating conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to update conference')
      return false
    }
  }

  // Delete a conference
  const deleteConference = async (conferenceId: string): Promise<boolean> => {
    try {
      setError(null)
      const { error } = await supabase
        .from('conferences')
        .delete()
        .eq('id', conferenceId)

      if (error) throw error
      
      await loadConferences() // Refresh the list
      return true
    } catch (err) {
      console.error('Error deleting conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete conference')
      return false
    }
  }

  // Check if a room/time slot combination is available
  const checkAvailability = async (roomId: number, timeSlotId: number, excludeConferenceId?: string): Promise<boolean> => {
    try {
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
      return (data?.length || 0) === 0
    } catch (err) {
      console.error('Error checking availability:', err)
      return false
    }
  }

  // Initialize data on mount
  useEffect(() => {
    loadConferences()
    loadRooms()
    loadTimeSlots()
  }, [])

  return {
    conferences,
    rooms,
    timeSlots,
    loading,
    error,
    createConference,
    updateConference,
    deleteConference,
    checkAvailability,
    refreshConferences: loadConferences
  }
} 