import { supabase } from '../lib/supabase'

export async function getSpeakers() {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getSpeaker(id: string) {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createSpeaker(speakerData: {
  name: string
  photo?: string
  bio?: string
}) {
  const { error, data: result } = await supabase
    .from('speakers')
    .insert([speakerData])
    .select()
    .single()

  if (error) throw error
  return result
}

export async function updateSpeaker(id: string, speakerData: {
  name?: string
  photo?: string
  bio?: string
}) {
  const { error, data: result } = await supabase
    .from('speakers')
    .update(speakerData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return result
}

export async function deleteSpeaker(speakerId: string) {
  const { data: conferences, error: checkError } = await supabase
    .from('conferences')
    .select('id')
    .eq('speaker_id', speakerId)

  if (checkError) throw checkError

  if (conferences && conferences.length > 0) {
    throw new Error('Impossible de supprimer ce conférencier car il est associé à des conférences existantes.')
  }

  const { error } = await supabase
    .from('speakers')
    .delete()
    .eq('id', speakerId)

  if (error) throw error
  return { id: speakerId }
}

export async function searchSpeakers(searchTerm: string) {
  const { data, error } = await supabase
    .from('speakers')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
} 