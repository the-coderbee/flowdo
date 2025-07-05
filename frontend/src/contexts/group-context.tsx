"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Group, CreateGroupRequest, UpdateGroupRequest, groupService } from '@/services/group'
import { useAuth } from '@/contexts/auth-context'

interface GroupContextType {
  // State
  groups: Group[]
  loading: boolean
  error: string | null
  
  // Actions
  getGroups: () => Promise<void>
  createGroup: (group: CreateGroupRequest) => Promise<Group | null>
  updateGroup: (groupId: number, updates: Partial<UpdateGroupRequest>) => Promise<Group | null>
  deleteGroup: (groupId: number) => Promise<boolean>
  clearError: () => void
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

export function useGroup() {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider')
  }
  return context
}

interface GroupProviderProps {
  children: ReactNode
}

export function GroupProvider({ children }: GroupProviderProps) {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const handleError = (error: unknown) => {
    console.error('Group operation error:', error)
    if (error && typeof error === 'object' && 'message' in error) {
      setError((error as { message: string }).message)
    } else {
      setError('An unexpected error occurred')
    }
  }

  const getGroups = useCallback(async () => {
    if (!user) return
    
    setLoading(prev => {
      if (prev) return prev // Don't start if already loading
      return true
    })
    setError(null)
    
    try {
      const fetchedGroups = await groupService.getGroupsForUser(user.id)
      setGroups(fetchedGroups)
      setIsInitialized(true)
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const createGroup = async (groupData: CreateGroupRequest): Promise<Group | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      // Ensure user_id is set
      const groupWithUser = { ...groupData, user_id: user.id }
      const newGroup = await groupService.createGroup(groupWithUser)
      
      // Add the new group to the current list (optimistic update)
      setGroups(prev => [newGroup, ...prev])
      
      return newGroup
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateGroup = async (groupId: number, updates: Partial<UpdateGroupRequest>): Promise<Group | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    // Store current state for rollback
    const originalGroups = groups
    
    try {
      const updatedGroup = await groupService.updateGroup(groupId, updates)
      
      // Update the group in the current list
      setGroups(prev => prev.map(group => 
        group.id === groupId ? updatedGroup : group
      ))
      
      return updatedGroup
    } catch (error) {
      // Rollback to original state on error
      setGroups(originalGroups)
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteGroup = async (groupId: number): Promise<boolean> => {
    if (!user) return false
    
    setLoading(true)
    setError(null)
    
    // Store current state for rollback
    const originalGroups = groups
    
    try {
      await groupService.deleteGroup(groupId)
      
      // Remove the group from the current list
      setGroups(prev => prev.filter(group => group.id !== groupId))
      
      return true
    } catch (error) {
      // Rollback to original state on error
      setGroups(originalGroups)
      handleError(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Load initial groups when user is available (only once)
  useEffect(() => {
    if (user && !isInitialized) {
      getGroups()
    }
  }, [user, isInitialized, getGroups])

  const value: GroupContextType = {
    // State
    groups,
    loading,
    error,
    
    // Actions
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    clearError,
  }

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  )
}