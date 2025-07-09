import { useMemo } from "react"
import { DashboardState } from "@/lib/store/dashboard-reducer"

interface UseDashboardSelectorsProps {
  state: DashboardState
  fetchPriorityTasks: () => Promise<void>
  fetchTodaysTasks: () => Promise<void>
  fetchStats: () => Promise<void>
}

export function useDashboardSelectors({ 
  state, 
  fetchPriorityTasks, 
  fetchTodaysTasks, 
  fetchStats 
}: UseDashboardSelectorsProps) {
  
  // Priority tasks selector
  const priorityTasksData = useMemo(() => ({
    priorityTasks: state.priorityTasks,
    loading: state.priorityTasksLoading,
    error: state.priorityTasksError,
    fetchPriorityTasks
  }), [state.priorityTasks, state.priorityTasksLoading, state.priorityTasksError, fetchPriorityTasks])

  // Today's tasks selector
  const todaysTasksData = useMemo(() => ({
    todaysTasks: state.todaysTasks,
    loading: state.todaysTasksLoading,
    error: state.todaysTasksError,
    fetchTodaysTasks
  }), [state.todaysTasks, state.todaysTasksLoading, state.todaysTasksError, fetchTodaysTasks])

  // Dashboard stats selector
  const statsData = useMemo(() => ({
    stats: state.stats,
    loading: state.statsLoading,
    error: state.statsError,
    fetchStats
  }), [state.stats, state.statsLoading, state.statsError, fetchStats])

  // Recent activity selector (derived from today's tasks)
  const recentActivityData = useMemo(() => {
    const recentActivity = {
      recentCompleted: state.todaysTasks.filter(task => task.status === 'completed') || [],
      recentCreated: state.todaysTasks.filter(task => {
        // Tasks created today (within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return new Date(task.created_at) > oneDayAgo
      }) || [],
      recentUpdated: state.todaysTasks.filter(task => {
        // Tasks updated today but not completed
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return task.status !== 'completed' && new Date(task.updated_at) > oneDayAgo
      }) || []
    }
    
    return {
      recentActivity,
      loading: state.todaysTasksLoading,
      error: state.todaysTasksError,
      fetchRecentActivity: fetchTodaysTasks
    }
  }, [state.todaysTasks, state.todaysTasksLoading, state.todaysTasksError, fetchTodaysTasks])

  return {
    priorityTasksData,
    todaysTasksData,
    statsData,
    recentActivityData
  }
}