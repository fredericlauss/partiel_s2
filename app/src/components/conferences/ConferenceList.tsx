import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon,
  Room as RoomIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import type { Conference } from '../../lib/supabase'

interface ConferenceListProps {
  conferences: Conference[]
  loading: boolean
  error: string | null
  onEdit: (conference: Conference) => void
  onDelete: (conferenceId: string) => void
}

export const ConferenceList: React.FC<ConferenceListProps> = ({
  conferences,
  loading,
  error,
  onEdit,
  onDelete
}) => {
  // Format day display
  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  // Format time slot display
  const formatTimeSlot = (conference: Conference) => {
    if (!conference.time_slot) return 'Horaire non défini'
    return `${getDayLabel(conference.time_slot.day)} - ${conference.time_slot.start_time} à ${conference.time_slot.end_time}`
  }

  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Typography>Chargement des conférences...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors du chargement des conférences: {error}
      </Alert>
    )
  }

  if (conferences.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              📋 Aucune conférence programmée
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Créez votre première conférence pour commencer !
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {conferences.map((conference) => (
        <Card key={conference.id} variant="outlined">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              {/* Conference info */}
              <Box flex={1} sx={{ mr: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {conference.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {conference.description}
                </Typography>

                {/* Conference details chips */}
                <Box display="flex" gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    icon={<TimeIcon />}
                    label={formatTimeSlot(conference)}
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

                {/* Speaker info */}
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar
                    src={conference.speaker?.photo}
                    sx={{ width: 32, height: 32 }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {conference.speaker?.name || 'Conférencier non défini'}
                    </Typography>
                    {conference.speaker?.bio && (
                      <Typography variant="caption" color="text.secondary">
                        {conference.speaker.bio.length > 80 
                          ? `${conference.speaker.bio.substring(0, 80)}...`
                          : conference.speaker.bio
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Action buttons */}
              <Box display="flex" gap={1}>
                <Tooltip title="Modifier">
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(conference)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton
                    color="error"
                    onClick={() => onDelete(conference.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}

export default ConferenceList 