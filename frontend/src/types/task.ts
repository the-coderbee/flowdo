// Task-related TypeScript interfaces based on backend models

export enum TaskStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS", 
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
  CANCELLED = "CANCELLED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH", 
  URGENT = "URGENT"
}

export interface Task {
  id: number
  title: string
  description?: string
  priority: TaskPriority
  status: TaskStatus
  due_date?: string
  completed_at?: string
  estimated_pomodoros?: number
  completed_pomodoros?: number
  user_id: number
  group_id?: number
  created_at: string
  updated_at: string
  
  // Relationships
  group?: Group
  tags?: Tag[]
  subtasks?: Subtask[]
  pomodoro_sessions?: PomodoroSession[]
}

export interface Subtask {
  id: number
  title: string
  is_completed: boolean
  task_id: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface Group {
  id: number
  name: string
  description?: string
  color?: string
  user_id: number
  created_at: string
  updated_at: string
}

export interface PomodoroSession {
  id: number
  duration: number
  completed: boolean
  task_id: number
  created_at: string
  updated_at: string
}

// API Request/Response types
export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: TaskPriority
  due_date?: string
  estimated_pomodoros?: number
  group_id?: number
  tag_ids?: number[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string
  estimated_pomodoros?: number
  group_id?: number
  tag_ids?: number[]
}

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  per_page: number
}

export interface TaskApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

// Component prop types
export interface TaskItemProps {
  task: Task
  onToggleComplete: (taskId: number) => void
  onClick: (task: Task) => void
}

export interface TaskModalProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  onDelete?: (taskId: number) => void
}

export interface AddTaskProps {
  onAdd: (task: CreateTaskRequest) => void
  groupId?: number
}

// Filter and sort types
export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  group_id?: number
  tag_ids?: number[]
  search?: string
  due_date_from?: string
  due_date_to?: string
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'due_date' | 'priority' | 'title'
  direction: 'asc' | 'desc'
}