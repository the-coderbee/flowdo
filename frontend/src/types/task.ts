export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived' | 'cancelled'

export interface Task {
  id: number
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
  estimated_pomodoros: number
  completed_pomodoros: number
  user_id: number
  group_id?: number
  tags?: Tag[]
  subtasks?: Subtask[]
}

export interface Tag {
  id: number
  name: string
  user_id: number
}

export interface Subtask {
  id: number
  title: string
  is_completed: boolean
  task_id: number
}

export interface TaskGroup {
  id: number
  name: string
  description?: string
  color?: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  estimated_pomodoros?: number
  group_id?: number
  user_id: number
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string
  estimated_pomodoros?: number
  completed_pomodoros?: number
  group_id?: number
}

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  group_id?: number
  search?: string
  due_date_from?: string
  due_date_to?: string
  completed?: boolean
}

export interface TaskResponse {
  tasks: Task[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}