import { QueryClient } from '@tanstack/react-query'

function createQueryClient() {
  return new QueryClient({
  defaultOptions: {
    queries: {
      // How long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // How long inactive data stays in memory (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, or 404 errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = error.status as number
          if (status === 401 || status === 403 || status === 404) {
            return false
          }
        }
        return failureCount < 3
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (background sync)
      refetchOnWindowFocus: true,
      // Refetch on network reconnect (background sync)
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Background refetch interval (15 minutes)
      refetchInterval: 15 * 60 * 1000,
      // Only refetch in background if window is focused
      refetchIntervalInBackground: false,
      // Network mode for better offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Network error handling - queue mutations when offline
      networkMode: 'offlineFirst',
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
})
}

// Create a singleton instance for client-side
let clientQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!clientQueryClient) clientQueryClient = createQueryClient()
    return clientQueryClient
  }
}

// Query keys factory for consistent key management
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tasks.lists(), { filters }] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    // Route-specific keys
    allTasks: () => [...queryKeys.tasks.list(), 'all'] as const,
    myDay: () => [...queryKeys.tasks.list(), 'my-day'] as const,
    starred: () => [...queryKeys.tasks.list(), 'starred'] as const,
    completed: () => [...queryKeys.tasks.list(), 'completed'] as const,
    today: () => [...queryKeys.tasks.list(), 'today'] as const,
    overdue: () => [...queryKeys.tasks.list(), 'overdue'] as const,
  },
  subtasks: {
    all: ['subtasks'] as const,
    lists: () => [...queryKeys.subtasks.all, 'list'] as const,
    list: (taskId: string) => [...queryKeys.subtasks.lists(), 'by-task', taskId] as const,
    details: () => [...queryKeys.subtasks.all, 'detail'] as const,
    detail: (taskId: string, subtaskId: string) => [...queryKeys.subtasks.details(), taskId, subtaskId] as const,
    // Task-specific subtask keys
    byTask: (taskId: string) => [...queryKeys.subtasks.list(taskId)] as const,
    // Statistics and summary keys
    stats: (taskId: string) => [...queryKeys.subtasks.byTask(taskId), 'stats'] as const,
    summary: (taskId: string) => [...queryKeys.subtasks.byTask(taskId), 'summary'] as const,
  },
  groups: {
    all: ['groups'] as const,
    lists: () => [...queryKeys.groups.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.groups.lists(), { filters }] as const,
  },
  tags: {
    all: ['tags'] as const,
    lists: () => [...queryKeys.tags.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tags.lists(), { filters }] as const,
  },
} as const