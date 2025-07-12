import { useState, useEffect, useCallback } from "react"
import { tagService, TagType, CreateTagRequest } from "@/services/tag"
import { useAuth } from "@/lib/providers/auth-provider"

export interface UseTagsManagementReturn {
  // State
  tags: TagType[]
  loading: boolean
  error: string | null
  
  // Actions
  createTag: (name: string, color: string) => Promise<void>
  updateTag: (tagId: number, name: string, color: string) => Promise<void>
  deleteTag: (tagId: number) => Promise<void>
  refreshTags: () => Promise<void>
  clearError: () => void
  
  // Utilities
  getTagById: (tagId: number) => TagType | undefined
  getTagsByName: (name: string) => TagType[]
}

export function useTagsManagement(): UseTagsManagementReturn {
  const { user } = useAuth()
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load tags from API
  const loadTags = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const fetchedTags = await tagService.getTagsForUser()
      setTags(fetchedTags)
    } catch (error) {
      console.error('Error loading tags:', error)
      setError('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Load tags on mount and when user changes
  useEffect(() => {
    loadTags()
  }, [loadTags])

  // Create a new tag
  const createTag = useCallback(async (name: string, color: string) => {
    if (!user) throw new Error('User not authenticated')

    setError(null)

    const createData: CreateTagRequest = {
      name: name.trim(),
      color,
      user_id: user.id
    }

    try {
      const newTag = await tagService.createTag(createData)
      setTags(prev => [...prev, newTag])
    } catch (error) {
      console.error('Error creating tag:', error)
      setError('Failed to create tag')
      throw error
    }
  }, [user])

  // Update an existing tag
  const updateTag = useCallback(async (tagId: number, name: string, color: string) => {
    setError(null)

    const updateData = {
      name: name.trim(),
      color
    }

    try {
      const updatedTag = await tagService.updateTag(tagId, updateData)
      setTags(prev => prev.map(tag => 
        tag.id === tagId ? updatedTag : tag
      ))
    } catch (error) {
      console.error('Error updating tag:', error)
      setError('Failed to update tag')
      throw error
    }
  }, [])

  // Delete a tag
  const deleteTag = useCallback(async (tagId: number) => {
    setError(null)

    try {
      await tagService.deleteTag(tagId)
      setTags(prev => prev.filter(tag => tag.id !== tagId))
    } catch (error) {
      console.error('Error deleting tag:', error)
      setError('Failed to delete tag')
      throw error
    }
  }, [])

  // Refresh tags
  const refreshTags = useCallback(async () => {
    await loadTags()
  }, [loadTags])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Get tag by ID
  const getTagById = useCallback((tagId: number) => {
    return tags.find(tag => tag.id === tagId)
  }, [tags])

  // Get tags by name (for searching)
  const getTagsByName = useCallback((name: string) => {
    const searchTerm = name.toLowerCase().trim()
    if (!searchTerm) return tags
    
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm)
    )
  }, [tags])

  return {
    // State
    tags,
    loading,
    error,
    
    // Actions
    createTag,
    updateTag,
    deleteTag,
    refreshTags,
    clearError,
    
    // Utilities
    getTagById,
    getTagsByName
  }
}

export default useTagsManagement