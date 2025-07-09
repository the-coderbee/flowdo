export const APP_CONSTANTS = {
  // App metadata
  APP_NAME: 'FlowDo',
  APP_DESCRIPTION: 'Productivity app combining task management with the Pomodoro technique',
  APP_VERSION: '1.0.0',

  // Routes
  ROUTES: {
    HOME: '/',
    DASHBOARD: '/dashboard',
    TASKS: '/tasks',
    MY_DAY: '/my-day',
    STARRED: '/starred',
    TAGS: '/tags',
    GROUPS: '/groups',
    POMODORO: '/pomodoro',
    SETTINGS: '/settings',
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
  },

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    SIDEBAR_COLLAPSED: 'sidebar_collapsed',
    TASK_FILTERS: 'task_filters',
    POMODORO_SETTINGS: 'pomodoro_settings',
    RECENT_SEARCHES: 'recent_searches',
  },

  // Cookie names
  COOKIES: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    CSRF_ACCESS_TOKEN: 'csrf_access_token',
    CSRF_REFRESH_TOKEN: 'csrf_refresh_token',
  },

  // API related
  API: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 5,
  },

  // Task constants
  TASK: {
    PRIORITIES: ['low', 'medium', 'high'] as const,
    STATUSES: ['pending', 'in_progress', 'completed', 'cancelled'] as const,
    MAX_TITLE_LENGTH: 255,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_SUBTASKS: 50,
  },

  // Pomodoro constants
  POMODORO: {
    DEFAULT_WORK_DURATION: 25 * 60, // 25 minutes in seconds
    DEFAULT_SHORT_BREAK: 5 * 60, // 5 minutes
    DEFAULT_LONG_BREAK: 15 * 60, // 15 minutes
    SESSIONS_BEFORE_LONG_BREAK: 4,
    MIN_DURATION: 1 * 60, // 1 minute
    MAX_DURATION: 60 * 60, // 60 minutes
  },

  // UI constants
  UI: {
    SIDEBAR_WIDTH: 280,
    HEADER_HEIGHT: 64,
    MOBILE_BREAKPOINT: 768,
    TABLET_BREAKPOINT: 1024,
    DESKTOP_BREAKPOINT: 1280,
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 300,
    TOAST_DURATION: 5000,
  },

  // File upload
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  },

  // Validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    DISPLAY_NAME_MIN_LENGTH: 2,
    DISPLAY_NAME_MAX_LENGTH: 50,
    TAG_NAME_MAX_LENGTH: 30,
    GROUP_NAME_MAX_LENGTH: 50,
  },

  // Error messages
  ERRORS: {
    NETWORK_ERROR: 'Network error - please check your connection',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    FORBIDDEN: 'Access denied',
    NOT_FOUND: 'The requested resource was not found',
    SERVER_ERROR: 'Internal server error - please try again later',
    VALIDATION_ERROR: 'Please check your input and try again',
    GENERIC_ERROR: 'An unexpected error occurred',
  },

  // Success messages
  SUCCESS: {
    TASK_CREATED: 'Task created successfully',
    TASK_UPDATED: 'Task updated successfully',
    TASK_DELETED: 'Task deleted successfully',
    TAG_CREATED: 'Tag created successfully',
    TAG_UPDATED: 'Tag updated successfully',
    TAG_DELETED: 'Tag deleted successfully',
    GROUP_CREATED: 'Group created successfully',
    GROUP_UPDATED: 'Group updated successfully',
    GROUP_DELETED: 'Group deleted successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    LOGGED_OUT: 'Logged out successfully',
  },

  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
    INPUT: 'yyyy-MM-dd',
    TIME: 'HH:mm',
    FULL: 'EEEE, MMMM dd, yyyy',
  },

  // Feature flags
  FEATURES: {
    ENABLE_GROUPS: true,
    ENABLE_TAGS: true,
    ENABLE_POMODORO: true,
    ENABLE_ANALYTICS: false,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
  },
} as const

export type Priority = typeof APP_CONSTANTS.TASK.PRIORITIES[number]
export type TaskStatus = typeof APP_CONSTANTS.TASK.STATUSES[number]

export default APP_CONSTANTS