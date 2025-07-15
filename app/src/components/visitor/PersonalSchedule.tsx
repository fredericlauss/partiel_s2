import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  Avatar
} from '@mui/material'
import {
  EventNote as ScheduleIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Remove as UnregisterIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material'
import { useRegistrations } from '../../hooks/useRegistrations'
import RegistrationDialog from './RegistrationDialog'
import type { Registration, ConferenceWithRegistration } from '../../lib/supabase'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`day-tabpanel-${index}`}
      aria-labelledby={`day-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

export const PersonalSchedule: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)

  // State for unregistration dialog
  const [unregisterDialog, setUnregisterDialog] = useState<{
    open: boolean
    conference: ConferenceWithRegistration | null
  }>({
    open: false,
    conference: null
  })

  // State for notifications
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const {
    loading: actionLoading,
    error: registrationError,
    getUserRegistrations,
    unregisterFromConference
  } = useRegistrations()

  // Load user registrations
  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getUserRegistrations()
      setRegistrations(data)
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoading(false)
    }
  }, [getUserRegistrations])

  useEffect(() => {
    loadRegistrations()
  }, [loadRegistrations])

  // Group registrations by day
  const registrationsByDay = React.useMemo(() => {
    const grouped: Record<number, Registration[]> = { 1: [], 2: [], 3: [] }
    
    registrations.forEach(registration => {
      if (registration.conference?.time_slot?.day) {
        grouped[registration.conference.time_slot.day].push(registration)
      }
    })

    // Sort by time within each day
    Object.keys(grouped).forEach(day => {
      grouped[Number(day)].sort((a, b) => {
        const timeA = a.conference?.time_slot?.start_time || '00:00'
        const timeB = b.conference?.time_slot?.start_time || '00:00'
        return timeA.localeCompare(timeB)
      })
    })

    return grouped
  }, [registrations])

  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  const formatTimeSlot = (registration: Registration) => {
    if (!registration.conference?.time_slot) return 'Horaire non défini'
    const timeSlot = registration.conference.time_slot
    return `${timeSlot.start_time} - ${timeSlot.end_time}`
  }

  const handleUnregister = (registration: Registration) => {
    if (!registration.conference) return
    
    setUnregisterDialog({
      open: true,
      conference: {
        ...registration.conference,
        is_registered: true,
        registration_id: registration.id
      }
    })
  }

  const confirmUnregistration = async () => {
    if (!unregisterDialog.conference) return

    const success = await unregisterFromConference(unregisterDialog.conference.id)

    if (success) {
      setNotification({
        open: true,
        message: 'Désinscription réussie !',
        severity: 'success'
      })
      await loadRegistrations() // Refresh data
    } else {
      setNotification({
        open: true,
        message: registrationError || 'Erreur lors de la désinscription',
        severity: 'error'
      })
    }

    setUnregisterDialog({ open: false, conference: null })
  }

  const ConferenceScheduleCard: React.FC<{ registration: Registration }> = ({ registration }) => {
    const conference = registration.conference
    if (!conference) return null

    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="start">
            <Box flex={1} sx={{ mr: 2 }}>
              {/* Time */}
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <TimeIcon color="primary" fontSize="small" />
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {formatTimeSlot(registration)}
                </Typography>
              </Box>

              {/* Title */}
              <Typography variant="h6" gutterBottom>
                {conference.title}
              </Typography>

              {/* Room */}
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <RoomIcon color="secondary" fontSize="small" />
                <Chip
                  label={conference.room?.name || 'Salle non définie'}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>

              {/* Speaker */}
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <Avatar
                  src={conference.speaker_photo}
                  sx={{ width: 24, height: 24 }}
                >
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  <strong>Conférencier :</strong> {conference.speaker_name}
                </Typography>
              </Box>

              {/* Description */}
              <Typography variant="body2" color="text.secondary">
                {conference.description}
              </Typography>
            </Box>

            {/* Unregister button */}
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<UnregisterIcon />}
              onClick={() => handleUnregister(registration)}
              disabled={actionLoading}
              sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
            >
              Se désinscrire
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const DaySchedule: React.FC<{ day: number }> = ({ day }) => {
    const dayRegistrations = registrationsByDay[day] || []

    if (dayRegistrations.length === 0) {
      return (
        <Box textAlign="center" py={6}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune conférence programmée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'êtes inscrit à aucune conférence pour le {getDayLabel(day).toLowerCase()}
          </Typography>
        </Box>
      )
    }

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
          📅 {getDayLabel(day)} - {dayRegistrations.length} conférence{dayRegistrations.length !== 1 ? 's' : ''}
        </Typography>
        
        {dayRegistrations.map((registration) => (
          <ConferenceScheduleCard key={registration.id} registration={registration} />
        ))}
      </Box>
    )
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Chargement de votre programme...
          </Typography>
        </Box>
      </Container>
    )
  }

  const totalRegistrations = registrations.length

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          📋 Mon Programme Personnel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Voici les conférences auxquelles vous êtes inscrit
        </Typography>
        
        {totalRegistrations > 0 && (
          <Chip
            icon={<ScheduleIcon />}
            label={`${totalRegistrations} inscription${totalRegistrations !== 1 ? 's' : ''}`}
            color="primary"
            sx={{ mt: 2 }}
          />
        )}
      </Box>

      {totalRegistrations === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          Vous n'êtes inscrit à aucune conférence pour le moment. 
          Rendez-vous sur la page d'accueil pour parcourir et vous inscrire aux conférences disponibles.
        </Alert>
      ) : (
        <>
          {/* Day tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => setCurrentTab(newValue)}
              centered
            >
              <Tab label="Jour 1" />
              <Tab label="Jour 2" />
              <Tab label="Jour 3" />
            </Tabs>
          </Box>

          {/* Tab panels */}
          <TabPanel value={currentTab} index={0}>
            <DaySchedule day={1} />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <DaySchedule day={2} />
          </TabPanel>
          <TabPanel value={currentTab} index={2}>
            <DaySchedule day={3} />
          </TabPanel>
        </>
      )}

      {/* Unregistration Dialog */}
      <RegistrationDialog
        open={unregisterDialog.open}
        conference={unregisterDialog.conference}
        action="unregister"
        loading={actionLoading}
        onConfirm={confirmUnregistration}
        onCancel={() => setUnregisterDialog({ open: false, conference: null })}
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

export default PersonalSchedule 