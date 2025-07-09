"use client"

import { createContext, useContext, useEffect, useReducer, useCallback } from "react"
import { useAuth } from "@/lib/providers/auth-provider"
import { taskReducer, initialTaskState, TaskPagination } from "@/lib/store/task-reducer"
import { useTaskOperations } from "@/lib/hooks/use-task-operations"
import { 
  Task, 
  TaskFilters, 
  CreateTaskRequest, 
  UpdateTaskRequest 
} from "@/types/task"

// Task context type
export interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  filters: TaskFilters
  pagination: TaskPagination
  // Task operations
  fetchTasks: (filters?: TaskFilters, page?: number) => Promise<void>
  createTask: (task: CreateTaskRequest) => Promise<boolean>
  updateTask: (id: number, updates: UpdateTaskRequest) => Promise<boolean>
  deleteTask: (id: number) => Promise<boolean>
  toggleTaskCompletion: (id: number) => Promise<boolean>
  // Specialized task fetching
  getTodaysTasks: () => Promise<void>
  getStarredTasks: () => Promise<void>
  getOverdueTasks: () => Promise<void>
  getMyDayTasks: () => Promise<void>
  searchTasks: (query: string) => Promise<void>
  // Filtering
  setFilters: (filters: TaskFilters) => void
  clearFilters: () => void
  clearError: () => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

interface TaskProviderProps {
  children: React.ReactNode
}

export const TaskProvider = ({ children }: TaskProviderProps) => {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState)
  const { isAuthenticated } = useAuth()

  // Task operations using custom hook
  const taskOperations = useTaskOperations({
    isAuthenticated,
    dispatch,
    pagination: state.pagination
  })

  // Filter operations
  const setFilters = useCallback((filters: TaskFilters) => {
    dispatch({ type: "SET_FILTERS", payload: filters })
  }, [])

  const clearFilters = useCallback(() => {
    dispatch({ type: "CLEAR_FILTERS" })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // Only auto-fetch on initial authentication, not on filter changes
  // Route-specific components will handle their own fetching
  useEffect(() => {
    if (isAuthenticated && state.tasks.length === 0 && !state.loading) {
      // Only fetch if we have no tasks and we're not already loading
      taskOperations.fetchTasks({}, 1)
    }
  }, [isAuthenticated]) // Remove state.filters from dependency array

  const contextValue: TaskContextType = {
    ...state,
    ...taskOperations,
    setFilters,
    clearFilters,
    clearError
  }

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

// Custom hook for using task context
export function useTask(): TaskContextType {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}