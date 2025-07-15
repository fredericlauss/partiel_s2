import React from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Divider,
  Chip
} from '@mui/material'
import { 
  Event as EventIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

const OrganizerPage: React.FC = () => {
  const { user } = useAuth()

  // Mock data - à remplacer par de vraies données plus tard
  const stats = {
    totalConferences: 42,
    totalAttendees: 156,
    roomOccupancy: 78,
    todayConferences: 14
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          👑 Dashboard Organisateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue, {user?.profile?.first_name} {user?.profile?.last_name}
        </Typography>
      </Box>

      {/* Statistiques */}
      <Box 
        display="grid" 
        gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr" }}
        gap={3}
        sx={{ mb: 4 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Conférences totales
                </Typography>
                <Typography variant="h4">
                  {stats.totalConferences}
                </Typography>
              </Box>
              <EventIcon color="primary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Participants inscrits
                </Typography>
                <Typography variant="h4">
                  {stats.totalAttendees}
                </Typography>
              </Box>
              <PeopleIcon color="primary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Taux occupation
                </Typography>
                <Typography variant="h4">
                  {stats.roomOccupancy}%
                </Typography>
              </Box>
              <AnalyticsIcon color="primary" fontSize="large" />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="text.secondary" gutterBottom>
                  Conférences aujourd'hui
                </Typography>
                <Typography variant="h4">
                  {stats.todayConferences}
                </Typography>
              </Box>
              <EventIcon color="secondary" fontSize="large" />
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
            gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" }}
            gap={2}
          >
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
            >
              Nouvelle conférence
            </Button>
            <Button
              variant="outlined"
              size="large"
            >
              Gérer les salles
            </Button>
            <Button
              variant="outlined"
              size="large"
            >
              Voir les inscriptions
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Status du profil */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Informations du profil
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

export default OrganizerPage 