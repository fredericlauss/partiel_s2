import { useState, useEffect } from 'react'
import type { Speaker } from '../lib/supabase'
import { SpeakerActions } from '../actions'

interface SpeakerCreateInput {
  name: string
  photo?: string
  bio?: string
}

interface SpeakerUpdateInput extends SpeakerCreateInput {
  id: string
}

export const useSpeakers = () => {
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const loadSpeakers = async () => {
    try {
      setLoading(true)
      setLoadingError(null)
      const data = await SpeakerActions.getSpeakers()
      setSpeakers(data || [])
    } catch (err) {
      console.error('Error loading speakers:', err)
      setLoadingError('Failed to load speakers')
    } finally {
      setLoading(false)
    }
  }

  const createSpeaker = async (speakerData: SpeakerCreateInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await SpeakerActions.createSpeaker(speakerData)
      
      if (!result) throw new Error('Failed to create speaker')
      
      await loadSpeakers() // Refresh the list
      return { success: true }
    } catch (err) {
      console.error('Error creating speaker:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to create speaker' 
      }
    }
  }

  const updateSpeaker = async (speakerData: SpeakerUpdateInput): Promise<{ success: boolean; error?: string }> => {
    try {
      const { id, ...updateData } = speakerData
      const result = await SpeakerActions.updateSpeaker(id, updateData)
      
      if (!result) throw new Error('Failed to update speaker')
      
      await loadSpeakers() 
      return { success: true }
    } catch (err) {
      console.error('Error updating speaker:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to update speaker' 
      }
    }
  }

  const deleteSpeaker = async (speakerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await SpeakerActions.deleteSpeaker(speakerId)
      
      if (!result || !result.id) throw new Error('Failed to delete speaker')
      
      await loadSpeakers()
      return { success: true }
    } catch (err) {
      console.error('Error deleting speaker:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to delete speaker' 
      }
    }
  }

  const searchSpeakers = async (searchTerm: string): Promise<Speaker[]> => {
    try {
      const data = await SpeakerActions.searchSpeakers(searchTerm)
      return data || []
    } catch (err) {
      console.error('Error searching speakers:', err)
      return []
    }
  }

  useEffect(() => {
    loadSpeakers()
  }, [])

  return {
    speakers,
    loading,
    loadingError,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker,
    searchSpeakers,
    refreshSpeakers: loadSpeakers
  }
} 