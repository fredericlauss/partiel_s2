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
  Alert,
  Card,
  CardContent,
  Avatar,
  Divider
} from '@mui/material'
import {
  Warning as WarningIcon,
  SwapVert as SwapIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  Cancel as CancelIcon,
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
    conference: typeof conflict.existing_conference | typeof conflict.new_conference
    type: 'current' | 'new'
  }> = ({ conference, type }) => (
    <Card variant="outlined" sx={{ width: '100%' }}>
      <CardContent>
        {/* Header avec statut */}
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            {type === 'current' ? 'Inscription actuelle' : 'Nouvelle conférence'}
          </Typography>
          {type === 'current' && (
            <Chip
              label="✓ Inscrit"
              size="small"
              color="success"
              variant="filled"
            />
          )}
        </Box>
        
        {/* Titre */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {conference.title}
        </Typography>
        
        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {conference.description.length > 120 
            ? `${conference.description.substring(0, 120)}...`
            : conference.description
          }
        </Typography>

        {/* Chips temps et salle */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            icon={<TimeIcon />}
            label={formatTimeSlot()}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<RoomIcon />}
            label={conference.room?.name || 'Salle non définie'}
            size="small"
            color="secondary"
            variant="outlined"
          />
        </Box>

        {/* Conférencier */}
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={conference.speaker_photo}
            sx={{ width: 32, height: 32 }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              {conference.speaker_name}
            </Typography>
            {conference.speaker_bio && (
              <Typography variant="caption" color="text.secondary">
                {conference.speaker_bio.length > 60 
                  ? `${conference.speaker_bio.substring(0, 60)}...`
                  : conference.speaker_bio
                }
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <WarningIcon color="warning" />
          <Typography variant="h6" fontWeight="bold">
            Conflit horaire détecté
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous êtes déjà inscrit à une conférence au même créneau horaire. 
          Voulez-vous remplacer votre inscription actuelle par la nouvelle ?
        </Alert>

        <Box display="flex" flexDirection="column" gap={3}>
          <ConferenceCard 
            conference={conflict.existing_conference}
            type="current"
          />

          <Box display="flex" justifyContent="center" alignItems="center">
            <Divider sx={{ flex: 1 }} />
            <Box
              sx={{
                mx: 2,
                p: 1,
                borderRadius: '50%',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SwapIcon color="action" />
            </Box>
            <Divider sx={{ flex: 1 }} />
          </Box>

          <ConferenceCard 
            conference={conflict.new_conference}
            type="new"
          />
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">
              Votre inscription à "{conflict.existing_conference.title}" sera automatiquement annulée
            </Typography>
          </Box>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          startIcon={<CancelIcon />}
        >
          Annuler
        </Button>
        <Button
          onClick={onReplace}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <SwapIcon />}
        >
          {loading ? 'Remplacement...' : 'Confirmer le remplacement'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConflictDialog 