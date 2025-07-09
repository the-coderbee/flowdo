import { useState, useEffect, useRef, useCallback } from 'react'

export interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

export type TimerState = 'idle' | 'running' | 'paused' | 'completed'
export type SessionType = 'work' | 'short_break' | 'long_break'

interface UsePomodoroTimerProps {
  initialSettings?: PomodoroSettings
}

export function usePomodoroTimer({ initialSettings }: UsePomodoroTimerProps = {}) {
  const [settings, setSettings] = useState<PomodoroSettings>(
    initialSettings || {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4
    }
  )
  
  const [currentSession, setCurrentSession] = useState<SessionType>('work')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const getCurrentDuration = useCallback(() => {
    switch (currentSession) {
      case 'work':
        return settings.workDuration * 60
      case 'short_break':
        return settings.shortBreakDuration * 60
      case 'long_break':
        return settings.longBreakDuration * 60
      default:
        return settings.workDuration * 60
    }
  }, [currentSession, settings])

  const [timeLeft, setTimeLeft] = useState(getCurrentDuration())

  const getProgress = useCallback(() => {
    const totalDuration = getCurrentDuration()
    return ((totalDuration - timeLeft) / totalDuration) * 100
  }, [getCurrentDuration, timeLeft])

  const completeSession = useCallback(() => {
    setTimerState('completed')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    if (currentSession === 'work') {
      const newCompletedSessions = completedSessions + 1
      setCompletedSessions(newCompletedSessions)
      
      if (newCompletedSessions % settings.sessionsUntilLongBreak === 0) {
        setCurrentSession('long_break')
      } else {
        setCurrentSession('short_break')
      }
    } else {
      setCurrentSession('work')
    }
    
    setTimeout(() => {
      setTimerState('idle')
      setTimeLeft(getCurrentDuration())
    }, 2000)
  }, [currentSession, completedSessions, settings.sessionsUntilLongBreak, getCurrentDuration])

  const startTimer = useCallback(() => {
    setTimerState('running')
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          completeSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [completeSession])

  const pauseTimer = useCallback(() => {
    setTimerState('paused')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const stopTimer = useCallback(() => {
    setTimerState('idle')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimeLeft(getCurrentDuration())
  }, [getCurrentDuration])

  const skipSession = useCallback(() => {
    completeSession()
  }, [completeSession])

  const getSessionLabel = useCallback(() => {
    switch (currentSession) {
      case 'work':
        return 'Focus Time'
      case 'short_break':
        return 'Short Break'
      case 'long_break':
        return 'Long Break'
      default:
        return 'Focus Time'
    }
  }, [currentSession])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Update timeLeft when session or settings change
  useEffect(() => {
    if (timerState === 'idle') {
      setTimeLeft(getCurrentDuration())
    }
  }, [currentSession, settings, timerState, getCurrentDuration])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    // State
    settings,
    currentSession,
    completedSessions,
    timeLeft,
    timerState,
    
    // Computed values
    progress: getProgress(),
    sessionLabel: getSessionLabel(),
    formattedTime: formatTime(timeLeft),
    
    // Actions
    setSettings,
    startTimer,
    pauseTimer,
    stopTimer,
    skipSession,
    
    // Utilities
    formatTime,
    getCurrentDuration
  }
}