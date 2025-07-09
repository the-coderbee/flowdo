import { apiClient } from "@/lib/api/client"
import { TaskService } from "./task-service"
import { Task } from "@/types/task"
import { DashboardStats } from "@/lib/store/dashboard-reducer"

export class DashboardService {
  static async fetchPriorityTasks(): Promise<Task[]> {
    return await TaskService.fetchPriorityTasks()
  }

  static async fetchTodaysTasks(): Promise<Task[]> {
    return await TaskService.fetchTodaysTasks()
  }

  static async fetchStats(): Promise<DashboardStats> {
    try {
      const dashboardData = await apiClient.get<any>('/api/dashboard/data')
      
      // Map backend response to frontend expected format
      return {
        totalTasks: dashboardData.stats?.tasks_week?.total || 0,
        completedTasks: dashboardData.stats?.tasks_week?.completed || 0,
        pendingTasks: dashboardData.stats?.tasks_week?.pending || 0,
        overdueTasks: 0, // Calculate from upcoming deadlines if needed
        completedToday: dashboardData.stats?.tasks_today?.completed || 0,
        completedPomodoros: dashboardData.stats?.focus_today?.sessions_completed || 0,
        totalPomodoros: dashboardData.stats?.focus_today?.sessions_completed || 0
      }
    } catch (error) {
      // Return default stats if endpoint doesn't exist
      console.warn('Dashboard stats endpoint not available, returning default stats')
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completedToday: 0,
        completedPomodoros: 0,
        totalPomodoros: 0
      }
    }
  }

  static async refreshAllData(): Promise<{
    priorityTasks: Task[]
    todaysTasks: Task[]
    stats: DashboardStats
  }> {
    const [priorityTasks, todaysTasks, stats] = await Promise.all([
      this.fetchPriorityTasks(),
      this.fetchTodaysTasks(),
      this.fetchStats()
    ])

    return { priorityTasks, todaysTasks, stats }
  }
}