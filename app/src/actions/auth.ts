import { supabase } from '../lib/supabase'
import type { UserRole, Profile } from '../lib/supabase'

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getProfilesByRole(role: UserRole) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

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
    password,
    options: {
      emailRedirectTo: undefined, 
    }
  })

  if (authError || !data.user) {
    return { error: authError }
  }

  // Créer le profil utilisateur AVANT de déconnecter
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

  await supabase.auth.signOut()
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { data: sessionCheck } = await supabase.auth.getSession()
  if (sessionCheck.session) {
    console.log('Forçage déconnexion supplémentaire...')
    await supabase.auth.signOut()
  }

  return { error: null }
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

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

export async function changePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  return { error }
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  return { error }
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  return { session: data.session, error }
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  return { user: data.user, error }
}

export async function deleteAccount() {
  try {
    const { error } = await supabase.rpc('delete_user')

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`)
    }

    await supabase.auth.signOut()

    return { error: null }
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    return { error: error instanceof Error ? error : new Error('Erreur inconnue') }
  }
}

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

export async function updateEmail(newEmail: string) {
  const { error } = await supabase.auth.updateUser({
    email: newEmail
  })

  return { error }
}

export async function deleteUser(userId: string) {
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (profileError) throw profileError

  return { success: true }
}

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