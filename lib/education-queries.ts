import { supabase } from './config/supabase'
import type { EducationalContent } from './types'

// Obtener todo el contenido educativo activo
export async function getEducationalContent() {
  const { data, error } = await supabase
    .from('educational_content')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as EducationalContent[]
}

// Obtener contenido destacado
export async function getFeaturedContent() {
  const { data, error } = await supabase
    .from('educational_content')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as EducationalContent[]
}

// Crear nuevo contenido (solo admin)
export async function createEducationalContent(content: Omit<EducationalContent, 'id' | 'created_by' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')

  const { data, error } = await supabase
    .from('educational_content')
    .insert({
      ...content,
      created_by: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data as EducationalContent
}

// Actualizar contenido (solo admin)
export async function updateEducationalContent(id: string, updates: Partial<EducationalContent>) {
  const { data, error } = await supabase
    .from('educational_content')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EducationalContent
}

// Eliminar contenido (solo admin)
export async function deleteEducationalContent(id: string) {
  const { error } = await supabase
    .from('educational_content')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Verificar si el usuario es admin
export async function checkIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (error) return false
  return data?.is_admin || false
}