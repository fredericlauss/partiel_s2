import React, { useState } from 'react'
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert
} from '@mui/material'
import { 
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Login as LoginIcon,
  EventNote as ProgramIcon,
  DeleteForever as DeleteAccountIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'

const Header: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut, deleteAccount } = useAuth()
  const { userRole, isLoggedIn, isOrganizer } = usePermissions()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth', { replace: true })
  }

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true)
    setConfirmationText('')
    setDeleteError(null)
  }

  const confirmDeleteAccount = async () => {
    if (confirmationText !== 'SUPPRIMER') {
      setDeleteError('Veuillez taper "SUPPRIMER" pour confirmer')
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      const result = await deleteAccount()
      
      if (result.error) {
        setDeleteError(result.error.message)
        setDeleting(false)
      } else {
        setDeleteDialogOpen(false)
        setTimeout(() => {
          navigate('/auth', { replace: true })
        }, 200)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error)
      setDeleteError('Erreur lors de la suppression du compte')
      setDeleting(false)
    }
  }

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
              

                <Button
                  color="inherit"
                  onClick={() => navigate('/my-program')}
                  startIcon={<ProgramIcon />}
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
                  Mon Programme
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
                onClick={handleDeleteAccount}
                startIcon={<DeleteAccountIcon />}
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
                Supprimer mon compte
              </Button>

              <Button
                color="inherit"
                onClick={handleSignOut}
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
      
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle color="error">
          ⚠️ Supprimer définitivement votre compte
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            <strong>Cette action est irréversible !</strong>
          </DialogContentText>
          <DialogContentText sx={{ mb: 3 }}>
            Votre compte et toutes vos données seront définitivement supprimées :
            • Votre profil utilisateur
            • Vos inscriptions aux conférences
            • Vos conférences sponsorisées (si organisateur)
          </DialogContentText>
          
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          <DialogContentText sx={{ mb: 1 }}>
            Pour confirmer, tapez <strong>SUPPRIMER</strong> dans le champ ci-dessous :
          </DialogContentText>
          <TextField
            fullWidth
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="SUPPRIMER"
            disabled={deleting}
            error={deleteError === 'Veuillez taper "SUPPRIMER" pour confirmer'}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleting || confirmationText !== 'SUPPRIMER'}
          >
            {deleting ? 'Suppression...' : 'Supprimer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  )
}

export default Header 