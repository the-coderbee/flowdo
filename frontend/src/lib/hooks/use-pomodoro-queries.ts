import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import pomodoroService, {
  PomodoroSession,
  CreateSessionRequest,
  SessionQueryParams,
  SessionStats,
  DailyStats,
  TaskSessionStats
} from '@/lib/api/pomodoro-service'

// Query Keys
export const pomodoroKeys = {
  all: ['pomodoro'] as const,
  sessions: () => [...pomodoroKeys.all, 'sessions'] as const,
  session: (id: string) => [...pomodoroKeys.sessions(), id] as const,
  activeSession: () => [...pomodoroKeys.sessions(), 'active'] as const,
  stats: () => [...pomodoroKeys.all, 'stats'] as const,
  dailyStats: (date?: string) => [...pomodoroKeys.stats(), 'daily', date] as const,
  taskSessions: (taskId: number) => [...pomodoroKeys.all, 'tasks', taskId, 'sessions'] as const,
}

// Query Hooks
export function useActiveSession() {
  return useQuery({
    queryKey: pomodoroKeys.activeSession(),
    queryFn: async () => {
      const response = await pomodoroService.getActiveSession()
      if (!response.success) {
        throw new Error(response.error || 'Failed to get active session')
      }
      return response.session
    },
    refetchInterval: (data) => {
      // Refetch every 1 second if there's an active session
      return data && pomodoroService.isSessionActive(data) ? 1000 : false
    },
    staleTime: 0, // Always fetch fresh data for active sessions
  })
}

