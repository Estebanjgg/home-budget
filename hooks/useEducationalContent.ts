import { useState, useEffect } from 'react'
import {
  getEducationalContent,
  getFeaturedContent,
  createEducationalContent,
  updateEducationalContent,
  deleteEducationalContent,
  checkIsAdmin
} from '@/lib/education-queries'
import type { EducationalContent } from '@/lib/types'

export function useEducationalContent() {
  const [content, setContent] = useState<EducationalContent[]>([])
  const [featuredContent, setFeaturedContent] = useState<EducationalContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const loadContent = async () => {
    try {
      setLoading(true)
      const [allContent, featured, adminStatus] = await Promise.all([
        getEducationalContent(),
        getFeaturedContent(),
        checkIsAdmin()
      ])
      
      setContent(allContent)
      setFeaturedContent(featured)
      setIsAdmin(adminStatus)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar contenido')
    } finally {
      setLoading(false)
    }
  }

  const addContent = async (contentData: Omit<EducationalContent, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    try {
      const newContent = await createEducationalContent(contentData)
      setContent(prev => [newContent, ...prev])
      if (newContent.is_featured) {
        setFeaturedContent(prev => [newContent, ...prev])
      }
      return newContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear contenido')
      throw err
    }
  }

  const editContent = async (id: string, updates: Partial<EducationalContent>) => {
    try {
      const updatedContent = await updateEducationalContent(id, updates)
      setContent(prev => prev.map(c => c.id === id ? updatedContent : c))
      setFeaturedContent(prev => prev.map(c => c.id === id ? updatedContent : c))
      return updatedContent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar contenido')
      throw err
    }
  }

  const removeContent = async (id: string) => {
    try {
      await deleteEducationalContent(id)
      setContent(prev => prev.filter(c => c.id !== id))
      setFeaturedContent(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar contenido')
      throw err
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  return {
    content,
    featuredContent,
    loading,
    error,
    isAdmin,
    addContent,
    editContent,
    removeContent,
    refetch: loadContent
  }
}