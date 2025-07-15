import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { usePermissions } from '../../hooks/usePermissions'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'organizer' | 'visitor' | 'sponsor'
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requireAuth = true,
  fallback 
}) => {
  const { isLoggedIn, userRole } = usePermissions()
  const { signOut } = useAuth()

  // Si l'utilisateur n'est pas connecté et que l'auth est requise
  if (requireAuth && !isLoggedIn) {
    return fallback || (
      <Box textAlign="center" py={4}>
        <Typography variant="h5" gutterBottom>
          🔒 Accès restreint
        </Typography>
        <Typography color="text.secondary">
          Vous devez être connecté pour accéder à cette page.
        </Typography>
      </Box>
    )
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (requiredRole && userRole !== requiredRole) {
    return fallback || (
      <Box textAlign="center" py={4}>
        <Typography variant="h5" gutterBottom>
          ⛔ Accès non autorisé
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Votre rôle ({userRole}) ne vous permet pas d'accéder à cette page.
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Rôle requis: {requiredRole}
        </Typography>
        <Button 
          variant="outlined" 
          onClick={signOut}
          sx={{ mt: 2 }}
        >
          Se déconnecter
        </Button>
      </Box>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute 