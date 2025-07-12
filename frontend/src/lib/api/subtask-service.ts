import { apiClient } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/api/endpoints"
import { 
  Subtask, 
  CreateSubtaskRequest, 
  UpdateSubtaskRequest, 
  SubtaskListResponse, 
  SubtaskStats
} from "@/types/task"

export class SubtaskService {
  // Get all subtasks for a specific task
  static async getSubtasks(taskId: number): Promise<Subtask[]> {
    try {
      const response = await apiClient.get<Subtask[]>(
        API_ENDPOINTS.subtasks.list(taskId.toString())
      )
      return Array.isArray(response) ? response : []
    } catch (error) {
      console.error('Subtask fetch error:', {
        taskId,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Get a specific subtask
  static async getSubtask(subtaskId: number): Promise<Subtask> {
    try {
      const response = await apiClient.get<Subtask>(
        API_ENDPOINTS.subtasks.get(subtaskId)
      )
      return response
    } catch (error) {
      console.error('Subtask get error:', {
        subtaskId,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Create a new subtask
  static async createSubtask(subtaskData: CreateSubtaskRequest): Promise<Subtask> {
    try {
      const response = await apiClient.post<Subtask>(
        API_ENDPOINTS.subtasks.create,
        subtaskData
      )
      return response
    } catch (error) {
      console.error('Subtask creation error:', {
        subtaskData,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Update a subtask
  static async updateSubtask(
    subtaskId: number, 
    updates: UpdateSubtaskRequest
  ): Promise<Subtask> {
    try {
      const response = await apiClient.patch<Subtask>(
        API_ENDPOINTS.subtasks.update(subtaskId),
        updates
      )
      return response
    } catch (error) {
      console.error('Subtask update error:', {
        subtaskId,
        updates,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Delete a subtask
  static async deleteSubtask(subtaskId: number): Promise<void> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.subtasks.delete(subtaskId)
      )
    } catch (error) {
      console.error('Subtask deletion error:', {
        subtaskId,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Toggle subtask completion
  static async toggleSubtaskCompletion(subtaskId: number, currentStatus: boolean): Promise<Subtask> {
    try {
      const response = await apiClient.patch<Subtask>(
        API_ENDPOINTS.subtasks.update(subtaskId),
        { is_completed: !currentStatus }
      )
      return response
    } catch (error) {
      console.error('Subtask toggle error:', {
        subtaskId,
        currentStatus,
        message: error?.message || 'Unknown error',
        status: error?.status || 0,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  // Utility methods
  static calculateSubtaskStats(subtasks: Subtask[]): SubtaskStats {
    const total = subtasks.length
    const completed = subtasks.filter(subtask => subtask.is_completed).length
    const pending = total - completed
    const completion_percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      completed,
      pending,
      completion_percentage
    }
  }

  // Get subtask completion summary for a task
  static getSubtaskSummary(subtasks: Subtask[]): string {
    const stats = this.calculateSubtaskStats(subtasks)
    if (stats.total === 0) return 'No subtasks'
    if (stats.completed === stats.total) return 'All subtasks completed'
    return `${stats.completed}/${stats.total} completed`
  }

  // Check if all subtasks are completed
  static areAllSubtasksCompleted(subtasks: Subtask[]): boolean {
    return subtasks.length > 0 && subtasks.every(subtask => subtask.is_completed)
  }

  // Get pending subtasks
  static getPendingSubtasks(subtasks: Subtask[]): Subtask[] {
    return subtasks.filter(subtask => !subtask.is_completed)
  }

  // Get completed subtasks
  static getCompletedSubtasks(subtasks: Subtask[]): Subtask[] {
    return subtasks.filter(subtask => subtask.is_completed)
  }

  // Sort subtasks by completion status (pending first, then completed)
  static sortSubtasks(subtasks: Subtask[]): Subtask[] {
    return [...subtasks].sort((a, b) => {
      if (a.is_completed === b.is_completed) {
        return a.id - b.id // Sort by ID if same completion status
      }
      return a.is_completed ? 1 : -1 // Pending first, completed last
    })
  }

  // Validate subtask data
  static validateSubtaskData(data: CreateSubtaskRequest | UpdateSubtaskRequest): boolean {
    if ('title' in data && typeof data.title === 'string') {
      return data.title.trim().length > 0 && data.title.trim().length <= 500
    }
    return true // For updates that don't include title
  }
}

export default SubtaskService