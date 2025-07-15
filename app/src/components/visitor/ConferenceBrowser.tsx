import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material'

import { useRegistrations } from '../../hooks/useRegistrations'
import { useConferences } from '../../hooks/useConferences'
import ConferenceFilters from './ConferenceFilters'
import ConferenceCard from './ConferenceCard'
import RegistrationDialog from './RegistrationDialog'
import ConflictDialog from './ConflictDialog'
import type { 
  ConferenceWithRegistration, 
  RegistrationConflict 
} from '../../lib/supabase'

export const ConferenceBrowser: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [registrationDialog, setRegistrationDialog] = useState<{
    open: boolean
    conference: ConferenceWithRegistration | null
    action: 'register' | 'unregister'
  }>({
    open: false,
    conference: null,
    action: 'register'
  })

  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean
    conflict: RegistrationConflict | null
    newConferenceId: string | null
  }>({
    open: false,
    conflict: null,
    newConferenceId: null
  })

  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const { rooms, loading: conferencesLoading, error: conferencesError } = useConferences()
  const {
    loading: registrationLoading,
    error: registrationError,
    registerForConference,
    unregisterFromConference,
    replaceRegistration,
    getConferencesWithRegistrationStatus
  } = useRegistrations()

  const [conferencesWithStatus, setConferencesWithStatus] = useState<ConferenceWithRegistration[]>([])
  const [statusLoading, setStatusLoading] = useState(false)

  const loadConferencesWithStatus = useCallback(async () => {
    setStatusLoading(true)
    try {
      const data = await getConferencesWithRegistrationStatus()
      setConferencesWithStatus(data)
    } catch (error) {
      console.error('Error loading conferences with status:', error)
    } finally {
      setStatusLoading(false)
    }
  }, [getConferencesWithRegistrationStatus])

  useEffect(() => {
    loadConferencesWithStatus()
  }, [loadConferencesWithStatus])

  // Filter conferences based on current filters
  const filteredConferences = useMemo(() => {
    return conferencesWithStatus.filter(conference => {
      // Day filter
      if (selectedDay && conference.time_slot?.day !== selectedDay) {
        return false
      }

      // Room filter
      if (selectedRoom && conference.room_id !== selectedRoom) {
        return false
      }

      // Speaker filter
      if (selectedSpeaker && conference.speaker_name !== selectedSpeaker) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const titleMatch = conference.title.toLowerCase().includes(searchLower)
        const descriptionMatch = conference.description.toLowerCase().includes(searchLower)
        const speakerMatch = conference.speaker_name.toLowerCase().includes(searchLower)
        
        if (!titleMatch && !descriptionMatch && !speakerMatch) {
          return false
        }
      }

      return true
    })
  }, [conferencesWithStatus, selectedDay, selectedRoom, selectedSpeaker, searchTerm])

  const handleRegister = (conference: ConferenceWithRegistration) => {
    setRegistrationDialog({
      open: true,
      conference,
      action: 'register'
    })
  }

  const handleUnregister = (conference: ConferenceWithRegistration) => {
    setRegistrationDialog({
      open: true,
      conference,
      action: 'unregister'
    })
  }

  const confirmRegistration = async () => {
    if (!registrationDialog.conference) return

    const result = await registerForConference(registrationDialog.conference.id)

    if (result.success) {
      setNotification({
        open: true,
        message: 'Inscription réussie !',
        severity: 'success'
      })
      setRegistrationDialog({ open: false, conference: null, action: 'register' })
      await loadConferencesWithStatus() // Refresh data
    } else if (result.conflict) {
      setConflictDialog({
        open: true,
        conflict: result.conflict,
        newConferenceId: registrationDialog.conference.id
      })
      setRegistrationDialog({ open: false, conference: null, action: 'register' })
    } else {
      setNotification({
        open: true,
        message: registrationError || 'Erreur lors de l\'inscription',
        severity: 'error'
      })
    }
  }

  const confirmUnregistration = async () => {
    if (!registrationDialog.conference) return

    const success = await unregisterFromConference(registrationDialog.conference.id)

    if (success) {
      setNotification({
        open: true,
        message: 'Désinscription réussie !',
        severity: 'success'
      })
      await loadConferencesWithStatus() 
    } else {
      setNotification({
        open: true,
        message: registrationError || 'Erreur lors de la désinscription',
        severity: 'error'
      })
    }

    setRegistrationDialog({ open: false, conference: null, action: 'unregister' })
  }

  const handleConflictReplace = async () => {
    if (!conflictDialog.conflict || !conflictDialog.newConferenceId) return

    const success = await replaceRegistration(
      conflictDialog.conflict.existing_conference.id,
      conflictDialog.newConferenceId
    )

    if (success) {
      setNotification({
        open: true,
        message: 'Inscription remplacée avec succès !',
        severity: 'success'
      })
      await loadConferencesWithStatus()
    } else {
      setNotification({
        open: true,
        message: registrationError || 'Erreur lors du remplacement',
        severity: 'error'
      })
    }

    setConflictDialog({ open: false, conflict: null, newConferenceId: null })
  }

  const clearAllFilters = () => {
    setSelectedDay(null)
    setSelectedRoom(null)
    setSelectedSpeaker('')
    setSearchTerm('')
  }

  // Loading state
  if (conferencesLoading || statusLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Chargement des conférences...
          </Typography>
        </Box>
      </Container>
    )
  }

  // Error state
  if (conferencesError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Erreur lors du chargement des conférences: {conferencesError}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        🎪 Parcourir les Conférences
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Découvrez et inscrivez-vous aux conférences qui vous intéressent
      </Typography>

      {/* Filters */}
      <ConferenceFilters
        selectedDay={selectedDay}
        selectedRoom={selectedRoom}
        selectedSpeaker={selectedSpeaker}
        searchTerm={searchTerm}
        rooms={rooms}
        conferences={conferencesWithStatus}
        onDayChange={setSelectedDay}
        onRoomChange={setSelectedRoom}
        onSpeakerChange={setSelectedSpeaker}
        onSearchChange={setSearchTerm}
        onClearFilters={clearAllFilters}
      />

      {/* Results count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {filteredConferences.length} conférence{filteredConferences.length !== 1 ? 's' : ''} trouvée{filteredConferences.length !== 1 ? 's' : ''}
      </Typography>

      {/* Conferences grid */}
      {filteredConferences.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune conférence ne correspond à vos critères de recherche.
        </Alert>
      ) : (
        <Box 
          display="grid" 
          gridTemplateColumns={{ 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }} 
          gap={3}
        >
          {filteredConferences.map((conference) => (
            <ConferenceCard
              key={conference.id}
              conference={conference}
              onRegister={handleRegister}
              onUnregister={handleUnregister}
              loading={registrationLoading}
            />
          ))}
        </Box>
      )}

      {/* Registration Dialog */}
      <RegistrationDialog
        open={registrationDialog.open}
        conference={registrationDialog.conference}
        action={registrationDialog.action}
        loading={registrationLoading}
        onConfirm={registrationDialog.action === 'register' ? confirmRegistration : confirmUnregistration}
        onCancel={() => setRegistrationDialog({ open: false, conference: null, action: 'register' })}
      />

      {/* Conflict Dialog */}
      <ConflictDialog
        open={conflictDialog.open}
        conflict={conflictDialog.conflict}
        loading={registrationLoading}
        onReplace={handleConflictReplace}
        onCancel={() => setConflictDialog({ open: false, conflict: null, newConferenceId: null })}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default ConferenceBrowser 