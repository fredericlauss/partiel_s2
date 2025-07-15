import { supabase } from '../lib/supabase'
import type { UserRole, Profile } from '../lib/supabase'

// Récupérer le profil utilisateur
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// Récupérer tous les profils (pour admin)
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Récupérer les profils par rôle
export async function getProfilesByRole(role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// S'inscrire (créer un compte)
export async function signUp(
  email: string, 
  password: string, 
  userData: {
    first_name: string
    last_name: string
    role: UserRole
    company?: string
    phone?: string
  }
) {
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password
  })

  if (authError || !data.user) {
    return { error: authError }
  }

  const { error: profileError } = await supabase
    .rpc('create_user_profile', {
      user_id: data.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      company: userData.company || null,
      phone: userData.phone || null
    })

  if (profileError) {
    console.error('Erreur de création de profil:', profileError)
    return { error: new Error('Erreur lors de la création du profil') }
  }

  return { error: null }
}

// Se connecter
export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { error }
}

// Se déconnecter
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Mettre à jour le profil utilisateur
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Changer le mot de passe
export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  return { error }
}

// Réinitialiser le mot de passe
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return { error }
}

// Récupérer la session actuelle
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}

// Récupérer l'utilisateur actuel
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}

// Vérifier si un email existe déjà
export async function checkEmailExists(email: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw error
  }

  return !!data // true si l'email existe
}

// Mettre à jour l'email
export async function updateEmail(newEmail: string) {
  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  return { error }
}

// Supprimer un compte utilisateur (admin seulement)
export async function deleteUser(userId: string) {
  // D'abord supprimer le profil
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) throw profileError

  // Note: La suppression du compte auth doit être faite côté serveur
  // avec les permissions admin de Supabase
  return { success: true }
}

// Changer le rôle d'un utilisateur (admin seulement)
export async function changeUserRole(userId: string, newRole: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
} 