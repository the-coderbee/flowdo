"use client"

import { createContext, useContext, useEffect, useReducer, useCallback } from "react"
import { apiClient, handleApiError } from "@/lib/api/client"
import { useAuth } from "@/lib/providers/auth-provider"
import { TaskGroup } from "@/types/task"

// Group context type
interface GroupContextType {
  groups: (TaskGroup & { task_count?: number })[]
  loading: boolean
  error: string | null
  // Group operations
  fetchGroups: () => Promise<void>
  createGroup: (group: { name: string, description?: string, color?: string }) => Promise<boolean>
  updateGroup: (id: number, updates: { name?: string, description?: string, color?: string }) => Promise<boolean>
  deleteGroup: (id: number) => Promise<boolean>
  clearError: () => void
}

// Reducer for group state
type GroupAction = 
  | { type: "SET_LOADING", payload: boolean }
  | { type: "SET_GROUPS", payload: (TaskGroup & { task_count?: number })[] }
  | { type: "SET_ERROR", payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "ADD_GROUP", payload: TaskGroup & { task_count?: number } }
  | { type: "UPDATE_GROUP", payload: { id: number, updates: Partial<TaskGroup> } }
  | { type: "REMOVE_GROUP", payload: number }

interface GroupState {
  groups: (TaskGroup & { task_count?: number })[]
  loading: boolean
  error: string | null
}

function groupReducer(state: GroupState, action: GroupAction): GroupState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_GROUPS":
      return { 
        ...state, 
        groups: action.payload,
        loading: false,
        error: null
      }
    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "ADD_GROUP":
      return { 
        ...state, 
        groups: [...state.groups, action.payload]
      }
    case "UPDATE_GROUP":
      return {
        ...state,
        groups: state.groups.map(group => 
          group.id === action.payload.id 
            ? { ...group, ...action.payload.updates }
            : group
        )
      }
    case "REMOVE_GROUP":
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      }
    default:
      return state
  }
}

const initialState: GroupState = {
  groups: [],
  loading: false,
  error: null
}

const GroupContext = createContext<GroupContextType | undefined>(undefined)

interface GroupProviderProps {
  children: React.ReactNode
}

export const GroupProvider = ({ children }: GroupProviderProps) => {
  const [state, dispatch] = useReducer(groupReducer, initialState)
  const { isAuthenticated, user } = useAuth()

  const fetchGroups = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const groups = await apiClient.get<(TaskGroup & { task_count?: number })[]>('/api/groups')
      dispatch({ type: "SET_GROUPS", payload: groups })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated])

  const createGroup = useCallback(async (group: { name: string, description?: string, color?: string }): Promise<boolean> => {
    if (!isAuthenticated || !user) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const payload = {
        ...group,
        user_id: user.id
      }

      const newGroup = await apiClient.post<TaskGroup & { task_count?: number }>('/api/groups/create', payload)
      dispatch({ type: "ADD_GROUP", payload: newGroup })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated, user])

  const updateGroup = useCallback(async (id: number, updates: { name?: string, description?: string, color?: string }): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const updatedGroup = await apiClient.put<TaskGroup>(`/api/groups/${id}`, updates)
      dispatch({ type: "UPDATE_GROUP", payload: { id, updates: updatedGroup } })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated])

  const deleteGroup = useCallback(async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      await apiClient.delete(`/api/groups/${id}`)
      dispatch({ type: "REMOVE_GROUP", payload: id })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // Auto-fetch groups when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGroups()
    }
  }, [isAuthenticated, fetchGroups])

  const contextValue: GroupContextType = {
    ...state,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    clearError
  }

  return (
    <GroupContext.Provider value={contextValue}>
      {children}
    </GroupContext.Provider>
  )
}

// Custom hook for using group context
export function useGroup(): GroupContextType {
  const context = useContext(GroupContext)
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider")
  }
  return context
}