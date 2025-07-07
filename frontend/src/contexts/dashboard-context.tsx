"use client"

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { dashboardService, DashboardData, DashboardStats, TodaysTasks, PriorityTasks, RecentActivity } from '@/services/dashboard'
import { useAuth } from '@/contexts/auth-context'

interface DashboardContextType {
  // State
  dashboardData: DashboardData | null
  stats: DashboardStats | null
  todaysTasks: TodaysTasks | null
  priorityTasks: PriorityTasks | null
  recentActivity: RecentActivity | null
  loading: boolean
  error: string | null
  lastRefresh: Date | null
  
  // Actions
  refreshDashboard: () => Promise<void>
  refreshStats: () => Promise<void>
  refreshTodaysTasks: () => Promise<void>
  refreshPriorityTasks: () => Promise<void>
  refreshRecentActivity: () => Promise<void>
  clearError: () => void
  
  // Auto-refresh controls
  setAutoRefreshEnabled: (enabled: boolean) => void
  autoRefreshEnabled: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

interface DashboardProviderProps {
  children: ReactNode
  autoRefreshInterval?: number // in milliseconds, default 5 minutes
}

export function DashboardProvider({ 
  children, 
  autoRefreshInterval = 5 * 60 * 1000 // 5 minutes
}: DashboardProviderProps) {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [todaysTasks, setTodaysTasks] = useState<TodaysTasks | null>(null)
  const [priorityTasks, setPriorityTasks] = useState<PriorityTasks | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const handleError = (error: unknown, operation: string) => {
    console.error(`Dashboard ${operation} error:`, error)
    if (error && typeof error === 'object' && 'message' in error) {
      setError(`${operation}: ${(error as { message: string }).message}`)
    } else {
      setError(`${operation}: An unexpected error occurred`)
    }
  }

  const refreshDashboard = useCallback(async () => {
    if (!user || loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await dashboardService.getDashboardData(user.id)
      setDashboardData(data)
      setStats(data.stats)
      setTodaysTasks(data.todaysTasks)
      setPriorityTasks(data.priorityTasks)
      setRecentActivity(data.recentActivity)
      setLastRefresh(new Date())
    } catch (error) {
      handleError(error, 'Dashboard refresh')
    } finally {
      setLoading(false)
    }
  }, [user, loading])

  const refreshStats = useCallback(async () => {
    if (!user) return
    
    try {
      const statsData = await dashboardService.getStats(user.id)
      setStats(statsData)
    } catch (error) {
      handleError(error, 'Stats refresh')
    }
  }, [user])

  const refreshTodaysTasks = useCallback(async () => {
    if (!user) return
    
    try {
      const todaysTasksData = await dashboardService.getTodaysTasks(user.id)
      setTodaysTasks(todaysTasksData)
    } catch (error) {
      handleError(error, 'Today\'s tasks refresh')
    }
  }, [user])

  const refreshPriorityTasks = useCallback(async () => {
    if (!user) return
    
    try {
      const priorityTasksData = await dashboardService.getPriorityTasks(user.id)
      setPriorityTasks(priorityTasksData)
    } catch (error) {
      handleError(error, 'Priority tasks refresh')
    }
  }, [user])

  const refreshRecentActivity = useCallback(async () => {
    if (!user) return
    
    try {
      const activityData = await dashboardService.getRecentActivity(user.id)
      setRecentActivity(activityData)
    } catch (error) {
      handleError(error, 'Recent activity refresh')
    }
  }, [user])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial load when user is available
  useEffect(() => {
    if (user && !dashboardData) {
      refreshDashboard()
    }
  }, [user, dashboardData, refreshDashboard])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshEnabled || !user) return

    const interval = setInterval(() => {
      refreshDashboard()
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [autoRefreshEnabled, user, autoRefreshInterval, refreshDashboard])

  // Listen for task updates to refresh dashboard data
  useEffect(() => {
    const handleTaskUpdate = () => {
      if (user && autoRefreshEnabled) {
        // Debounce rapid updates
        const timeout = setTimeout(() => {
          refreshDashboard()
        }, 1000)
        
        return () => clearTimeout(timeout)
      }
    }

    // Listen for custom task update events
    window.addEventListener('task:updated', handleTaskUpdate)
    window.addEventListener('task:created', handleTaskUpdate)
    window.addEventListener('task:deleted', handleTaskUpdate)

    return () => {
      window.removeEventListener('task:updated', handleTaskUpdate)
      window.removeEventListener('task:created', handleTaskUpdate)
      window.removeEventListener('task:deleted', handleTaskUpdate)
    }
  }, [user, autoRefreshEnabled, refreshDashboard])

  const value: DashboardContextType = {
    // State
    dashboardData,
    stats,
    todaysTasks,
    priorityTasks,
    recentActivity,
    loading,
    error,
    lastRefresh,
    autoRefreshEnabled,
    
    // Actions
    refreshDashboard,
    refreshStats,
    refreshTodaysTasks,
    refreshPriorityTasks,
    refreshRecentActivity,
    clearError,
    setAutoRefreshEnabled,
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

// Hook for dashboard stats specifically
export function useDashboardStats() {
  const { stats, loading, error, refreshStats } = useDashboard()
  return { stats, loading, error, refreshStats }
}

// Hook for today's tasks specifically
export function useTodaysTasks() {
  const { todaysTasks, loading, error, refreshTodaysTasks } = useDashboard()
  return { todaysTasks, loading, error, refreshTodaysTasks }
}

// Hook for priority tasks specifically
export function usePriorityTasks() {
  const { priorityTasks, loading, error, refreshPriorityTasks } = useDashboard()
  return { priorityTasks, loading, error, refreshPriorityTasks }
}

// Hook for recent activity specifically
export function useRecentActivity() {
  const { recentActivity, loading, error, refreshRecentActivity } = useDashboard()
  return { recentActivity, loading, error, refreshRecentActivity }
}