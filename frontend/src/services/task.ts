import { apiClient } from '@/lib/api'
import { 
  Task, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskFilters
} from '@/types/task'

export class TaskService {
  private static instance: TaskService | null = null
  private readonly baseEndpoint = '/api/tasks'

  private constructor() {}

  static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService()
    }
    return TaskService.instance
  }

  async getTasks(userId: number, filters?: TaskFilters): Promise<Task[]> {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters) {
        if (filters.status?.length) {
          queryParams.append('status', filters.status.join(','))
        }
        if (filters.priority?.length) {
          queryParams.append('priority', filters.priority.join(','))
        }
        if (filters.group_id) {
          queryParams.append('group_id', filters.group_id.toString())
        }
        if (filters.search) {
          queryParams.append('search', filters.search)
        }
        if (filters.due_date_from) {
          queryParams.append('due_date_from', filters.due_date_from)
        }
        if (filters.due_date_to) {
          queryParams.append('due_date_to', filters.due_date_to)
        }
        if (filters.completed !== undefined) {
          queryParams.append('completed', filters.completed.toString())
        }
      }

      const endpoint = `${this.baseEndpoint}/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      
      const response = await apiClient.get<Task[]>(endpoint)
      return response
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  async getTask(taskId: number): Promise<Task> {
    try {
      const response = await apiClient.get<Task>(`${this.baseEndpoint}/task/${taskId}`)
      return response
    } catch (error) {
      console.error('Error fetching task:', error)
      throw error
    }
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.post<Task>(`${this.baseEndpoint}/create`, task)
      return response
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  async updateTask(taskId: number, updates: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.patch<Task>(`${this.baseEndpoint}/${taskId}`, updates)
      return response
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async deleteTask(taskId: number): Promise<void> {
    try {
      await apiClient.delete(`${this.baseEndpoint}/${taskId}`)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  async toggleTaskCompletion(taskId: number): Promise<Task> {
    try {
      const response = await apiClient.patch<Task>(`${this.baseEndpoint}/${taskId}/toggle`, {})
      return response
    } catch (error) {
      console.error('Error toggling task completion:', error)
      throw error
    }
  }

  async getTasksByStatus(userId: number, status: string): Promise<Task[]> {
    return this.getTasks(userId, { status: [status] })
  }

  async getTasksByPriority(userId: number, priority: string): Promise<Task[]> {
    return this.getTasks(userId, { priority: [priority] })
  }

  async getTasksByGroup(userId: number, groupId: number): Promise<Task[]> {
    return this.getTasks(userId, { group_id: groupId })
  }

  async getCompletedTasks(userId: number): Promise<Task[]> {
    return this.getTasks(userId, { completed: true })
  }

  async getPendingTasks(userId: number): Promise<Task[]> {
    return this.getTasks(userId, { status: ['pending'] })
  }

  async getInProgressTasks(userId: number): Promise<Task[]> {
    return this.getTasks(userId, { status: ['in_progress'] })
  }

  async getTodaysTasks(userId: number): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.getTasks(userId, { 
      due_date_from: today, 
      due_date_to: today 
    })
  }

  async getStarredTasks(userId: number): Promise<Task[]> {
    return this.getTasks(userId, { priority: ['high', 'urgent'] })
  }

  async searchTasks(userId: number, query: string): Promise<Task[]> {
    return this.getTasks(userId, { search: query })
  }
}

export const taskService = TaskService.getInstance()