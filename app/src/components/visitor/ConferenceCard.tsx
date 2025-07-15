import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Badge
} from '@mui/material'
import {
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon,
  EventAvailable as RegisteredIcon,
  Add as RegisterIcon,
  Remove as UnregisterIcon
} from '@mui/icons-material'
import type { ConferenceWithRegistration } from '../../lib/supabase'

interface ConferenceCardProps {
  conference: ConferenceWithRegistration
  onRegister: (conference: ConferenceWithRegistration) => void
  onUnregister: (conference: ConferenceWithRegistration) => void
  loading?: boolean
}

export const ConferenceCard: React.FC<ConferenceCardProps> = ({
  conference,
  onRegister,
  onUnregister,
  loading = false
}) => {
  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  const formatTimeSlot = () => {
    if (!conference.time_slot) return 'Horaire non défini'
    return `${getDayLabel(conference.time_slot.day)} - ${conference.time_slot.start_time} à ${conference.time_slot.end_time}`
  }

  const isRegistered = conference.is_registered

  const handleAction = () => {
    if (isRegistered) {
      onUnregister(conference)
    } else {
      onRegister(conference)
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        border: isRegistered ? '2px solid' : '1px solid',
        borderColor: isRegistered ? 'success.main' : 'divider',
        backgroundColor: isRegistered ? 'success.light' : 'background.paper',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Registration status badge */}
      {isRegistered && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        >
          <Badge
            badgeContent={<RegisteredIcon sx={{ fontSize: 16 }} />}
            color="success"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'success.main',
                color: 'white',
                borderRadius: '50%',
                width: 28,
                height: 28
              }
            }}
          />
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography variant="h6" gutterBottom sx={{ 
          fontWeight: isRegistered ? 600 : 500,
          color: isRegistered ? 'success.dark' : 'text.primary'
        }}>
          {conference.title}
        </Typography>

        {/* Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mb: 2, flexGrow: 1 }}
        >
          {conference.description.length > 120 
            ? `${conference.description.substring(0, 120)}...`
            : conference.description
          }
        </Typography>

        {/* Time and Room chips */}
        <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            icon={<TimeIcon />}
            label={formatTimeSlot()}
            size="small"
            color={isRegistered ? 'success' : 'primary'}
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

        {/* Speaker info */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
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

        {/* Action button */}
        <Box mt="auto">
          <Button
            fullWidth
            variant={isRegistered ? 'outlined' : 'contained'}
            color={isRegistered ? 'error' : 'primary'}
            startIcon={isRegistered ? <UnregisterIcon /> : <RegisterIcon />}
            onClick={handleAction}
            disabled={loading}
            sx={{
              fontWeight: 600,
              py: 1.5,
              ...(isRegistered && {
                '&:hover': {
                  backgroundColor: 'error.light',
                  borderColor: 'error.main'
                }
              })
            }}
          >
            {loading 
              ? (isRegistered ? 'Désinscription...' : 'Inscription...') 
              : (isRegistered ? 'Se désinscrire' : 'S\'inscrire')
            }
          </Button>
        </Box>

        {/* Registration status text */}
        {isRegistered && (
          <Typography 
            variant="caption" 
            color="success.dark" 
            align="center" 
            sx={{ mt: 1, fontWeight: 600 }}
          >
            ✓ Vous êtes inscrit
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default ConferenceCard 