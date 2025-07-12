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
  is_in_my_day: boolean
  starred: boolean
  user_id: number
  group_id?: number
  tags?: Tag[]
  subtasks?: Subtask[]
  // Subtask metadata (from backend)
  has_subtasks: boolean
  subtask_count: number
  completed_subtask_count: number
  subtask_completion_percentage: number
}

export interface Tag {
  id: number
  name: string
  color?: string
  user_id: number
}

export interface Subtask {
  id: number
  title: string
  description?: string
  position: number
  task_id: number
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface CreateSubtaskRequest {
  title: string
  description?: string
  position: number
  task_id: number
}

export interface UpdateSubtaskRequest {
  title?: string
  description?: string
  position?: number
  is_completed?: boolean
}

export interface SubtaskListResponse {
  subtasks: Subtask[]
  count: number
  task_id: number
}

export interface SubtaskStats {
  total: number
  completed: number
  pending: number
  completion_percentage: number
  task_id: number
}

export interface SubtaskFilters {
  completed?: boolean
  task_id?: number
  search?: string
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
  is_in_my_day?: boolean
  starred?: boolean
  group_id?: number
  tag_ids?: number[]
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
  is_in_my_day?: boolean
  starred?: boolean
  group_id?: number
  tag_ids?: number[]
}

export interface TaskFilters {
  status?: string[]
  priority?: string[]
  group_id?: number
  search?: string
  due_date_from?: string
  due_date_to?: string
  completed?: boolean
  starred?: boolean
  overdue?: boolean
  is_in_my_day?: boolean
  tags?: string[]
}

export interface TaskResponse {
  tasks: Task[]
  pagination: {
    total_count: number
    page: number
    page_size: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
  filters_applied?: TaskFilters
  sort?: {
    sort_by: string
    sort_order: string
  }
}

export interface TaskListResponse {
  tasks: Task[]
  count: number
  query?: string
}

// Pomodoro-related types
export interface PomodoroSession {
  id: number
  task_id: number
  duration: number
  completed: boolean
  start_time: string
  end_time?: string
  session_type: 'work' | 'short_break' | 'long_break'
  user_id: number
}

export interface PomodoroStats {
  total_sessions: number
  completed_sessions: number
  total_time: number
  sessions_today: number
  time_today: number
  average_session_length: number
  streak_days: number
}

// Task context and state types
export interface TaskState {
  tasks: Task[]
  selectedTask: Task | null
  filters: TaskFilters
  loading: boolean
  error: string | null
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface TaskContextType extends TaskState {
  // Task operations
  createTask: (task: CreateTaskRequest) => Promise<Task>
  updateTask: (id: number, updates: UpdateTaskRequest) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  duplicateTask: (id: number) => Promise<Task>
  
  // Task status operations
  toggleTaskCompletion: (id: number) => Promise<Task>
  markTaskAsStarred: (id: number, starred: boolean) => Promise<Task>
  
  // Subtask operations
  addSubtask: (taskId: number, title: string) => Promise<Subtask>
  updateSubtask: (taskId: number, subtaskId: number, updates: Partial<Subtask>) => Promise<Subtask>
  deleteSubtask: (taskId: number, subtaskId: number) => Promise<void>
  toggleSubtaskCompletion: (taskId: number, subtaskId: number) => Promise<Subtask>
  
  // Selection and filtering
  selectTask: (task: Task | null) => void
  setFilters: (filters: Partial<TaskFilters>) => void
  clearFilters: () => void
  
  // Data fetching
  fetchTasks: (params?: Partial<TaskFilters>) => Promise<void>
  refetchTasks: () => Promise<void>
  
  // Bulk operations
  bulkUpdateTasks: (taskIds: number[], updates: UpdateTaskRequest) => Promise<void>
  bulkDeleteTasks: (taskIds: number[]) => Promise<void>
}

// Task sorting and view options
export interface TaskSortOption {
  field: 'title' | 'priority' | 'due_date' | 'created_at' | 'updated_at'
  direction: 'asc' | 'desc'
}

export interface TaskViewOptions {
  groupBy: 'none' | 'priority' | 'status' | 'group' | 'due_date'
  sortBy: TaskSortOption
  showCompleted: boolean
  showSubtasks: boolean
  viewType: 'list' | 'grid' | 'kanban'
}

// Task statistics
export interface TaskStats {
  total: number
  completed: number
  pending: number
  in_progress: number
  overdue: number
  due_today: number
  due_this_week: number
  by_priority: Record<TaskPriority, number>
  by_group: Record<string, number>
  completion_rate: number
  average_completion_time: number
}

// Task activity and history
export interface TaskActivity {
  id: number
  task_id: number
  action: 'created' | 'updated' | 'completed' | 'deleted' | 'commented'
  description: string
  user_id: number
  created_at: string
  metadata?: Record<string, unknown>
}

// Task templates
export interface TaskTemplate {
  id: number
  name: string
  title: string
  description?: string
  priority: TaskPriority
  estimated_pomodoros: number
  tags: Tag[]
  subtasks: Omit<Subtask, 'id' | 'task_id'>[]
  user_id: number
}

// Note: ApiError is imported from @/types/api