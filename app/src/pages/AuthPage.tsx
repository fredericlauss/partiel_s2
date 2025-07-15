import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Paper, Tabs, Tab, Alert } from '@mui/material'
import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props

  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function AuthPage() {
  const [tabValue, setTabValue] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirection automatique après connexion
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setMessage(null)
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper elevation={3}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Se connecter" />
          <Tab label="S'inscrire" />
        </Tabs>

        {message && (
          <Box sx={{ p: 2, pb: 0 }}>
            <Alert severity={message.type} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          </Box>
        )}

        <TabPanel value={tabValue} index={0}>
          <LoginForm onMessage={showMessage} />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <RegisterForm 
            onMessage={showMessage} 
            onSuccess={() => setTabValue(0)}
          />
        </TabPanel>
      </Paper>
    </Box>
  )
} 