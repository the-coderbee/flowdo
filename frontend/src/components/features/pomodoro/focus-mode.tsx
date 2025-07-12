"use client"

import { useState, useEffect, useCallback } from 'react'
import { X, Maximize, Minimize, Settings, Volume2, VolumeX } from 'lucide-react'
import { PomodoroCircularTimer } from './pomodoro-circular-timer'
import { PomodoroControls } from './pomodoro-controls'
import { usePomodoroSession } from '@/lib/hooks/use-pomodoro-queries'
import { usePomodoroNotifications } from '@/lib/hooks/use-notifications'

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  currentTaskTitle?: string
  sessionType?: string
  className?: string
}

export function FocusMode({ 
  isOpen, 
  onClose, 
  currentTaskTitle,
  sessionType = 'work',
  className 
}: FocusModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [mouseTimeout, setMouseTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const {
    activeSession,
    isActive,
    isPaused,
    progress,
    formattedTime,
    toggleSession,
    completeSession,
    cancelSession,
  } = usePomodoroSession()

  const {
    settings: notificationSettings,
    updateSettings,
    testNotification,
    handleTimeWarning,
    handleSessionComplete,
  } = usePomodoroNotifications()

  // Handle fullscreen API
  const enterFullscreen = useCallback(async () => {
    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    } catch (error) {
      console.error('Failed to exit fullscreen:', error)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // Auto-hide controls after mouse inactivity
  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    
    if (mouseTimeout) {
      clearTimeout(mouseTimeout)
    }
    
    const timeout = setTimeout(() => {
      if (isFullscreen) {
        setShowControls(false)
      }
    }, 3000) // Hide after 3 seconds of inactivity
    
    setMouseTimeout(timeout)
  }, [mouseTimeout, isFullscreen])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
      
      if (!isCurrentlyFullscreen) {
        setShowControls(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen()
          } else {
            onClose()
          }
          break
        case 'F11':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            toggleFullscreen()
          }
          break
        case 'h':
        case 'H':
          setShowControls(!showControls)
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, isFullscreen, showControls, toggleFullscreen, exitFullscreen, onClose])

  // Session completion handling
  useEffect(() => {
    if (activeSession && progress >= 100) {
      handleSessionComplete(activeSession.session_type, currentTaskTitle)
      completeSession()
    }
  }, [activeSession, progress, currentTaskTitle, handleSessionComplete, completeSession])

  // Time warnings
  useEffect(() => {
    if (activeSession && isActive) {
      const remainingMinutes = Math.ceil((100 - progress) * activeSession.duration / 100)
      handleTimeWarning(remainingMinutes)
    }
  }, [activeSession, isActive, progress, handleTimeWarning])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mouseTimeout) {
        clearTimeout(mouseTimeout)
      }
      if (isFullscreen) {
        exitFullscreen()
      }
    }
  }, [mouseTimeout, isFullscreen, exitFullscreen])

  if (!isOpen) return null

  const getBackgroundStyle = () => {
    if (!activeSession) return 'from-gray-900 via-black to-gray-900'
    
    switch (activeSession.session_type) {
      case 'work':
        return 'from-red-900/20 via-black to-orange-900/20'
      case 'short_break':
        return 'from-green-900/20 via-black to-emerald-900/20'
      case 'long_break':
        return 'from-purple-900/20 via-black to-violet-900/20'
      default:
        return 'from-gray-900 via-black to-gray-900'
    }
  }

  const getSessionMessage = () => {
    if (!activeSession) return null
    
    const messages = {
      work: currentTaskTitle ? `Focus on: ${currentTaskTitle}` : 'Time to focus and be productive',
      short_break: 'Take a short break and recharge',
      long_break: 'Enjoy your well-deserved long break'
    }
    
    return messages[activeSession.session_type as keyof typeof messages] || 'Stay focused'
  }

  return (
    <div 
      className={`fixed inset-0 z-50 bg-gradient-to-br ${getBackgroundStyle()} text-white overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.05),transparent_50%)]" />
      </div>

      {/* Top Controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={() => updateSettings({ sound: !notificationSettings.sound })}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Toggle Sound"
            >
              {notificationSettings.sound ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="text-center">
            <h1 className="text-xl font-semibold text-white/90">
              Focus Mode
            </h1>
            {activeSession && (
              <p className="text-sm text-white/60 mt-1">
                {getSessionMessage()}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Exit Focus Mode (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Timer Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="flex flex-col items-center space-y-8 max-w-2xl w-full">
          {/* Large Timer Display */}
          {activeSession && (
            <div className="relative">
              <PomodoroCircularTimer
                formattedTime={formattedTime}
                progress={progress}
                timerState={isActive ? 'running' : isPaused ? 'paused' : 'idle'}
                currentSession={activeSession.session_type as any}
                className="scale-125 md:scale-150"
              />
            </div>
          )}

          {/* Session Info */}
          {activeSession && (
            <div className="text-center space-y-2">
              <h2 className="text-4xl md:text-6xl font-mono font-bold text-white">
                {formattedTime}
              </h2>
              <p className="text-lg md:text-xl text-white/80">
                {Math.round(progress)}% Complete
              </p>
              {currentTaskTitle && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <p className="text-sm text-white/60 uppercase tracking-wider mb-1">
                    Working On
                  </p>
                  <h3 className="text-lg font-semibold text-white/90">
                    {currentTaskTitle}
                  </h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-all duration-300 ${
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        <div className="flex justify-center p-8">
          {activeSession && (
            <PomodoroControls
              timerState={isActive ? 'running' : isPaused ? 'paused' : 'idle'}
              onStart={toggleSession}
              onPause={toggleSession}
              onStop={cancelSession}
              onSkip={completeSession}
              onToggleSettings={() => {}} // Disable settings in focus mode
            />
          )}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className={`absolute bottom-4 right-4 text-xs text-white/40 transition-all duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="space-y-1">
          <div>ESC: Exit • F11: Fullscreen</div>
          <div>H: Hide Controls • Space: Play/Pause</div>
        </div>
      </div>

      {/* Progress Bar (Optional) */}
      {activeSession && isFullscreen && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

export default FocusMode