export function useSessions(params?: SessionQueryParams) {
  return useQuery({
    queryKey: [...pomodoroKeys.sessions(), params],
    queryFn: async () => {
      const response = await pomodoroService.getSessions(params)
      if (!response.success) {
        throw new Error(response.error || 'Failed to get sessions')
      }
      return {
        sessions: response.sessions || [],
        count: response.count || 0
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSession(sessionId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: pomodoroKeys.session(sessionId),
    queryFn: async () => {
      const response = await pomodoroService.getSessionById(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to get session')
      }
      return response.session
    },
    enabled: enabled && !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useSessionStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: [...pomodoroKeys.stats(), { dateFrom, dateTo }],
    queryFn: async () => {
      const response = await pomodoroService.getStats(dateFrom, dateTo)
      if (!response.success) {
        throw new Error(response.error || 'Failed to get statistics')
      }
      return response.stats as SessionStats
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useDailyStats(date?: string) {
  return useQuery({
    queryKey: pomodoroKeys.dailyStats(date),
    queryFn: async () => {
      const response = await pomodoroService.getDailyStats(date)
      if (!response.success) {
        throw new Error(response.error || 'Failed to get daily statistics')
      }
      return response.daily_stats as DailyStats
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTaskSessions(taskId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: pomodoroKeys.taskSessions(taskId),
    queryFn: async () => {
      const response = await pomodoroService.getTaskSessions(taskId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to get task sessions')
      }
      return {
        sessions: response.sessions || [],
        stats: response.stats as TaskSessionStats
      }
    },
    enabled: enabled && !!taskId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutation Hooks
export function useStartSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSessionRequest) => {
      const response = await pomodoroService.startSession(data)
      if (!response.success) {
        throw new Error(response.error || 'Failed to start session')
      }
      return response.session as PomodoroSession
    },
    onSuccess: (session) => {
      // Update active session cache
      queryClient.setQueryData(pomodoroKeys.activeSession(), session)
      
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.sessions() })
      
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.stats() })
      
      toast.success(`${pomodoroService.getSessionTypeLabel(session.session_type)} started!`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

export function usePauseSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await pomodoroService.pauseSession(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to pause session')
      }
      return response.session as PomodoroSession
    },
    onSuccess: (session) => {
      // Update active session cache
      queryClient.setQueryData(pomodoroKeys.activeSession(), session)
      
      // Update specific session cache
      queryClient.setQueryData(pomodoroKeys.session(session.session_id), session)
      
      toast.success('Session paused')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

export function useResumeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await pomodoroService.resumeSession(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to resume session')
      }
      return response.session as PomodoroSession
    },
    onSuccess: (session) => {
      // Update active session cache
      queryClient.setQueryData(pomodoroKeys.activeSession(), session)
      
      // Update specific session cache
      queryClient.setQueryData(pomodoroKeys.session(session.session_id), session)
      
      toast.success('Session resumed')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

export function useCompleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await pomodoroService.completeSession(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to complete session')
      }
      return response.session as PomodoroSession
    },
    onSuccess: (session) => {
      // Clear active session cache
      queryClient.setQueryData(pomodoroKeys.activeSession(), null)
      
      // Update specific session cache
      queryClient.setQueryData(pomodoroKeys.session(session.session_id), session)
      
      // Invalidate sessions list and stats
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.stats() })
      
      // Invalidate task sessions if applicable
      if (session.task_id) {
        queryClient.invalidateQueries({ queryKey: pomodoroKeys.taskSessions(session.task_id) })
      }
      
      toast.success(`${pomodoroService.getSessionTypeLabel(session.session_type)} completed! 🎉`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

export function useCancelSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await pomodoroService.cancelSession(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel session')
      }
      return response.session as PomodoroSession
    },
    onSuccess: (session) => {
      // Clear active session cache
      queryClient.setQueryData(pomodoroKeys.activeSession(), null)
      
      // Update specific session cache
      queryClient.setQueryData(pomodoroKeys.session(session.session_id), session)
      
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.sessions() })
      
      toast.success('Session cancelled')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

export function useDeleteSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await pomodoroService.deleteSession(sessionId)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete session')
      }
      return response
    },
    onSuccess: (_, sessionId) => {
      // Remove from specific session cache
      queryClient.removeQueries({ queryKey: pomodoroKeys.session(sessionId) })
      
      // Invalidate sessions list and stats
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: pomodoroKeys.stats() })
      
      toast.success('Session deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

// Combined hook for session management
export function usePomodoroSession() {
  const { data: activeSession, isLoading, error, refetch } = useActiveSession()
  const startMutation = useStartSession()
  const pauseMutation = usePauseSession()
  const resumeMutation = useResumeSession()
  const completeMutation = useCompleteSession()
  const cancelMutation = useCancelSession()

  const isActive = activeSession && pomodoroService.isSessionActive(activeSession)
  const isPaused = activeSession && pomodoroService.isSessionPaused(activeSession)
  const isCompleted = activeSession && pomodoroService.isSessionCompleted(activeSession)

  // Calculate real-time progress and remaining time
  const progress = activeSession ? pomodoroService.calculateProgress(activeSession) : 0
  const remainingTime = activeSession ? pomodoroService.calculateRemainingTime(activeSession) : { minutes: 0, seconds: 0 }
  const formattedTime = pomodoroService.formatTime(remainingTime.minutes, remainingTime.seconds)

  const startSession = (data: CreateSessionRequest) => {
    return startMutation.mutateAsync(data)
  }

  const pauseSession = () => {
    if (!activeSession) return Promise.reject(new Error('No active session'))
    return pauseMutation.mutateAsync(activeSession.session_id)
  }

  const resumeSession = () => {
    if (!activeSession) return Promise.reject(new Error('No active session'))
    return resumeMutation.mutateAsync(activeSession.session_id)
  }

  const completeSession = () => {
    if (!activeSession) return Promise.reject(new Error('No active session'))
    return completeMutation.mutateAsync(activeSession.session_id)
  }

  const cancelSession = () => {
    if (!activeSession) return Promise.reject(new Error('No active session'))
    return cancelMutation.mutateAsync(activeSession.session_id)
  }

  const toggleSession = () => {
    if (!activeSession) return Promise.reject(new Error('No active session'))
    
    if (isActive) {
      return pauseSession()
    } else if (isPaused) {
      return resumeSession()
    }
    
    return Promise.reject(new Error('Invalid session state'))
  }

  return {
    // State
    activeSession,
    isLoading,
    error,
    isActive,
    isPaused,
    isCompleted,
    progress,
    remainingTime,
    formattedTime,
    
    // Actions
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    cancelSession,
    toggleSession,
    refetchSession: refetch,
    
    // Mutation states
    isStarting: startMutation.isPending,
    isPausing: pauseMutation.isPending,
    isResuming: resumeMutation.isPending,
    isCompleting: completeMutation.isPending,
    isCancelling: cancelMutation.isPending,
    isUpdating: pauseMutation.isPending || resumeMutation.isPending || completeMutation.isPending || cancelMutation.isPending,
  }
}

// Hook for session history and analytics
export function usePomodoroAnalytics(dateRange?: { from: string; to: string }) {
  const stats = useSessionStats(dateRange?.from, dateRange?.to)
  const dailyStats = useDailyStats()
  const recentSessions = useSessions({ limit: 10, status: 'completed' })

  return {
    stats: stats.data,
    dailyStats: dailyStats.data,
    recentSessions: recentSessions.data?.sessions || [],
    isLoading: stats.isLoading || dailyStats.isLoading || recentSessions.isLoading,
    error: stats.error || dailyStats.error || recentSessions.error,
  }
}