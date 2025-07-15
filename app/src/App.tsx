import { ThemeProvider, createTheme } from '@mui/material/styles'
import { CssBaseline, Container, Typography, CircularProgress, Box } from '@mui/material'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import AuthPage from './pages/AuthPage'
import OrganizerPage from './pages/OrganizerPage'
import VisitorPage from './pages/VisitorPage'
import ProtectedRoute from './components/auth/ProtectedRoute'


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
    <Router>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          {/* Route d'authentification */}
          <Route 
            path="/auth" 
            element={
              user ? <Navigate to="/" replace /> : <AuthPage />
            } 
          />
          
          {/* Routes protégées par rôle */}
          <Route 
            path="/organizer" 
            element={
              <ProtectedRoute requiredRole="organizer">
                <OrganizerPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/visitor" 
            element={
              <ProtectedRoute requiredRole="visitor">
                <VisitorPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/sponsor" 
            element={
              <ProtectedRoute requiredRole="sponsor">
                <Box textAlign="center" py={8}>
                  <Typography variant="h4" gutterBottom>
                    🏢 Espace Sponsor
                  </Typography>
                  <Typography color="text.secondary">
                    Interface sponsor en cours de développement...
                  </Typography>
                </Box>
              </ProtectedRoute>
            } 
          />
          
          {/* Page principale - tout le monde va ici */}
          <Route 
            path="/" 
            element={
              user ? <VisitorPage /> : <Navigate to="/auth" replace />
            } 
          />
          
          {/* Route catch-all */}
          <Route 
            path="*" 
            element={
              <Box textAlign="center" py={8}>
                <Typography variant="h4" gutterBottom>
                  404 - Page non trouvée
                </Typography>
                <Typography color="text.secondary">
                  Cette page n'existe pas.
                </Typography>
              </Box>
            } 
          />
        </Routes>
      </Container>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
