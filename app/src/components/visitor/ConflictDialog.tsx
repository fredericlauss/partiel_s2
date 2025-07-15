import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material'
import {
  Warning as WarningIcon,
  SwapHoriz as ReplaceIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import type { RegistrationConflict } from '../../lib/supabase'

interface ConflictDialogProps {
  open: boolean
  conflict: RegistrationConflict | null
  loading: boolean
  onReplace: () => void
  onCancel: () => void
}

export const ConflictDialog: React.FC<ConflictDialogProps> = ({
  open,
  conflict,
  loading,
  onReplace,
  onCancel
}) => {
  if (!conflict) return null

  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  const formatTimeSlot = () => {
    if (!conflict.time_slot) return 'Horaire non défini'
    return `${getDayLabel(conflict.time_slot.day)} - ${conflict.time_slot.start_time} à ${conflict.time_slot.end_time}`
  }

  const ConferenceCard: React.FC<{ 
    title: string
    conference: typeof conflict.existing_conference | typeof conflict.new_conference
    isExisting?: boolean 
  }> = ({ title, conference, isExisting }) => (
    <Box 
      sx={{ 
        p: 2, 
        border: 1, 
        borderColor: isExisting ? 'warning.main' : 'primary.main', 
        borderRadius: 1,
        backgroundColor: isExisting ? 'warning.light' : 'primary.light',
        opacity: isExisting ? 0.7 : 1
      }}
    >
      <Typography variant="subtitle2" color={isExisting ? 'warning.dark' : 'primary.dark'} gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        {conference.title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {conference.description.length > 100 
          ? `${conference.description.substring(0, 100)}...`
          : conference.description
        }
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 1 }}>
        <Chip
          icon={<RoomIcon />}
          label={conference.room?.name || 'Salle non définie'}
          size="small"
          variant="outlined"
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        <strong>Conférencier :</strong> {conference.speaker_name}
      </Typography>
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="warning" />
          Conflit horaire détecté
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous êtes déjà inscrit à une conférence au même créneau horaire. 
          Voulez-vous vous désinscrire de l'ancienne conférence et vous inscrire à la nouvelle ?
        </Alert>

        <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
          <Chip
            icon={<TimeIcon />}
            label={formatTimeSlot()}
            color="warning"
            variant="outlined"
            size="medium"
          />
        </Box>

        <Box display="flex" flexDirection="column" gap={2}>
          <ConferenceCard 
            title="📅 Conférence actuelle (vous êtes inscrit)"
            conference={conflict.existing_conference}
            isExisting={true}
          />

          <Box display="flex" justifyContent="center" py={1}>
            <ReplaceIcon color="action" fontSize="large" />
          </Box>

          <ConferenceCard 
            title="🎯 Nouvelle conférence (souhaitée)"
            conference={conflict.new_conference}
            isExisting={false}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Action :</strong> Se désinscrire de "{conflict.existing_conference.title}" 
          et s'inscrire à "{conflict.new_conference.title}"
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onCancel}
          disabled={loading}
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
        <Button
          onClick={onReplace}
          variant="contained"
          color="warning"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <ReplaceIcon />}
        >
          {loading ? 'Remplacement...' : 'Remplacer l\'inscription'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConflictDialog 