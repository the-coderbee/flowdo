import { apiClient } from '@/lib/api'
import { Task } from '@/types/task'

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completedToday: number
  totalPomodoros: number
  completedPomodoros: number
  weeklyProgress: {
    date: string
    completed: number
    total: number
  }[]
}

export interface TodaysTasks {
  tasks: Task[]
  totalCount: number
}

export interface PomodoroStats {
  currentSession: {
    isActive: boolean
    timeRemaining: number
    sessionType: 'work' | 'break'
  }
  dailyStats: {
    completed: number
    target: number
    focusTime: number
  }
  weeklyStats: {
    date: string
    completed: number
    focusTime: number
  }[]
}

export interface RecentActivity {
  recentCompleted: Task[]
  recentCreated: Task[]
  recentUpdated: Task[]
}

export interface PriorityTasks {
  urgent: Task[]
  high: Task[]
  totalCount: number
}

export interface GroupsOverview {
  groups: {
    id: number
    name: string
    taskCount: number
    completedCount: number
    color?: string
  }[]
  totalGroups: number
}

export interface DashboardData {
  stats: DashboardStats
  todaysTasks: TodaysTasks
  pomodoroStats: PomodoroStats
  recentActivity: RecentActivity
  priorityTasks: PriorityTasks
  groupsOverview: GroupsOverview
}

export class DashboardService {
  private static instance: DashboardService | null = null
  private readonly baseEndpoint = '/api/dashboard'

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService()
    }
    return DashboardService.instance
  }

  async getDashboardData(userId: number): Promise<DashboardData> {
    try {
      const endpoint = `${this.baseEndpoint}/${userId}`
      return await apiClient.get<DashboardData>(endpoint)
    } catch {
      // If dashboard endpoint doesn't exist, aggregate data from existing endpoints
      console.warn('Dashboard endpoint not available, aggregating data from individual endpoints')
      return this.aggregateDashboardData(userId)
    }
  }

  async getStats(userId: number): Promise<DashboardStats> {
    try {
      const endpoint = `${this.baseEndpoint}/${userId}/stats`
      return await apiClient.get<DashboardStats>(endpoint)
    } catch {
      console.warn('Stats endpoint not available, calculating from tasks')
      return this.calculateStatsFromTasks(userId)
    }
  }

  async getTodaysTasks(userId: number): Promise<TodaysTasks> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const tasks = await apiClient.get<Task[]>(`/api/tasks/${userId}?${new URLSearchParams({
        due_date_from: today,
        due_date_to: today,
        completed: 'false'
      }).toString()}`)
      
      return {
        tasks: tasks.slice(0, 5), // Limit to 5 tasks for widget
        totalCount: tasks.length
      }
    } catch {
      console.error('Error fetching today\'s tasks')
      return { tasks: [], totalCount: 0 }
    }
  }

  async getPriorityTasks(userId: number): Promise<PriorityTasks> {
    try {
      const urgentTasks = await apiClient.get<Task[]>(`/api/tasks/${userId}?priority=urgent&completed=false`)
      const highTasks = await apiClient.get<Task[]>(`/api/tasks/${userId}?priority=high&completed=false`)
      
      return {
        urgent: urgentTasks.slice(0, 3),
        high: highTasks.slice(0, 3),
        totalCount: urgentTasks.length + highTasks.length
      }
    } catch {
      console.error('Error fetching priority tasks')
      return { urgent: [], high: [], totalCount: 0 }
    }
  }

  async getRecentActivity(userId: number): Promise<RecentActivity> {
    try {
      const recentCompleted = await apiClient.get<Task[]>(`/api/tasks/${userId}?completed=true&limit=5`)
      const recentCreated = await apiClient.get<Task[]>(`/api/tasks/${userId}?limit=5`)
      const recentUpdated = await apiClient.get<Task[]>(`/api/tasks/${userId}?limit=5`)
      
      return {
        recentCompleted: recentCompleted.slice(0, 3),
        recentCreated: recentCreated.slice(0, 3),
        recentUpdated: recentUpdated.slice(0, 3)
      }
    } catch {
      console.error('Error fetching recent activity')
      return { recentCompleted: [], recentCreated: [], recentUpdated: [] }
    }
  }

  private async aggregateDashboardData(userId: number): Promise<DashboardData> {
    try {
      const [stats, todaysTasks, recentActivity, priorityTasks] = await Promise.all([
        this.calculateStatsFromTasks(userId),
        this.getTodaysTasks(userId),
        this.getRecentActivity(userId),
        this.getPriorityTasks(userId)
      ])

      return {
        stats,
        todaysTasks,
        pomodoroStats: {
          currentSession: {
            isActive: false,
            timeRemaining: 0,
            sessionType: 'work'
          },
          dailyStats: {
            completed: 0,
            target: 8,
            focusTime: 0
          },
          weeklyStats: []
        },
        recentActivity,
        priorityTasks,
        groupsOverview: {
          groups: [],
          totalGroups: 0
        }
      }
    } catch (error) {
      console.error('Error aggregating dashboard data:', error)
      throw error
    }
  }

  private async calculateStatsFromTasks(userId: number): Promise<DashboardStats> {
    try {
      const [allTasks, completedTasks, todayCompleted] = await Promise.all([
        apiClient.get<Task[]>(`/api/tasks/${userId}`),
        apiClient.get<Task[]>(`/api/tasks/${userId}?completed=true`),
        apiClient.get<Task[]>(`/api/tasks/${userId}?completed=true&date=${new Date().toISOString().split('T')[0]}`)
      ])

      const now = new Date()
      const overdueTasks = allTasks.filter(task => 
        task.due_date && new Date(task.due_date) < now && task.status !== 'completed'
      )

      const totalPomodoros = allTasks.reduce((sum, task) => sum + (task.estimated_pomodoros || 0), 0)
      const completedPomodoros = allTasks.reduce((sum, task) => sum + (task.completed_pomodoros || 0), 0)

      return {
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: allTasks.length - completedTasks.length,
        overdueTasks: overdueTasks.length,
        completedToday: todayCompleted.length,
        totalPomodoros,
        completedPomodoros,
        weeklyProgress: []
      }
    } catch (error) {
      console.error('Error calculating stats from tasks:', error)
      return {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completedToday: 0,
        totalPomodoros: 0,
        completedPomodoros: 0,
        weeklyProgress: []
      }
    }
  }
}

export const dashboardService = DashboardService.getInstance()