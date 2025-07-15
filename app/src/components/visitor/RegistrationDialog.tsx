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
  CircularProgress
} from '@mui/material'
import {
  EventAvailable as RegisterIcon,
  EventBusy as UnregisterIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon
} from '@mui/icons-material'
import type { ConferenceWithRegistration } from '../../lib/supabase'

interface RegistrationDialogProps {
  open: boolean
  conference: ConferenceWithRegistration | null
  action: 'register' | 'unregister'
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  open,
  conference,
  action,
  loading,
  onConfirm,
  onCancel
}) => {
  if (!conference) return null

  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  const formatTimeSlot = () => {
    if (!conference.time_slot) return 'Horaire non défini'
    return `${getDayLabel(conference.time_slot.day)} - ${conference.time_slot.start_time} à ${conference.time_slot.end_time}`
  }

  const isRegisterAction = action === 'register'

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {isRegisterAction ? <RegisterIcon color="primary" /> : <UnregisterIcon color="error" />}
          {isRegisterAction ? 'Confirmer l\'inscription' : 'Confirmer la désinscription'}
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" gutterBottom>
          {isRegisterAction 
            ? 'Voulez-vous vous inscrire à cette conférence ?' 
            : 'Voulez-vous vous désinscrire de cette conférence ?'}
        </Typography>

        <Box 
          sx={{ 
            mt: 2, 
            p: 2, 
            border: 1, 
            borderColor: 'divider', 
            borderRadius: 1,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {conference.title}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {conference.description}
          </Typography>

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

          <Typography variant="body2" color="text.secondary">
            <strong>Conférencier :</strong> {conference.speaker?.name || 'Non défini'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onCancel}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={isRegisterAction ? 'primary' : 'error'}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : (isRegisterAction ? <RegisterIcon /> : <UnregisterIcon />)}
        >
          {loading 
            ? (isRegisterAction ? 'Inscription...' : 'Désinscription...') 
            : (isRegisterAction ? 'S\'inscrire' : 'Se désinscrire')
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RegistrationDialog 