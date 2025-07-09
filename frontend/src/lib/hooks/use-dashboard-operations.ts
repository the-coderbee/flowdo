import { useCallback } from "react"
import { DashboardService } from "@/lib/api/dashboard-service"
import { handleApiError } from "@/lib/api/client"
import { DashboardAction } from "@/lib/store/dashboard-reducer"

interface UseDashboardOperationsProps {
  isAuthenticated: boolean
  dispatch: React.Dispatch<DashboardAction>
}

export function useDashboardOperations({ isAuthenticated, dispatch }: UseDashboardOperationsProps) {
  const fetchPriorityTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_PRIORITY_TASKS_LOADING", payload: true })
      const tasks = await DashboardService.fetchPriorityTasks()
      dispatch({ type: "SET_PRIORITY_TASKS", payload: tasks })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_PRIORITY_TASKS_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const fetchTodaysTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_TODAYS_TASKS_LOADING", payload: true })
      const tasks = await DashboardService.fetchTodaysTasks()
      dispatch({ type: "SET_TODAYS_TASKS", payload: tasks })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_TODAYS_TASKS_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const fetchStats = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_STATS_LOADING", payload: true })
      const stats = await DashboardService.fetchStats()
      dispatch({ type: "SET_STATS", payload: stats })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_STATS_ERROR", payload: errorMessage })
    }
  }, [isAuthenticated, dispatch])

  const refreshDashboard = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchPriorityTasks(),
      fetchTodaysTasks(),
      fetchStats()
    ])
  }, [fetchPriorityTasks, fetchTodaysTasks, fetchStats])

  const clearErrors = useCallback(() => {
    dispatch({ type: "CLEAR_ERRORS" })
  }, [dispatch])

  return {
    fetchPriorityTasks,
    fetchTodaysTasks,
    fetchStats,
    refreshDashboard,
    clearErrors
  }
}