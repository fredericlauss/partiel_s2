import { Box, Paper, Typography, Button, Chip } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'organizer': return 'error'
      case 'visitor': return 'primary'
      case 'sponsor': return 'secondary'
      default: return 'default'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'organizer': return 'Organisateur'
      case 'visitor': return 'Visiteur'
      case 'sponsor': return 'Sponsor'
      default: return role
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2">
            Tableau de bord
          </Typography>
          <Button variant="outlined" onClick={handleSignOut}>
            Se déconnecter
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Bienvenue, {user?.profile?.first_name} {user?.profile?.last_name} !
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Email: {user?.email}
          </Typography>
          {user?.profile?.role && (
            <Chip 
              label={getRoleLabel(user.profile.role)} 
              color={getRoleColor(user.profile.role)}
              sx={{ mt: 1 }}
            />
          )}
        </Box>

        {user?.profile?.company && (
          <Typography variant="body2" color="text.secondary">
            Entreprise: {user.profile.company}
          </Typography>
        )}

        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            🚧 En cours de développement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Les fonctionnalités suivantes seront bientôt disponibles :
          </Typography>
          <ul style={{ marginTop: 8, paddingLeft: 20 }}>
            {user?.profile?.role === 'organizer' ? (
              <>
                <li>Gestion des conférences</li>
                <li>Dashboard avec statistiques</li>
                <li>Gestion des utilisateurs</li>
              </>
            ) : (
              <>
                <li>Parcourir les conférences</li>
                <li>Planifier votre programme</li>
                <li>Filtres par salle et conférencier</li>
              </>
            )}
          </ul>
        </Box>
      </Paper>
    </Box>
  )
} 