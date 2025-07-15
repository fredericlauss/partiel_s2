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
  Business as BusinessIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { userRole, isLoggedIn, isOrganizer } = usePermissions()

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
        
        {isLoggedIn ? (
          <>
            <Box display="flex" alignItems="center" gap={1} sx={{ mr: 2 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon />}
                size="small"
              >
                Accueil
              </Button>
              
              {isOrganizer && (
                <Button
                  color="inherit"
                  onClick={() => navigate('/organizer')}
                  startIcon={<DashboardIcon />}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Dashboard
                </Button>
              )}
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
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
          </>
        ) : (
          <Button
            color="inherit"
            onClick={() => navigate('/auth')}
            startIcon={<LoginIcon />}
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
            Se connecter
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Header 