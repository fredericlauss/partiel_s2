import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  InputAdornment, 
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  Business,
  Phone
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth'
import type { UserRole } from '../../lib/supabase'

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  first_name: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  last_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['organizer', 'visitor', 'sponsor'] as const),
  company: z.string().optional(),
  phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onMessage: (type: 'success' | 'error', message: string) => void
  onSuccess: () => void
}

export default function RegisterForm({ onMessage, onSuccess }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'visitor'
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    
    try {
      const { error } = await signUp(data.email, data.password, {
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        company: data.company,
        phone: data.phone
      })
      
      if (error) {
        onMessage('error', error.message || 'Erreur lors de l\'inscription')
      } else {
        onMessage('success', 'Inscription réussie ! Vous pouvez maintenant vous connecter.')
        onSuccess()
      }
    } catch {
      onMessage('error', 'Erreur lors de l\'inscription')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'organizer': return 'Organisateur (Admin)'
      case 'visitor': return 'Visiteur'
      case 'sponsor': return 'Sponsor'
      default: return role
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" gutterBottom textAlign="center">
        S'inscrire
      </Typography>
      
      <TextField
        {...register('email')}
        fullWidth
        label="Email"
        type="email"
        error={!!errors.email}
        helperText={errors.email?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Email />
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          {...register('first_name')}
          fullWidth
          label="Prénom"
          error={!!errors.first_name}
          helperText={errors.first_name?.message}
          margin="normal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          {...register('last_name')}
          fullWidth
          label="Nom"
          error={!!errors.last_name}
          helperText={errors.last_name?.message}
          margin="normal"
        />
      </Box>

      <FormControl fullWidth margin="normal" error={!!errors.role}>
        <InputLabel>Rôle</InputLabel>
        <Select
          {...register('role')}
          value={selectedRole}
          label="Rôle"
        >
          <MenuItem value="visitor">{getRoleLabel('visitor')}</MenuItem>
          <MenuItem value="organizer">{getRoleLabel('organizer')}</MenuItem>
          <MenuItem value="sponsor">{getRoleLabel('sponsor')}</MenuItem>
        </Select>
        {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
      </FormControl>

      <TextField
        {...register('company')}
        fullWidth
        label="Entreprise (optionnel)"
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Business />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...register('phone')}
        fullWidth
        label="Téléphone (optionnel)"
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Phone />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...register('password')}
        fullWidth
        label="Mot de passe"
        type={showPassword ? 'text' : 'password'}
        error={!!errors.password}
        helperText={errors.password?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...register('confirmPassword')}
        fullWidth
        label="Confirmer le mot de passe"
        type={showConfirmPassword ? 'text' : 'password'}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Lock />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? 'Inscription...' : 'S\'inscrire'}
      </Button>
    </Box>
  )
} 