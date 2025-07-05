"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskFilters, ApiError } from '@/types/task'
import { taskService } from '@/services/task'
import { useAuth } from '@/contexts/auth-context'

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

  const getTasks = useCallback(async (newFilters?: TaskFilters) => {
    if (!user) return
    
    setLoading(prev => {
      if (prev) return prev // Don't start if already loading
      return true
    })
    setError(null)
    
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
      setLoading(false)
    }
  }, [user, filters])

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
    
    setLoading(prev => {
      if (prev) return prev // Don't start if already loading
      return true
    })
    setError(null)
    
    try {
      const todaysTasks = await taskService.getTodaysTasks(user.id)
      setTasks(todaysTasks)
      setFilters({ due_date_from: new Date().toISOString().split('T')[0] })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getStarredTasks = useCallback(async () => {
    if (!user) return
    
    setLoading(prev => {
      if (prev) return prev // Don't start if already loading
      return true
    })
    setError(null)
    
    try {
      const starredTasks = await taskService.getStarredTasks(user.id)
      setTasks(starredTasks)
      setFilters({ priority: ['high', 'urgent'] })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getCompletedTasks = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const completedTasks = await taskService.getCompletedTasks(user.id)
      setTasks(completedTasks)
      setFilters({ completed: true })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const getTasksByGroup = useCallback(async (groupId: number) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const groupTasks = await taskService.getTasksByGroup(user.id, groupId)
      setTasks(groupTasks)
      setFilters({ group_id: groupId })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const searchTasks = useCallback(async (query: string) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      const searchResults = await taskService.searchTasks(user.id, query)
      setTasks(searchResults)
      setFilters({ search: query })
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }, [user])

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
  }, [user, isInitialized, getTasks])

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