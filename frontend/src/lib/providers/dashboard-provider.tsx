"use client"

import { createContext, useContext, useEffect, useReducer } from "react"
import { useAuth } from "@/lib/providers/auth-provider"
import { dashboardReducer, initialDashboardState, DashboardStats } from "@/lib/store/dashboard-reducer"
import { useDashboardOperations } from "@/lib/hooks/use-dashboard-operations"
import { useDashboardSelectors } from "@/lib/hooks/use-dashboard-selectors"
import { Task } from "@/types/task"

// Dashboard context type
export interface DashboardContextType {
  // Priority tasks
  priorityTasks: Task[]
  priorityTasksLoading: boolean
  priorityTasksError: string | null
  
  // Today's tasks  
  todaysTasks: Task[]
  todaysTasksLoading: boolean
  todaysTasksError: string | null
  
  // Dashboard stats
  stats: DashboardStats
  statsLoading: boolean
  statsError: string | null
  
  // Operations
  fetchPriorityTasks: () => Promise<void>
  fetchTodaysTasks: () => Promise<void>
  fetchStats: () => Promise<void>
  refreshDashboard: () => Promise<void>
  clearErrors: () => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

interface DashboardProviderProps {
  children: React.ReactNode
}

export const DashboardProvider = ({ children }: DashboardProviderProps) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState)
  const { isAuthenticated } = useAuth()

  // Dashboard operations using custom hook
  const dashboardOperations = useDashboardOperations({
    isAuthenticated,
    dispatch
  })

  // Auto-fetch dashboard data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dashboardOperations.refreshDashboard()
    }
  }, [isAuthenticated])

  const contextValue: DashboardContextType = {
    ...state,
    ...dashboardOperations
  }

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  )
}

// Custom hooks for using dashboard context
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}

// Convenience hooks for specific dashboard features using selectors
export function usePriorityTasks() {
  const dashboard = useDashboard()
  const selectors = useDashboardSelectors({
    state: dashboard,
    fetchPriorityTasks: dashboard.fetchPriorityTasks,
    fetchTodaysTasks: dashboard.fetchTodaysTasks,
    fetchStats: dashboard.fetchStats
  })
  return selectors.priorityTasksData
}

export function useTodaysTasks() {
  const dashboard = useDashboard()
  const selectors = useDashboardSelectors({
    state: dashboard,
    fetchPriorityTasks: dashboard.fetchPriorityTasks,
    fetchTodaysTasks: dashboard.fetchTodaysTasks,
    fetchStats: dashboard.fetchStats
  })
  return selectors.todaysTasksData
}

export function useDashboardStats() {
  const dashboard = useDashboard()
  const selectors = useDashboardSelectors({
    state: dashboard,
    fetchPriorityTasks: dashboard.fetchPriorityTasks,
    fetchTodaysTasks: dashboard.fetchTodaysTasks,
    fetchStats: dashboard.fetchStats
  })
  return selectors.statsData
}

export function useRecentActivity() {
  const dashboard = useDashboard()
  const selectors = useDashboardSelectors({
    state: dashboard,
    fetchPriorityTasks: dashboard.fetchPriorityTasks,
    fetchTodaysTasks: dashboard.fetchTodaysTasks,
    fetchStats: dashboard.fetchStats
  })
  return selectors.recentActivityData
}