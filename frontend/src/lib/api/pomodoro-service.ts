import { apiClient } from './client'

export interface PomodoroSession {
  session_id: string
  user_id: number
  task_id?: number
  session_type: 'work' | 'short_break' | 'long_break'
  status: 'in_progress' | 'completed' | 'pending' | 'archived' | 'cancelled'
  duration: number
  start_time?: string
  paused_at?: string
  end_time?: string
  completed_at?: string
  created_at?: string
  updated_at?: string
}

export interface CreateSessionRequest {
  session_type: 'work' | 'short_break' | 'long_break'
  duration: number
  task_id?: number
}

export interface SessionResponse {
  success: boolean
  session?: PomodoroSession
  error?: string
  active_session_id?: string
}

export interface SessionsResponse {
  success: boolean
  sessions?: PomodoroSession[]
  count?: number
  error?: string
}

export interface SessionStats {
  total_sessions: number
  completed_sessions: number
  work_sessions: number
  break_sessions: number
  total_focus_time_minutes: number
  completion_rate: number
}

export interface StatsResponse {
  success: boolean
  stats?: SessionStats
  error?: string
}

export interface DailyStats {
  date: string
  total_sessions: number
  completed_sessions: number
  work_sessions: number
  focus_time_minutes: number
  sessions: PomodoroSession[]
}

export interface DailyStatsResponse {
  success: boolean
  daily_stats?: DailyStats
  error?: string
}

export interface TaskSessionStats {
  total_sessions: number
  completed_sessions: number
  total_time_minutes: number
}

export interface TaskSessionsResponse {
  success: boolean
  sessions?: PomodoroSession[]
  stats?: TaskSessionStats
  error?: string
}

export interface SessionQueryParams {
  limit?: number
  offset?: number
  status?: string
  session_type?: string
  date_from?: string
  date_to?: string
}

class PomodoroService {
  private baseUrl = '/api/pomodoro'

  async startSession(data: CreateSessionRequest): Promise<SessionResponse> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/sessions`, data)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to start session'
      }
    }
  }

  async getActiveSession(): Promise<SessionResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sessions/active`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get active session'
      }
    }
  }

  async getSessions(params?: SessionQueryParams): Promise<SessionsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sessions`, { params })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get sessions'
      }
    }
  }

  async getSessionById(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/sessions/${sessionId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get session'
      }
    }
  }

  async pauseSession(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/pause`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to pause session'
      }
    }
  }

  async resumeSession(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/resume`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to resume session'
      }
    }
  }

  async completeSession(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/complete`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to complete session'
      }
    }
  }

  async cancelSession(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await apiClient.patch(`${this.baseUrl}/sessions/${sessionId}/cancel`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to cancel session'
      }
    }
  }

  async deleteSession(sessionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}/sessions/${sessionId}`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to delete session'
      }
    }
  }

  async getStats(dateFrom?: string, dateTo?: string): Promise<StatsResponse> {
    try {
      const params: Record<string, string> = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const response = await apiClient.get(`${this.baseUrl}/stats`, { params })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get statistics'
      }
    }
  }

  async getDailyStats(date?: string): Promise<DailyStatsResponse> {
    try {
      const params: Record<string, string> = {}
      if (date) params.date = date

      const response = await apiClient.get(`${this.baseUrl}/stats/daily`, { params })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get daily statistics'
      }
    }
  }

  async getTaskSessions(taskId: number): Promise<TaskSessionsResponse> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/tasks/${taskId}/sessions`)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        error: 'Failed to get task sessions'
      }
    }
  }

  // Utility methods for formatting and calculations
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  formatTime(minutes: number, seconds: number): string {
    const mm = minutes.toString().padStart(2, '0')
    const ss = seconds.toString().padStart(2, '0')
    return `${mm}:${ss}`
  }

  calculateProgress(session: PomodoroSession): number {
    if (!session.start_time) return 0
    
    const startTime = new Date(session.start_time)
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60) // minutes
    
    // Account for paused time
    let pausedDuration = 0
    if (session.paused_at) {
      const pausedTime = new Date(session.paused_at)
      pausedDuration = Math.floor((now.getTime() - pausedTime.getTime()) / 1000 / 60)
    }
    
    const actualElapsed = elapsed - pausedDuration
    const progress = Math.min((actualElapsed / session.duration) * 100, 100)
    
    return Math.max(progress, 0)
  }

  calculateRemainingTime(session: PomodoroSession): { minutes: number; seconds: number } {
    if (!session.start_time) {
      return { minutes: session.duration, seconds: 0 }
    }
    
    const startTime = new Date(session.start_time)
    const now = new Date()
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) // seconds
    
    // Account for paused time
    let pausedDuration = 0
    if (session.paused_at) {
      const pausedTime = new Date(session.paused_at)
      pausedDuration = Math.floor((now.getTime() - pausedTime.getTime()) / 1000)
    }
    
    const actualElapsed = elapsed - pausedDuration
    const totalSeconds = session.duration * 60
    const remainingSeconds = Math.max(totalSeconds - actualElapsed, 0)
    
    const minutes = Math.floor(remainingSeconds / 60)
    const seconds = remainingSeconds % 60
    
    return { minutes, seconds }
  }

  isSessionActive(session: PomodoroSession): boolean {
    return session.status === 'in_progress' && !session.paused_at
  }

  isSessionPaused(session: PomodoroSession): boolean {
    return session.status === 'in_progress' && !!session.paused_at
  }

  isSessionCompleted(session: PomodoroSession): boolean {
    return session.status === 'completed'
  }

  getSessionTypeLabel(sessionType: string): string {
    switch (sessionType) {
      case 'work':
        return 'Work Session'
      case 'short_break':
        return 'Short Break'
      case 'long_break':
        return 'Long Break'
      default:
        return 'Session'
    }
  }

  getNextSessionType(currentType: string, completedWorkSessions: number, sessionsUntilLongBreak: number = 4): string {
    if (currentType === 'work') {
      // After a work session, determine break type
      if (completedWorkSessions % sessionsUntilLongBreak === 0) {
        return 'long_break'
      }
      return 'short_break'
    } else {
      // After any break, go back to work
      return 'work'
    }
  }

  getDefaultDuration(sessionType: string): number {
    switch (sessionType) {
      case 'work':
        return 25
      case 'short_break':
        return 5
      case 'long_break':
        return 15
      default:
        return 25
    }
  }
}

export const pomodoroService = new PomodoroService()
export default pomodoroService