"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, Square, SkipForward, Settings } from "lucide-react"

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
}

type TimerState = 'idle' | 'running' | 'paused' | 'completed'
type SessionType = 'work' | 'short_break' | 'long_break'

export default function PomodoroPage() {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  })
  
  const [currentSession, setCurrentSession] = useState<SessionType>('work')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [timerState, setTimerState] = useState<TimerState>('idle')
  const [showSettings, setShowSettings] = useState(false)
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalDuration = getCurrentDuration()
    return ((totalDuration - timeLeft) / totalDuration) * 100
  }

  const startTimer = () => {
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
  }

  const pauseTimer = () => {
    setTimerState('paused')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  const stopTimer = () => {
    setTimerState('idle')
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setTimeLeft(getCurrentDuration())
  }

  const skipSession = () => {
    completeSession()
  }

  const completeSession = () => {
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
  }

  useEffect(() => {
    if (timerState === 'idle') {
      setTimeLeft(getCurrentDuration())
    }
  }, [currentSession, settings, timerState, getCurrentDuration])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const getSessionLabel = () => {
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
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Session Type */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">{getSessionLabel()}</h1>
          <p className="text-gray-400">Session {completedSessions + 1}</p>
        </div>

        {/* Circular Timer */}
        <div className="relative">
          <svg className="w-96 h-96 -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            
            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - getProgress() / 100)}`}
              className="transition-all duration-1000 ease-linear"
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentSession === 'work' ? '#3b82f6' : currentSession === 'short_break' ? '#10b981' : '#8b5cf6'} />
                <stop offset="100%" stopColor={currentSession === 'work' ? '#1d4ed8' : currentSession === 'short_break' ? '#059669' : '#7c3aed'} />
              </linearGradient>
            </defs>
            
            {/* Tick marks */}
            {Array.from({ length: 60 }, (_, i) => {
              const angle = (i * 6) * Math.PI / 180
              const x1 = 100 + 85 * Math.cos(angle)
              const y1 = 100 + 85 * Math.sin(angle)
              const x2 = 100 + (i % 5 === 0 ? 75 : 80) * Math.cos(angle)
              const y2 = 100 + (i % 5 === 0 ? 75 : 80) * Math.sin(angle)
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={i % 5 === 0 ? "2" : "1"}
                />
              )
            })}
          </svg>
          
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-mono font-bold mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400">
              {timerState === 'running' ? 'Running' : 
               timerState === 'paused' ? 'Paused' :
               timerState === 'completed' ? 'Completed!' : 'Ready'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {timerState === 'idle' || timerState === 'paused' ? (
            <button
              onClick={startTimer}
              className="flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center justify-center w-16 h-16 bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors"
            >
              <Pause className="w-8 h-8" />
            </button>
          )}
          
          <button
            onClick={stopTimer}
            className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <Square className="w-6 h-6" />
          </button>
          
          <button
            onClick={skipSession}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Work Duration (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings({...settings, workDuration: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakDuration}
                  onChange={(e) => setSettings({...settings, shortBreakDuration: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings({...settings, longBreakDuration: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Sessions until Long Break</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({...settings, sessionsUntilLongBreak: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}