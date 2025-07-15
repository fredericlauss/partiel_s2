import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Container, Typography, CircularProgress, Box } from '@mui/material'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg">
      {user ? <Dashboard /> : <AuthPage />}
    </Container>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" textAlign="center" gutterBottom>
            🎪 Salon d'Affaires
          </Typography>
          <Typography variant="subtitle1" textAlign="center" color="text.secondary" gutterBottom>
            Planifiez votre venue et choisissez vos conférences
          </Typography>
          <AppContent />
        </Box>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
