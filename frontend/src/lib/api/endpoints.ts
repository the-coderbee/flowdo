export const API_ENDPOINTS = {
  // Authentication
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    me: '/api/auth/me',
    passwordReset: '/api/auth/password-reset',
    passwordResetConfirm: '/api/auth/password-reset-confirm'
  },

  // Tasks
  tasks: {
    list: '/api/tasks',
    create: '/api/tasks/create',
    get: (id: string) => `/api/tasks/${id}`,
    update: (id: string) => `/api/tasks/${id}`,
    delete: (id: string) => `/api/tasks/${id}`,
    toggle: (id: string) => `/api/tasks/${id}/toggle`,
    star: (id: string) => `/api/tasks/${id}/star`,
    bulkUpdate: '/api/tasks/bulk',
    markComplete: (id: string) => `/api/tasks/${id}/complete`,
    markIncomplete: (id: string) => `/api/tasks/${id}/incomplete`,
    // Specialized endpoints
    today: '/api/tasks/today',
    overdue: '/api/tasks/overdue',
    starred: '/api/tasks/starred',
    search: '/api/tasks/search',
    byPriorities: '/api/tasks/by-priorities',
    byStatuses: '/api/tasks/by-statuses',
    byTags: '/api/tasks/by-tags',
    byGroup: '/api/tasks/by-group'
  },

  // Subtasks (matching backend implementation)
  subtasks: {
    list: (taskId: number) => `/api/subtasks/task/${taskId}`,
    create: '/api/subtasks',
    get: (subtaskId: number) => `/api/subtasks/${subtaskId}`,
    update: (subtaskId: number) => `/api/subtasks/${subtaskId}`,
    delete: (subtaskId: number) => `/api/subtasks/${subtaskId}`,
    toggle: (subtaskId: number) => `/api/subtasks/${subtaskId}`,
    completionStats: (taskId: number) => `/api/subtasks/tasks/${taskId}/completion-count`,
    bulkToggle: (taskId: number) => `/api/subtasks/tasks/${taskId}/bulk-toggle`,
    reorder: (taskId: number) => `/api/subtasks/tasks/${taskId}/reorder`,
    bulkDelete: (taskId: number) => `/api/subtasks/tasks/${taskId}/delete`
  },

  // Tags
  tags: {
    list: '/api/tags',
    create: '/api/tags',
    get: (id: string) => `/api/tags/${id}`,
    update: (id: string) => `/api/tags/${id}`,
    delete: (id: string) => `/api/tags/${id}`,
    tasks: (id: string) => `/api/tags/${id}/tasks`
  },

  // Groups/Projects
  groups: {
    list: '/api/groups',
    create: '/api/groups',
    get: (id: string) => `/api/groups/${id}`,
    update: (id: string) => `/api/groups/${id}`,
    delete: (id: string) => `/api/groups/${id}`,
    tasks: (id: string) => `/api/groups/${id}/tasks`,
    members: (id: string) => `/api/groups/${id}/members`,
    addMember: (id: string) => `/api/groups/${id}/members`,
    removeMember: (id: string, memberId: string) => `/api/groups/${id}/members/${memberId}`
  },

  // Pomodoro
  pomodoro: {
    sessions: '/api/pomodoro/sessions',
    start: '/api/pomodoro/start',
    pause: '/api/pomodoro/pause',
    stop: '/api/pomodoro/stop',
    complete: '/api/pomodoro/complete',
    stats: '/api/pomodoro/stats'
  },

  // Dashboard
  dashboard: {
    data: '/api/dashboard/data',
    stats: '/api/dashboard/data', // Map to the same endpoint
    todayTasks: '/api/dashboard/today-tasks',
    recentActivity: '/api/dashboard/recent-activity',
    overview: '/api/dashboard/overview'
  },

  // Search
  search: {
    tasks: '/api/search/tasks',
    global: '/api/search'
  },

  // User preferences
  preferences: {
    get: '/api/user/preferences',
    update: '/api/user/preferences',
    theme: '/api/user/preferences/theme'
  }
} as const

export type EndpointFunction = (...args: string[]) => string
export type EndpointConstant = string
export type Endpoint = EndpointFunction | EndpointConstant

export default API_ENDPOINTS