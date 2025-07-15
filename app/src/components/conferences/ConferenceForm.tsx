import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert
} from '@mui/material'
import { Save as SaveIcon, Cancel as CancelIcon, CheckCircle as AvailableIcon, Cancel as OccupiedIcon } from '@mui/icons-material'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput, Room, TimeSlot } from '../../lib/supabase'

interface ConferenceFormProps {
  conference?: Conference // If provided, form is in edit mode
  rooms: Room[]
  timeSlots: TimeSlot[]
  loading: boolean
  onSubmit: (data: ConferenceCreateInput | ConferenceUpdateInput) => Promise<boolean>
  onCancel: () => void
  checkAvailability: (roomId: number, timeSlotId: number, excludeConferenceId?: string) => Promise<boolean>
  getTimeSlotAvailability: (roomId: number, excludeConferenceId?: string) => Promise<Record<number, boolean>>
}

export const ConferenceForm: React.FC<ConferenceFormProps> = ({
  conference,
  rooms,
  timeSlots,
  loading,
  onSubmit,
  onCancel,
  checkAvailability,
  getTimeSlotAvailability
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker_name: '',
    speaker_photo: '',
    speaker_bio: '',
    room_id: 0,
    time_slot_id: 0
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)
  const [timeSlotAvailability, setTimeSlotAvailability] = useState<Record<number, boolean>>({})
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  const isEditMode = !!conference

  useEffect(() => {
    if (conference) {
      setFormData({
        title: conference.title,
        description: conference.description,
        speaker_name: conference.speaker_name,
        speaker_photo: conference.speaker_photo || '',
        speaker_bio: conference.speaker_bio || '',
        room_id: conference.room_id,
        time_slot_id: conference.time_slot_id
      })
    }
  }, [conference])

  // Check availability when room changes
  useEffect(() => {
    const checkRoomAvailability = async () => {
      if (formData.room_id) {
        setCheckingAvailability(true)
        try {
          const availability = await getTimeSlotAvailability(
            formData.room_id, 
            isEditMode ? conference?.id : undefined
          )
          setTimeSlotAvailability(availability)
        } catch (error) {
          console.error('Error checking room availability:', error)
        } finally {
          setCheckingAvailability(false)
        }
      } else {
        setTimeSlotAvailability({})
      }
    }

    checkRoomAvailability()
  }, [formData.room_id, getTimeSlotAvailability, isEditMode, conference?.id])

  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  // Display with availability
  const formatTimeSlot = (timeSlot: TimeSlot) => {
    const baseFormat = `${getDayLabel(timeSlot.day)} - ${timeSlot.start_time} à ${timeSlot.end_time}`
    
    if (!formData.room_id) return baseFormat
    
    const isAvailable = timeSlotAvailability[timeSlot.id]
    if (isAvailable === undefined) return baseFormat
    
    return isAvailable ? `${baseFormat} Disponible` : `${baseFormat} Occupé`
  }

  const isTimeSlotAvailable = (timeSlotId: number) => {
    if (!formData.room_id) return true
    return timeSlotAvailability[timeSlotId] !== false
  }

  const getTimeSlotColor = (timeSlotId: number) => {
    if (!formData.room_id) return 'inherit'
    const isAvailable = timeSlotAvailability[timeSlotId]
    if (isAvailable === undefined) return 'inherit' 
    return isAvailable ? 'success.main' : 'error.main'
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear availability error when room or time slot changes
    if (field === 'room_id' || field === 'time_slot_id') {
      setAvailabilityError(null)
    }

    // Reset time slot when room changes
    if (field === 'room_id') {
      setFormData(prev => ({ ...prev, time_slot_id: 0 }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = 'Le titre est requis'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.speaker_name.trim()) newErrors.speaker_name = 'Le nom du conférencier est requis'
    if (!formData.room_id) newErrors.room_id = 'Veuillez sélectionner une salle'
    if (!formData.time_slot_id) newErrors.time_slot_id = 'Veuillez sélectionner un créneau'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const isAvailable = await checkAvailability(
      formData.room_id, 
      formData.time_slot_id, 
      isEditMode ? conference?.id : undefined
    )

    if (!isAvailable) {
      setAvailabilityError('Ce créneau est déjà occupé dans cette salle')
      return
    }

    setSubmitting(true)
    setAvailabilityError(null)

    try {
      const submitData = isEditMode
        ? { ...formData, id: conference!.id } as ConferenceUpdateInput
        : formData as ConferenceCreateInput

      const success = await onSubmit(submitData)
      if (success) {
        onCancel()
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEditMode ? 'Modifier la conférence' : 'Nouvelle conférence'}
        </Typography>

        {availabilityError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {availabilityError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              fullWidth
              label="Titre de la conférence"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              error={!!errors.title}
              helperText={errors.title}
              disabled={submitting}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              disabled={submitting}
            />

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
              <TextField
                fullWidth
                label="Nom du conférencier"
                value={formData.speaker_name}
                onChange={(e) => handleChange('speaker_name', e.target.value)}
                error={!!errors.speaker_name}
                helperText={errors.speaker_name}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Photo du conférencier (URL)"
                value={formData.speaker_photo}
                onChange={(e) => handleChange('speaker_photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                disabled={submitting}
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Biographie du conférencier"
              value={formData.speaker_bio}
              onChange={(e) => handleChange('speaker_bio', e.target.value)}
              disabled={submitting}
            />

            <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
              <FormControl fullWidth error={!!errors.room_id}>
                <InputLabel>Salle</InputLabel>
                <Select
                  value={formData.room_id || ''}
                  onChange={(e) => handleChange('room_id', Number(e.target.value))}
                  disabled={submitting || loading}
                >
                  {rooms.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {room.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.room_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.room_id}
                  </Typography>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.time_slot_id}>
                <InputLabel>
                  {checkingAvailability ? 'Vérification disponibilité...' : 'Créneau horaire'}
                </InputLabel>
                <Select
                  value={formData.time_slot_id || ''}
                  onChange={(e) => handleChange('time_slot_id', Number(e.target.value))}
                  disabled={submitting || loading || checkingAvailability || !formData.room_id}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem 
                      key={slot.id} 
                      value={slot.id}
                      disabled={!isTimeSlotAvailable(slot.id)}
                      sx={{ 
                        color: getTimeSlotColor(slot.id),
                        '&.Mui-disabled': {
                          color: 'error.main',
                          opacity: 0.6
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {formData.room_id && timeSlotAvailability[slot.id] !== undefined && (
                          timeSlotAvailability[slot.id] ? 
                            <AvailableIcon color="success" fontSize="small" /> :
                            <OccupiedIcon color="error" fontSize="small" />
                        )}
                        {formatTimeSlot(slot)}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.time_slot_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.time_slot_id}
                  </Typography>
                )}
                {!formData.room_id ? (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                    Sélectionnez d'abord une salle pour voir la disponibilité des créneaux
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                    Disponible | Occupé
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* Action buttons */}
            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={onCancel}
                startIcon={<CancelIcon />}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={submitting || loading || checkingAvailability}
              >
                {submitting ? 'Enregistrement...' : isEditMode ? 'Modifier' : 'Créer'}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ConferenceForm 