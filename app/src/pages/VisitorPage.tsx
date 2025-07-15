import React from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Divider
} from '@mui/material'
import { 
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  BookmarkBorder as BookmarkIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

const VisitorPage: React.FC = () => {
  const { user } = useAuth()

  // Mock data - à remplacer par de vraies données plus tard
  const upcomingConferences = [
    {
      id: 1,
      title: "Innovation et IA dans l'entreprise",
      time: "09:00 - 09:45",
      room: "Salle 3",
      speaker: "Dr. Marie Dupont"
    },
    {
      id: 2,
      title: "Marketing Digital 2024",
      time: "14:00 - 14:45", 
      room: "Salle 7",
      speaker: "Jean Martin"
    }
  ]

  const stats = {
    registeredConferences: upcomingConferences.length,
    availableConferences: 28,
    completedConferences: 3
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          🎯 Mon Planning
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue, {user?.profile?.first_name} {user?.profile?.last_name}
        </Typography>
      </Box>

      {/* Statistiques visiteur */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr 1fr" }}
        gap={3}
        sx={{ mb: 4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Mes conférences
                </Typography>
                <Typography variant="h4">
                  {stats.registeredConferences}
                </Typography>
              </Box>
              <BookmarkIcon color="primary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Disponibles
                </Typography>
                <Typography variant="h4">
                  {stats.availableConferences}
                </Typography>
              </Box>
              <SearchIcon color="primary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Terminées
                </Typography>
                <Typography variant="h4">
                  {stats.completedConferences}
                </Typography>
              </Box>
              <ScheduleIcon color="secondary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Actions rapides */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Actions rapides
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box 
            display="grid" 
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
            gap={2}
          >
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              size="large"
            >
              Parcourir les conférences
            </Button>
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              size="large"
            >
              Mon planning complet
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Mes prochaines conférences */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📅 Mes prochaines conférences
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {upcomingConferences.length > 0 ? (
            <Box display="flex" flexDirection="column" gap={2}>
              {upcomingConferences.map((conference) => (
                <Card key={conference.id} variant="outlined">
                  <CardContent sx={{ py: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start">
                      <Box flex={1}>
                        <Typography variant="h6" gutterBottom>
                          {conference.title}
                        </Typography>
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Chip 
                            label={conference.time} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={conference.room} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                          <Chip 
                            icon={<PersonIcon />}
                            label={conference.speaker} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                      <Button 
                        size="small" 
                        color="error" 
                        variant="outlined"
                      >
                        Annuler
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                Aucune conférence programmée
              </Typography>
              <Button 
                variant="contained" 
                sx={{ mt: 2 }}
                startIcon={<SearchIcon />}
              >
                Découvrir les conférences
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Informations profil */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            👤 Mon profil
          </Typography>
          <Box display="flex" gap={1} sx={{ mb: 2 }}>
            <Chip 
              label={`Rôle: ${user?.profile?.role}`} 
              color="primary" 
              variant="outlined" 
            />
            <Chip 
              label={`Email: ${user?.email}`} 
              color="secondary" 
              variant="outlined" 
            />
          </Box>
          {user?.profile?.company && (
            <Typography variant="body2" color="text.secondary">
              Entreprise: {user.profile.company}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default VisitorPage 