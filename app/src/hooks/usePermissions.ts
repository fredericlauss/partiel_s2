import { useAuth } from './useAuth'

export const usePermissions = () => {
  const { user } = useAuth()
  const userRole = user?.profile?.role

  return {
    // Permissions pour les organisateurs (admin)
    canManageConferences: userRole === 'organizer',
    canViewAllProfiles: userRole === 'organizer',
    canViewDashboard: userRole === 'organizer',
    
    // Permissions pour les visiteurs
    canViewSchedule: userRole === 'visitor' || userRole === 'organizer',
    canBookConferences: userRole === 'visitor',
    
    // Permissions pour les sponsors
    canEditSponsoredConferences: userRole === 'sponsor',
    canViewSponsorDashboard: userRole === 'sponsor',
    
    // Permissions communes
    isLoggedIn: !!user,
    isOrganizer: userRole === 'organizer',
    isVisitor: userRole === 'visitor',
    isSponsor: userRole === 'sponsor',
    
    // Rôle actuel
    userRole,
    user
  }
} 