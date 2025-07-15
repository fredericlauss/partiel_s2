import { useAuth } from './useAuth'

export const usePermissions = () => {
  const { user } = useAuth()
  const userRole = user?.profile?.role

  return {
    canManageConferences: userRole === 'organizer',
    canViewAllProfiles: userRole === 'organizer',
    canViewDashboard: userRole === 'organizer',
    
    canViewSchedule: userRole === 'visitor' || userRole === 'organizer',
    canBookConferences: userRole === 'visitor',
    
    canEditSponsoredConferences: userRole === 'sponsor',
    canViewSponsorDashboard: userRole === 'sponsor',
    
    isLoggedIn: !!user,
    isOrganizer: userRole === 'organizer',
    isVisitor: userRole === 'visitor',
    isSponsor: userRole === 'sponsor',
    
    userRole,
    user
  }
} 