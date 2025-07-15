import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput, Room, TimeSlot } from '../lib/supabase'
import { ConferenceActions } from '../actions'

export const useConferences = () => {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadConferences = async () => {
    try {
      setLoading(true)
      const data = await ConferenceActions.getConferences()
      setConferences(data || [])
    } catch (err) {
      console.error('Error loading conferences:', err)
      setError('Failed to load conferences')
    } finally {
      setLoading(false)
    }
  }

  const loadRooms = async () => {
    try {
      const data = await ConferenceActions.getRooms()
      setRooms(data || [])
    } catch (err) {
      console.error('Error loading rooms:', err)
    }
  }

  const loadTimeSlots = async () => {
    try {
      const data = await ConferenceActions.getTimeSlots()
      setTimeSlots(data || [])
    } catch (err) {
      console.error('Error loading time slots:', err)
    }
  }

  const createConference = async (conferenceData: ConferenceCreateInput): Promise<boolean> => {
    try {
      setError(null)
      const result = await ConferenceActions.createConference(conferenceData)
      
      if (result.error) throw result.error
      
      await loadConferences() // Refresh the list
      return true
    } catch (err) {
      console.error('Error creating conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to create conference')
      return false
    }
  }

  const updateConference = async (conferenceData: ConferenceUpdateInput): Promise<boolean> => {
    try {
      setError(null)
      const result = await ConferenceActions.updateConference(conferenceData)
      
      if (!result) throw new Error('Failed to update conference')
      
      await loadConferences() 
      return true
    } catch (err) {
      console.error('Error updating conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to update conference')
      return false
    }
  }

  const deleteConference = async (conferenceId: string): Promise<boolean> => {
    try {
      setError(null)
      const result = await ConferenceActions.deleteConference(conferenceId)
      
      if (!result || !result.id) throw new Error('Failed to delete conference')
      
      await loadConferences()
      return true
    } catch (err) {
      console.error('Error deleting conference:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete conference')
      return false
    }
  }

  const checkAvailability = async (roomId: number, timeSlotId: number, excludeConferenceId?: string): Promise<boolean> => {
    try {
      return await ConferenceActions.checkConferenceAvailability(roomId, timeSlotId, excludeConferenceId)
    } catch (err) {
      console.error('Error checking availability:', err)
      return false
    }
  }

  const getTimeSlotAvailability = async (roomId: number, excludeConferenceId?: string): Promise<Record<number, boolean>> => {
    try {
      if (!roomId) return {}

      let query = supabase
        .from('conferences')
        .select('time_slot_id')
        .eq('room_id', roomId)

      if (excludeConferenceId) {
        query = query.neq('id', excludeConferenceId)
      }

      const { data, error } = await query

      if (error) throw error

      const occupiedSlots = (data || []).reduce((acc, conf) => {
        acc[conf.time_slot_id] = true
        return acc
      }, {} as Record<number, boolean>)

      const availability: Record<number, boolean> = {}
      timeSlots.forEach(slot => {
        availability[slot.id] = !occupiedSlots[slot.id] // Available if not occupied
      })

      return availability
    } catch (err) {
      console.error('Error getting time slot availability:', err)
      return {}
    }
  }

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
    getTimeSlotAvailability,
    refreshConferences: loadConferences
  }
} 