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
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput, Room, TimeSlot } from '../../lib/supabase'

interface ConferenceFormProps {
  conference?: Conference // If provided, form is in edit mode
  rooms: Room[]
  timeSlots: TimeSlot[]
  loading: boolean
  onSubmit: (data: ConferenceCreateInput | ConferenceUpdateInput) => Promise<boolean>
  onCancel: () => void
  checkAvailability: (roomId: number, timeSlotId: number, excludeConferenceId?: string) => Promise<boolean>
}

export const ConferenceForm: React.FC<ConferenceFormProps> = ({
  conference,
  rooms,
  timeSlots,
  loading,
  onSubmit,
  onCancel,
  checkAvailability
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

  const isEditMode = !!conference

  // Initialize form with conference data if editing
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

  // Format day display for time slots
  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  // Format time slot display
  const formatTimeSlot = (timeSlot: TimeSlot) => {
    return `${getDayLabel(timeSlot.day)} - ${timeSlot.start_time} à ${timeSlot.end_time}`
  }

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // Check room/time slot availability
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
        onCancel() // Close form on success
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {isEditMode ? '✏️ Modifier la conférence' : '➕ Nouvelle conférence'}
        </Typography>

        {availabilityError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {availabilityError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Conference details */}
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

            {/* Speaker details */}
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

            {/* Scheduling */}
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
                <InputLabel>Créneau horaire</InputLabel>
                <Select
                  value={formData.time_slot_id || ''}
                  onChange={(e) => handleChange('time_slot_id', Number(e.target.value))}
                  disabled={submitting || loading}
                >
                  {timeSlots.map((slot) => (
                    <MenuItem key={slot.id} value={slot.id}>
                      {formatTimeSlot(slot)}
                    </MenuItem>
                  ))}
                </Select>
                {errors.time_slot_id && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.time_slot_id}
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
                disabled={submitting || loading}
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