"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, ApiError } from '@/types/task'
import { taskService } from '@/services/task'
import { useAuth } from '@/contexts/auth-context'
import { useLoading } from '@/contexts/loading-context'

interface TaskContextType {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null
  filters: TaskFilters
  
  // Actions
  getTasks: (filters?: TaskFilters) => Promise<void>
  getTask: (taskId: number) => Promise<Task | null>
  createTask: (task: CreateTaskRequest) => Promise<Task | null>
  updateTask: (taskId: number, updates: UpdateTaskRequest) => Promise<Task | null>
  deleteTask: (taskId: number) => Promise<boolean>
  toggleTaskCompletion: (taskId: number) => Promise<Task | null>
  setFilters: (filters: TaskFilters) => void
  clearError: () => void
  
  // Convenience methods
  getTodaysTasks: () => Promise<void>
  getStarredTasks: () => Promise<void>
  getCompletedTasks: () => Promise<void>
  getTasksByGroup: (groupId: number) => Promise<void>
  searchTasks: (query: string) => Promise<void>
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function useTask() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider')
  }
  return context
}

interface TaskProviderProps {
  children: ReactNode
}

export function TaskProvider({ children }: TaskProviderProps) {
  const { user } = useAuth()
  const globalLoading = useLoading()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [isInitialized, setIsInitialized] = useState(false)

  const handleError = (error: unknown) => {
    console.error('Task operation error:', error)
    if (error && typeof error === 'object' && 'message' in error) {
      setError((error as ApiError).message)
    } else {
      setError('An unexpected error occurred')
    }
  }

  // Helper to check if an operation can proceed (prevents race conditions)
  const canStartOperation = (operationName: string): boolean => {
    const taskKey = `task-${operationName}`
    if (loading || globalLoading.isLoading(taskKey)) {
      console.warn(`Cannot start ${operationName}: already loading`)
      return false
    }
    // Also check if any other critical operations are running
    if (globalLoading.isAnyLoading()) {
      const activeOps = globalLoading.getActiveOperations()
      console.warn(`Deferring ${operationName}: other operations active:`, activeOps)
      return false
    }
    return true
  }

  // Helper to start an operation
  const startOperation = (operationName: string) => {
    const taskKey = `task-${operationName}`
    globalLoading.startLoading(taskKey)
    setLoading(true)
    setError(null)
  }

  // Helper to end an operation
  const endOperation = (operationName: string) => {
    const taskKey = `task-${operationName}`
    globalLoading.stopLoading(taskKey)
    setLoading(false)
  }

  const getTasks = useCallback(async (newFilters?: TaskFilters) => {
    if (!user) return
    
    if (!canStartOperation('getTasks')) return
    
    startOperation('getTasks')
    
    try {
      const filtersToUse = newFilters || filters
      const fetchedTasks = await taskService.getTasks(user.id, filtersToUse)
      setTasks(fetchedTasks)
      if (newFilters) {
        setFilters(newFilters)
      }
      setIsInitialized(true)
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('getTasks')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filters]) // Helper functions are stable and don't need to be in deps

  const getTask = async (taskId: number): Promise<Task | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      const task = await taskService.getTask(taskId)
      return task
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: CreateTaskRequest): Promise<Task | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    try {
      // Ensure user_id is set
      const taskWithUser = { ...taskData, user_id: user.id }
      const newTask = await taskService.createTask(taskWithUser)
      
      // Add the new task to the current list (optimistic update)
      setTasks(prev => [newTask, ...prev])
      
      return newTask
    } catch (error) {
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async (taskId: number, updates: UpdateTaskRequest): Promise<Task | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    // Store current state for rollback
    const originalTasks = tasks
    
    try {
      const updatedTask = await taskService.updateTask(taskId, updates)
      
      // Update the task in the current list
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      
      return updatedTask
    } catch (error) {
      // Rollback to original state on error
      setTasks(originalTasks)
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: number): Promise<boolean> => {
    if (!user) return false
    
    setLoading(true)
    setError(null)
    
    // Store current state for rollback
    const originalTasks = tasks
    
    try {
      await taskService.deleteTask(taskId)
      
      // Remove the task from the current list
      setTasks(prev => prev.filter(task => task.id !== taskId))
      
      return true
    } catch (error) {
      // Rollback to original state on error
      setTasks(originalTasks)
      handleError(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskCompletion = async (taskId: number): Promise<Task | null> => {
    if (!user) return null
    
    setLoading(true)
    setError(null)
    
    // Store current state for rollback
    const originalTasks = tasks
    
    try {
      const updatedTask = await taskService.toggleTaskCompletion(taskId)
      
      // Update the task in the current list
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ))
      
      return updatedTask
    } catch (error) {
      // Rollback to original state on error
      setTasks(originalTasks)
      handleError(error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTodaysTasks = useCallback(async () => {
    if (!user) return
    
    if (!canStartOperation('getTodaysTasks')) return
    
    startOperation('getTodaysTasks')
    
    try {
      const todaysTasks = await taskService.getTodaysTasks(user.id)
      setTasks(todaysTasks)
      setFilters({ due_date_from: new Date().toISOString().split('T')[0] })
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('getTodaysTasks')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Helper functions are stable and don't need to be in deps

  const getStarredTasks = useCallback(async () => {
    if (!user) return
    
    if (!canStartOperation('getStarredTasks')) return
    
    startOperation('getStarredTasks')
    
    try {
      const starredTasks = await taskService.getStarredTasks(user.id)
      setTasks(starredTasks)
      setFilters({ priority: ['high', 'urgent'] })
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('getStarredTasks')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Helper functions are stable and don't need to be in deps

  const getCompletedTasks = useCallback(async () => {
    if (!user) return
    
    if (!canStartOperation('getCompletedTasks')) return
    
    startOperation('getCompletedTasks')
    
    try {
      const completedTasks = await taskService.getCompletedTasks(user.id)
      setTasks(completedTasks)
      setFilters({ completed: true })
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('getCompletedTasks')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Helper functions are stable and don't need to be in deps

  const getTasksByGroup = useCallback(async (groupId: number) => {
    if (!user) return
    
    if (!canStartOperation('getTasksByGroup')) return
    
    startOperation('getTasksByGroup')
    
    try {
      const groupTasks = await taskService.getTasksByGroup(user.id, groupId)
      setTasks(groupTasks)
      setFilters({ group_id: groupId })
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('getTasksByGroup')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Helper functions are stable and don't need to be in deps

  const searchTasks = useCallback(async (query: string) => {
    if (!user) return
    
    if (!canStartOperation('searchTasks')) return
    
    startOperation('searchTasks')
    
    try {
      const searchResults = await taskService.searchTasks(user.id, query)
      setTasks(searchResults)
      setFilters({ search: query })
    } catch (error) {
      handleError(error)
    } finally {
      endOperation('searchTasks')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Helper functions are stable and don't need to be in deps

  const clearError = () => {
    setError(null)
  }

  const updateFilters = (newFilters: TaskFilters) => {
    setFilters(newFilters)
  }

  // Load initial tasks when user is available (only once)
  useEffect(() => {
    if (user && !isInitialized) {
      getTasks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isInitialized]) // Remove getTasks from deps to prevent unnecessary re-renders

  const value: TaskContextType = {
    // State
    tasks,
    loading,
    error,
    filters,
    
    // Actions
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    setFilters: updateFilters,
    clearError,
    
    // Convenience methods
    getTodaysTasks,
    getStarredTasks,
    getCompletedTasks,
    getTasksByGroup,
    searchTasks,
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}