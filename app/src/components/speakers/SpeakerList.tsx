import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Chip
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import type { Speaker } from '../../lib/supabase'

interface SpeakerListProps {
  speakers: Speaker[]
  loading: boolean
  loadingError: string | null
  onEdit: (speaker: Speaker) => void
  onDelete: (speakerId: string) => void
}

export const SpeakerList: React.FC<SpeakerListProps> = ({
  speakers,
  loading,
  loadingError,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <Box textAlign="center" py={4}>
        <Typography>Chargement des conférenciers...</Typography>
      </Box>
    )
  }

  if (loadingError) {
    return (
      <Alert severity="error">
        Erreur lors du chargement des conférenciers: {loadingError}
      </Alert>
    )
  }

  if (speakers.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              🎤 Aucun conférencier enregistré
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Créez votre premier conférencier pour commencer !
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {speakers.map((speaker) => (
        <Card key={speaker.id} variant="outlined">
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              {/* Speaker info */}
              <Box display="flex" gap={3} flex={1} sx={{ mr: 2 }}>
                {/* Avatar */}
                <Avatar
                  src={speaker.photo}
                  sx={{ width: 64, height: 64 }}
                >
                  <PersonIcon />
                </Avatar>
                
                {/* Details */}
                <Box flex={1}>
                  <Typography variant="h6" gutterBottom>
                    {speaker.name}
                  </Typography>
                  
                  {speaker.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {speaker.bio.length > 200 
                        ? `${speaker.bio.substring(0, 200)}...`
                        : speaker.bio
                      }
                    </Typography>
                  )}
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={new Date(speaker.created_at).toLocaleDateString('fr-FR')}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </Box>
              </Box>

              {/* Action buttons */}
              <Box display="flex" gap={1}>
                <Tooltip title="Modifier">
                  <IconButton
                    color="primary"
                    onClick={() => onEdit(speaker)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Supprimer">
                  <IconButton
                    color="error"
                    onClick={() => onDelete(speaker.id)}
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

export default SpeakerList 