import { createClient } from '@/lib/supabase/server'
import type { Accommodation } from '@/types/database'

export async function getAccommodations(): Promise<Accommodation[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await (supabase as any)
    .from('accommodations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getActiveAccommodation(): Promise<Accommodation | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await (supabase as any)
    .from('accommodations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  return data ?? null
}

export async function createAccommodation(input: {
  name: string
  address: string
  lat: number
  lng: number
}): Promise<{ accommodation: Accommodation | null; error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { accommodation: null, error: 'Unauthorized' }
  const { data, error } = await (supabase as any)
    .from('accommodations')
    .insert({
      user_id: user.id,
      name: input.name,
      address: input.address,
      location: `POINT(${input.lng} ${input.lat})`,
      is_active: false,
    })
    .select()
    .single()
  if (error) return { accommodation: null, error: error.message }
  return { accommodation: data, error: null }
}

export async function setActiveAccommodation(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { error: deactivateError } = await (supabase as any)
    .from('accommodations')
    .update({ is_active: false })
    .eq('user_id', user.id)
  if (deactivateError) return { error: deactivateError.message }
  const { error: activateError } = await (supabase as any)
    .from('accommodations')
    .update({ is_active: true })
    .eq('id', id)
    .eq('user_id', user.id)
  if (activateError) return { error: activateError.message }
  return { error: null }
}

export async function deleteAccommodation(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { error } = await (supabase as any)
    .from('accommodations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return { error: error.message }
  return { error: null }
}
