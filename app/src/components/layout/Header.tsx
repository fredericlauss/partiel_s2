import React from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip,
  Avatar
} from '@mui/material'
import { 
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'

const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const { userRole, isLoggedIn } = usePermissions()

  if (!isLoggedIn) return null

  const getRoleIcon = () => {
    switch (userRole) {
      case 'organizer':
        return <AdminIcon />
      case 'sponsor':
        return <BusinessIcon />
      default:
        return <PersonIcon />
    }
  }

  const getRoleColor = () => {
    switch (userRole) {
      case 'organizer':
        return 'error'
      case 'sponsor':
        return 'warning'
      default:
        return 'primary'
    }
  }

  const getRoleLabel = () => {
    switch (userRole) {
      case 'organizer':
        return 'Organisateur'
      case 'visitor':
        return 'Visiteur'
      case 'sponsor':
        return 'Sponsor'
      default:
        return userRole
    }
  }

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          🎪 Salon d'Affaires
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          {/* Informations utilisateur */}
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: getRoleColor() + '.main' }}>
              {user?.profile?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
            </Avatar>
            <Box display="flex" flexDirection="column" alignItems="flex-start">
              <Typography variant="body2" color="inherit">
                {user?.profile?.first_name} {user?.profile?.last_name}
              </Typography>
              <Chip 
                icon={getRoleIcon()}
                label={getRoleLabel()}
                size="small"
                color={getRoleColor()}
                variant="outlined"
                sx={{ 
                  height: 20, 
                  fontSize: '0.7rem',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)'
                }}
              />
            </Box>
          </Box>

          {/* Bouton déconnexion */}
          <Button
            color="inherit"
            onClick={signOut}
            startIcon={<LogoutIcon />}
            variant="outlined"
            size="small"
            sx={{ 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header 