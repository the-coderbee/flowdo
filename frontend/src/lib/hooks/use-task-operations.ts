import { useCallback } from "react"
import { TaskService } from "@/lib/api/task-service"
import { handleApiError } from "@/lib/api/client"
import { 
  TaskFilters, 
  CreateTaskRequest, 
  UpdateTaskRequest 
} from "@/types/task"
import { TaskAction, TaskPagination } from "@/lib/store/task-reducer"

interface UseTaskOperationsProps {
  isAuthenticated: boolean
  dispatch: React.Dispatch<TaskAction>
  pagination: TaskPagination
}

export function useTaskOperations({ 
  isAuthenticated, 
  dispatch, 
  pagination 
}: UseTaskOperationsProps) {
  const fetchTasks = useCallback(async (filters: TaskFilters = {}, page: number = 1): Promise<void> => {
    if (!isAuthenticated) {
      return
    }

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const result = await TaskService.fetchTasks(filters, page, pagination.per_page)
      
      dispatch({
        type: "SET_TASKS",
        payload: result
      })
    } catch (error) {
      console.error('Error fetching tasks:', {
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, pagination.per_page, dispatch])

  const createTask = useCallback(async (task: CreateTaskRequest): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const newTask = await TaskService.createTask(task)
      dispatch({ type: "ADD_TASK", payload: newTask })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated, dispatch])

  const updateTask = useCallback(async (id: number, updates: UpdateTaskRequest): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const updatedTask = await TaskService.updateTask(id, updates)
      dispatch({ type: "UPDATE_TASK", payload: { id, updates: updatedTask } })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated, dispatch])

  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      await TaskService.deleteTask(id)
      dispatch({ type: "REMOVE_TASK", payload: id })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated, dispatch])

  const toggleTaskCompletion = useCallback(async (id: number): Promise<boolean> => {
    if (!isAuthenticated) return false

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const updatedTask = await TaskService.toggleTaskCompletion(id)
      dispatch({ type: "UPDATE_TASK", payload: { id, updates: updatedTask } })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      return false
    }
  }, [isAuthenticated, dispatch])

  const getTodaysTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const tasks = await TaskService.getTodaysTasks()
      const filters = TaskService.getTodayFilters()
      
      dispatch({ type: "SET_FILTERS", payload: filters })
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks,
          pagination: {
            total: tasks.length,
            page: 1,
            per_page: tasks.length,
            total_pages: 1
          }
        }
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const getStarredTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const tasks = await TaskService.getStarredTasks()
      const filters = TaskService.getStarredFilters()
      
      dispatch({ type: "SET_FILTERS", payload: filters })
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks,
          pagination: {
            total: tasks.length,
            page: 1,
            per_page: tasks.length,
            total_pages: 1
          }
        }
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const getOverdueTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const tasks = await TaskService.getOverdueTasks()
      const filters = TaskService.getOverdueFilters()
      
      dispatch({ type: "SET_FILTERS", payload: filters })
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks,
          pagination: {
            total: tasks.length,
            page: 1,
            per_page: tasks.length,
            total_pages: 1
          }
        }
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const getMyDayTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const tasks = await TaskService.getTodaysTasks()
      const filters = TaskService.getTodayFilters()
      
      dispatch({ type: "SET_FILTERS", payload: filters })
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks,
          pagination: {
            total: tasks.length,
            page: 1,
            per_page: tasks.length,
            total_pages: 1
          }
        }
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const searchTasks = useCallback(async (query: string): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const tasks = await TaskService.searchTasks(query)
      const filters = { search: query }
      
      dispatch({ type: "SET_FILTERS", payload: filters })
      dispatch({
        type: "SET_TASKS",
        payload: {
          tasks,
          pagination: {
            total: tasks.length,
            page: 1,
            per_page: tasks.length,
            total_pages: 1
          }
        }
      })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  return {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTodaysTasks,
    getStarredTasks,
    getOverdueTasks,
    getMyDayTasks,
    searchTasks
  }
}