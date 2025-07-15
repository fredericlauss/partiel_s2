import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar
} from '@mui/material'
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Person as PersonIcon 
} from '@mui/icons-material'
import type { Speaker } from '../../lib/supabase'

interface SpeakerFormProps {
  speaker?: Speaker // If provided, form is in edit mode
  loading: boolean
  onSubmit: (data: SpeakerCreateInput | SpeakerUpdateInput) => Promise<boolean>
  onCancel: () => void
}

interface SpeakerCreateInput {
  name: string
  photo?: string
  bio?: string
}

interface SpeakerUpdateInput extends SpeakerCreateInput {
  id: string
}

export const SpeakerForm: React.FC<SpeakerFormProps> = ({
  speaker,
  loading,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    bio: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const isEditMode = !!speaker

  useEffect(() => {
    if (speaker) {
      setFormData({
        name: speaker.name,
        photo: speaker.photo || '',
        bio: speaker.bio || ''
      })
    }
  }, [speaker])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form data
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom du conférencier est requis'
    if (formData.photo && !isValidUrl(formData.photo)) {
      newErrors.photo = 'Veuillez entrer une URL valide pour la photo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSubmitting(true)

    try {
      const submitData = isEditMode
        ? { ...formData, id: speaker!.id } as SpeakerUpdateInput
        : formData as SpeakerCreateInput

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
          {isEditMode ? 'Modifier le conférencier' : 'Nouveau conférencier'}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Aperçu de la photo */}
            {formData.photo && (
              <Box display="flex" justifyContent="center" sx={{ mb: 2 }}>
                <Avatar
                  src={formData.photo}
                  sx={{ width: 80, height: 80 }}
                >
                  <PersonIcon />
                </Avatar>
              </Box>
            )}

            <TextField
              fullWidth
              label="Nom du conférencier"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              disabled={submitting}
              required
            />

            <TextField
              fullWidth
              label="Photo (URL)"
              value={formData.photo}
              onChange={(e) => handleChange('photo', e.target.value)}
              error={!!errors.photo}
              helperText={errors.photo || 'URL vers une photo du conférencier (optionnel)'}
              placeholder="https://example.com/photo.jpg"
              disabled={submitting}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Biographie"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              helperText="Biographie et présentation du conférencier (optionnel)"
              disabled={submitting}
            />

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

export default SpeakerForm 