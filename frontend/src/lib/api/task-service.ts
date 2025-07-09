import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import { 
  Task, 
  TaskFilters, 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskResponse,
  TaskListResponse
} from "@/types/task"
import { TaskPagination } from "@/lib/store/task-reducer"

export class TaskService {
  // Main task fetching with filters and pagination
  static async fetchTasks(
    filters: TaskFilters = {}, 
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = "created_at",
    sortOrder: string = "desc"
  ): Promise<{ tasks: Task[], pagination: TaskPagination }> {
    const params = new URLSearchParams()
    
    // Add filters to params
    if (filters.status?.length) params.append('status', filters.status.join(','))
    if (filters.priority?.length) params.append('priority', filters.priority.join(','))
    if (filters.group_id) params.append('group_id', filters.group_id.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.due_date_from) params.append('due_date_from', filters.due_date_from)
    if (filters.due_date_to) params.append('due_date_to', filters.due_date_to)
    if (filters.completed !== undefined) params.append('completed', filters.completed.toString())
    if (filters.starred !== undefined) params.append('starred', filters.starred.toString())
    if (filters.overdue !== undefined) params.append('overdue', filters.overdue.toString())
    if (filters.tags?.length) params.append('tags', filters.tags.join(','))
    
    // Add pagination and sorting
    params.append('page', page.toString())
    params.append('page_size', pageSize.toString())
    params.append('sort_by', sortBy)
    params.append('sort_order', sortOrder)

    const endpoint = `${API_ENDPOINTS.tasks.list}?${params.toString()}`
    
    try {
      const response = await apiClient.get<TaskResponse>(endpoint)
      
      return {
        tasks: response.tasks || [],
        pagination: {
          total: response.pagination.total_count || 0,
          page: response.pagination.page || 1,
          per_page: response.pagination.page_size || pageSize,
          total_pages: response.pagination.total_pages || 1
        }
      }
    } catch (error) {
      console.error('Task fetch error:', {
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Specialized endpoint methods
  static async getTodaysTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get<TaskListResponse>(API_ENDPOINTS.tasks.today)
      return response.tasks || []
    } catch (error) {
      console.error('Today tasks fetch error:', error)
      throw error
    }
  }

  static async getOverdueTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get<TaskListResponse>(API_ENDPOINTS.tasks.overdue)
      return response.tasks || []
    } catch (error) {
      console.error('Overdue tasks fetch error:', error)
      throw error
    }
  }

  static async getStarredTasks(): Promise<Task[]> {
    try {
      const response = await apiClient.get<TaskListResponse>(API_ENDPOINTS.tasks.starred)
      return response.tasks || []
    } catch (error) {
      console.error('Starred tasks fetch error:', error)
      throw error
    }
  }

  static async searchTasks(query: string): Promise<Task[]> {
    try {
      const params = new URLSearchParams()
      params.append('q', query)
      
      const response = await apiClient.get<TaskListResponse>(
        `${API_ENDPOINTS.tasks.search}?${params.toString()}`
      )
      return response.tasks || []
    } catch (error) {
      console.error('Search tasks error:', error)
      throw error
    }
  }

  static async getTasksByPriorities(priorities: string[]): Promise<Task[]> {
    try {
      const params = new URLSearchParams()
      params.append('priority', priorities.join(','))
      
      const response = await apiClient.get<TaskListResponse>(
        `${API_ENDPOINTS.tasks.byPriorities}?${params.toString()}`
      )
      return response.tasks || []
    } catch (error) {
      console.error('Tasks by priorities fetch error:', error)
      throw error
    }
  }

  static async getTasksByStatuses(statuses: string[]): Promise<Task[]> {
    try {
      const params = new URLSearchParams()
      params.append('status', statuses.join(','))
      
      const response = await apiClient.get<TaskListResponse>(
        `${API_ENDPOINTS.tasks.byStatuses}?${params.toString()}`
      )
      return response.tasks || []
    } catch (error) {
      console.error('Tasks by statuses fetch error:', error)
      throw error
    }
  }

  static async getTasksByTags(tags: string[]): Promise<Task[]> {
    try {
      const params = new URLSearchParams()
      params.append('tag', tags.join(','))
      
      const response = await apiClient.get<TaskListResponse>(
        `${API_ENDPOINTS.tasks.byTags}?${params.toString()}`
      )
      return response.tasks || []
    } catch (error) {
      console.error('Tasks by tags fetch error:', error)
      throw error
    }
  }

  static async getTasksByGroup(groupId: number): Promise<Task[]> {
    try {
      const params = new URLSearchParams()
      params.append('group_id', groupId.toString())
      
      const response = await apiClient.get<TaskListResponse>(
        `${API_ENDPOINTS.tasks.byGroup}?${params.toString()}`
      )
      return response.tasks || []
    } catch (error) {
      console.error('Tasks by group fetch error:', error)
      throw error
    }
  }

  // Task operations
  static async createTask(task: CreateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.post<Task>(API_ENDPOINTS.tasks.create, task)
      return response
    } catch (error) {
      console.error('Task creation error:', error)
      throw error
    }
  }

  static async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    try {
      const response = await apiClient.patch<Task>(API_ENDPOINTS.tasks.update(id.toString()), updates)
      return response
    } catch (error) {
      console.error('Task update error:', error)
      throw error
    }
  }

  static async deleteTask(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.tasks.delete(id.toString()))
    } catch (error) {
      console.error('Task deletion error:', error)
      throw error
    }
  }

  static async toggleTaskCompletion(id: number): Promise<Task> {
    try {
      const response = await apiClient.patch<Task>(API_ENDPOINTS.tasks.toggle(id.toString()))
      return response
    } catch (error) {
      console.error('Task toggle error:', error)
      throw error
    }
  }

  // Utility methods for building filters
  static buildTaskFilters(filters: Partial<TaskFilters>): TaskFilters {
    return {
      status: filters.status,
      priority: filters.priority,
      group_id: filters.group_id,
      search: filters.search,
      due_date_from: filters.due_date_from,
      due_date_to: filters.due_date_to,
      completed: filters.completed,
      starred: filters.starred,
      overdue: filters.overdue,
      is_in_my_day: filters.is_in_my_day,
      tags: filters.tags
    }
  }

  static getTodayFilters(): TaskFilters {
    const today = new Date().toISOString().split('T')[0]
    return {
      due_date_from: today,
      due_date_to: today
    }
  }

  static getStarredFilters(): TaskFilters {
    return {
      starred: true
    }
  }

  static getOverdueFilters(): TaskFilters {
    return {
      overdue: true
    }
  }

  static getMyDayFilters(): TaskFilters {
    return {
      is_in_my_day: true
    }
  }

  // Backward compatibility methods (these now use specialized endpoints)
  static async fetchPriorityTasks(): Promise<Task[]> {
    return this.getTasksByPriorities(['high', 'urgent'])
  }

  static async fetchTodaysTasks(): Promise<Task[]> {
    return this.getTodaysTasks()
  }
}