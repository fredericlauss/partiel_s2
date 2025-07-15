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
  Tab
} from '@mui/material'
import { 
  Event as EventIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'
import { useConferences } from '../hooks/useConferences'
import ConferenceForm from '../components/conferences/ConferenceForm'
import ConferenceList from '../components/conferences/ConferenceList'
import type { Conference, ConferenceCreateInput, ConferenceUpdateInput } from '../lib/supabase'

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
    loading,
    error,
    createConference,
    updateConference,
    deleteConference,
    checkAvailability,
    getTimeSlotAvailability
  } = useConferences()

  const [activeTab, setActiveTab] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingConference, setEditingConference] = useState<Conference | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conferenceToDelete, setConferenceToDelete] = useState<string | null>(null)
  const [operationLoading, setOperationLoading] = useState(false)

  // Mock stats - TODO: implement real statistics
  const stats = {
    totalConferences: conferences.length,
    totalRegistrations: conferences.length * 12, // Mock calculation
    roomOccupancy: Math.round((conferences.length / (rooms.length * timeSlots.length / 3)) * 100) || 0,
    todayConferences: conferences.filter(c => c.time_slot?.day === 1).length
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    setShowForm(false)
    setEditingConference(null)
  }

  const handleFormSubmit = async (data: ConferenceCreateInput | ConferenceUpdateInput): Promise<boolean> => {
    setOperationLoading(true)
    try {
      let success = false
      
      if ('id' in data) {
        success = await updateConference(data)
      } else {
        success = await createConference(data)
      }

      if (success) {
        setShowForm(false)
        setEditingConference(null)
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
      await deleteConference(conferenceToDelete)
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard Organisateur
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Bienvenue, {user?.profile?.first_name} {user?.profile?.last_name}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
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
        </Tabs>
      </Card>

      <TabPanel value={activeTab} index={0}>
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
                    Inscriptions totales
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalRegistrations}
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
                    Conférences Jour 1
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

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Actions rapides
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
              gap={2}
            >
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                size="large"
                onClick={() => {
                  setEditingConference(null)
                  setShowForm(true)
                  setActiveTab(1)
                }}
              >
                Nouvelle conférence
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setActiveTab(1)}
              >
                Gérer les conférences
              </Button>
            </Box>
          </CardContent>
        </Card>
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
    </Box>
  )
}

export default OrganizerPage 