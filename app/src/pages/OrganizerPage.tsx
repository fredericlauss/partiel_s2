import React, { useState } from 'react'
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  Chip,
  Snackbar
} from '@mui/material'
import { 
  Event as EventIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  List as ListIcon,
  TrendingUp as TrendingIcon,
  Room as RoomIcon,
  Star as StarIcon,
  Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useConferences } from '../hooks/useConferences'
import { useStatistics } from '../hooks/useStatistics'
import { useSpeakers } from '../hooks/useSpeakers'
import ConferenceForm from '../components/conferences/ConferenceForm'
import ConferenceList from '../components/conferences/ConferenceList'
import SpeakerForm from '../components/speakers/SpeakerForm'
import SpeakerList from '../components/speakers/SpeakerList'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput, Speaker } from '../lib/supabase'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const OrganizerPage: React.FC = () => {
  const { user } = useAuth()
  const {
    conferences,
    rooms,
    timeSlots,
    speakers,
    loading,
    error,
    createConference,
    updateConference,
    deleteConference,
    checkAvailability,
    getTimeSlotAvailability
  } = useConferences()

  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useStatistics()
  
  const {
    speakers: allSpeakers,
    loading: speakersLoading,
    loadingError: speakersError,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker
  } = useSpeakers()

  const [activeTab, setActiveTab] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingConference, setEditingConference] = useState<Conference | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conferenceToDelete, setConferenceToDelete] = useState<string | null>(null)
  const [operationLoading, setOperationLoading] = useState(false)

  // Speaker management states
  const [showSpeakerForm, setShowSpeakerForm] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [deleteSpeakerDialogOpen, setDeleteSpeakerDialogOpen] = useState(false)
  const [speakerToDelete, setSpeakerToDelete] = useState<string | null>(null)

  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success'
  })

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setShowForm(false)
    setEditingConference(null)
    setShowSpeakerForm(false)
    setEditingSpeaker(null)
  }

  const handleFormSubmit = async (data: ConferenceCreateInput | ConferenceUpdateInput): Promise<boolean> => {
    setOperationLoading(true)
    try {
      let success = false
      let isUpdate = false
      
      if ('id' in data) {
        success = await updateConference(data)
        isUpdate = true
      } else {
        success = await createConference(data)
      }

      if (success) {
        setShowForm(false)
        setEditingConference(null)
        refreshStats()
        
        setNotification({
          open: true,
          message: isUpdate ? 'Conférence modifiée avec succès !' : 'Conférence créée avec succès !',
          severity: 'success'
        })
      } else {
        setNotification({
          open: true,
          message: isUpdate ? 'Erreur lors de la modification de la conférence' : 'Erreur lors de la création de la conférence',
          severity: 'error'
        })
      }
      
      return success
    } finally {
      setOperationLoading(false)
    }
  }

  const handleEditConference = (conference: Conference) => {
    setEditingConference(conference)
    setShowForm(true)
    setActiveTab(1)
  }

  const handleDeleteConference = (conferenceId: string) => {
    setConferenceToDelete(conferenceId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!conferenceToDelete) return

    setOperationLoading(true)
    try {
      const success = await deleteConference(conferenceToDelete)
      if (success) {
        
        refreshStats()
        
        setNotification({
          open: true,
          message: 'Conférence supprimée avec succès !',
          severity: 'success'
        })
      } else {
        setNotification({
          open: true,
          message: 'Erreur lors de la suppression de la conférence',
          severity: 'error'
        })
      }
      setDeleteDialogOpen(false)
      setConferenceToDelete(null)
    } finally {
      setOperationLoading(false)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingConference(null)
  }

  // Speaker handlers
  const handleSpeakerFormSubmit = async (data: { id?: string; name: string; photo?: string; bio?: string }): Promise<boolean> => {
    setOperationLoading(true)
    try {
      let result: { success: boolean; error?: string }
      let isUpdate = false
      
      if ('id' in data && data.id) {
        result = await updateSpeaker(data as { id: string; name: string; photo?: string; bio?: string })
        isUpdate = true
      } else {
        const { ...createData } = data
        result = await createSpeaker(createData)
      }

      if (result.success) {
        setShowSpeakerForm(false)
        setEditingSpeaker(null)
        
        setNotification({
          open: true,
          message: isUpdate ? 'Conférencier modifié avec succès !' : 'Conférencier créé avec succès !',
          severity: 'success'
        })
      } else {
        setNotification({
          open: true,
          message: result.error || (isUpdate ? 'Erreur lors de la modification du conférencier' : 'Erreur lors de la création du conférencier'),
          severity: 'error'
        })
      }
      
      return result.success
    } finally {
      setOperationLoading(false)
    }
  }

  const handleEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker)
    setShowSpeakerForm(true)
    setActiveTab(2)
  }

  const handleDeleteSpeaker = (speakerId: string) => {
    setSpeakerToDelete(speakerId)
    setDeleteSpeakerDialogOpen(true)
  }

  const confirmDeleteSpeaker = async () => {
    if (!speakerToDelete) return

    setOperationLoading(true)
    try {
      const result = await deleteSpeaker(speakerToDelete)
      if (result.success) {
        setNotification({
          open: true,
          message: 'Conférencier supprimé avec succès !',
          severity: 'success'
        })
      } else {
        setNotification({
          open: true,
          message: result.error || 'Erreur lors de la suppression du conférencier',
          severity: 'error'
        })
      }
      setDeleteSpeakerDialogOpen(false)
      setSpeakerToDelete(null)
    } finally {
      setOperationLoading(false)
    }
  }

  const handleCancelSpeakerForm = () => {
    setShowSpeakerForm(false)
    setEditingSpeaker(null)
  }

  const getDayLabel = (day: number) => {
    const dayLabels = { 1: 'Jour 1', 2: 'Jour 2', 3: 'Jour 3' }
    return dayLabels[day as keyof typeof dayLabels] || `Jour ${day}`
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          📊 Dashboard Organisateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue, {user?.profile?.first_name} {user?.profile?.last_name}
        </Typography>
      </Box>

      {(error || statsError || speakersError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || statsError || speakersError}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Vue d'ensemble" 
            icon={<AnalyticsIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Gestion des conférences" 
            icon={<ListIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Gestion des conférenciers" 
            icon={<PersonIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      <TabPanel value={activeTab} index={0}>
        {statsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Chargement des statistiques...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Statistiques principales */}
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
                        {stats?.totalConferences || 0}
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
                        Inscriptions totales
                      </Typography>
                      <Typography variant="h4">
                        {stats?.totalRegistrations || 0}
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
                        Taux d'occupation
                      </Typography>
                      <Typography variant="h4">
                        {stats?.overallUtilizationRate || 0}%
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
                        Moyenne inscriptions
                      </Typography>
                      <Typography variant="h4">
                        {stats?.averageAttendanceRate || 0}
                      </Typography>
                    </Box>
                    <TrendingIcon color="secondary" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Répartition par jour */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📅 Répartition des conférences par jour
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box display="flex" flexDirection="column" gap={2}>
                  {stats?.conferencesPerDay.map((dayData) => (
                    <Box key={dayData.day}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {getDayLabel(dayData.day)}
                        </Typography>
                        <Chip 
                          label={`${dayData.count} conférence${dayData.count !== 1 ? 's' : ''}`}
                          color="primary"
                          size="small"
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(dayData.count / (stats.totalConferences || 1)) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Utilisation des salles */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏢 Taux d'utilisation des salles
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box 
                  display="grid" 
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" }}
                  gap={2}
                >
                  {stats?.roomUtilization.map((roomData) => (
                    <Card key={roomData.room.id} variant="outlined">
                      <CardContent sx={{ py: 2 }}>
                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                          <RoomIcon fontSize="small" color="secondary" />
                          <Typography variant="subtitle2" fontWeight="medium">
                            {roomData.room.name}
                          </Typography>
                        </Box>
                        <Typography variant="h5" color="primary" gutterBottom>
                          {roomData.utilizationRate}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {roomData.conferenceCount} conférence{roomData.conferenceCount !== 1 ? 's' : ''}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={roomData.utilizationRate}
                          sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          color={roomData.utilizationRate > 75 ? 'warning' : 'primary'}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Conférences les plus populaires */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⭐ Conférences les plus populaires
                </Typography>
                <Divider sx={{ my: 2 }} />
                {stats?.popularConferences.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={2}>
                    Aucune inscription pour le moment
                  </Typography>
                ) : (
                  <Box display="flex" flexDirection="column" gap={2}>
                    {stats?.popularConferences.map((confData, index) => (
                      <Card key={confData.conference.id} variant="outlined">
                        <CardContent sx={{ py: 2 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="start">
                            <Box flex={1}>
                              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                                <StarIcon 
                                  fontSize="small" 
                                  color={index === 0 ? 'warning' : 'action'} 
                                />
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {confData.conference.title}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {confData.conference.speaker?.name || 'Conférencier non défini'} • {confData.conference.room?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {confData.conference.time_slot && 
                                  `${getDayLabel(confData.conference.time_slot.day)} - ${confData.conference.time_slot.start_time}`
                                }
                              </Typography>
                            </Box>
                            <Chip 
                              label={`${confData.registrationCount} inscription${confData.registrationCount !== 1 ? 's' : ''}`}
                              color={index === 0 ? 'warning' : 'primary'}
                              size="small"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">
            Gestion des conférences
          </Typography>
          {!showForm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingConference(null)
                setShowForm(true)
              }}
            >
              Nouvelle conférence
            </Button>
          )}
        </Box>

        {showForm ? (
          <ConferenceForm
            conference={editingConference || undefined}
            rooms={rooms}
            timeSlots={timeSlots}
            speakers={speakers}
            loading={operationLoading}
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            checkAvailability={checkAvailability}
            getTimeSlotAvailability={getTimeSlotAvailability}
          />
        ) : (
          <ConferenceList
            conferences={conferences}
            loading={loading}
            error={error}
            onEdit={handleEditConference}
            onDelete={handleDeleteConference}
          />
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">
            Gestion des conférenciers
          </Typography>
          {!showSpeakerForm && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingSpeaker(null)
                setShowSpeakerForm(true)
              }}
            >
              Nouveau conférencier
            </Button>
          )}
        </Box>

        {showSpeakerForm ? (
          <SpeakerForm
            speaker={editingSpeaker || undefined}
            loading={operationLoading}
            onSubmit={handleSpeakerFormSubmit}
            onCancel={handleCancelSpeakerForm}
          />
        ) : (
          <SpeakerList
            speakers={allSpeakers}
            loading={speakersLoading}
            loadingError={speakersError}
            onEdit={handleEditSpeaker}
            onDelete={handleDeleteSpeaker}
          />
        )}
      </TabPanel>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette conférence ? 
            Cette action est irréversible et supprimera également toutes les inscriptions associées.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={operationLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            disabled={operationLoading}
          >
            {operationLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete speaker confirmation dialog */}
      <Dialog open={deleteSpeakerDialogOpen} onClose={() => setDeleteSpeakerDialogOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce conférencier ? 
            Cette action est irréversible et le conférencier ne pourra plus être associé à de nouvelles conférences.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteSpeakerDialogOpen(false)}
            disabled={operationLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmDeleteSpeaker}
            color="error"
            disabled={operationLoading}
          >
            {operationLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default OrganizerPage 