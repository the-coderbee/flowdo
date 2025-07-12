"use client"

import { useState, useEffect } from "react"
import { Maximize } from "lucide-react"
import { usePomodoroTimer } from "@/lib/hooks/use-pomodoro-timer"
import { usePomodoroSession } from "@/lib/hooks/use-pomodoro-queries"
import { usePomodoroNotifications } from "@/lib/hooks/use-notifications"
import { PomodoroSessionHeader } from "@/components/features/pomodoro/pomodoro-session-header"
import { PomodoroCircularTimer } from "@/components/features/pomodoro/pomodoro-circular-timer"
import { PomodoroControls } from "@/components/features/pomodoro/pomodoro-controls"
import { PomodoroSettingsPanel } from "@/components/features/pomodoro/pomodoro-settings-panel"
import { TaskSelector } from "@/components/features/pomodoro/task-selector"
import { FocusMode } from "@/components/features/pomodoro/focus-mode"

interface Task {
  id: number
  title: string
  description?: string
  estimated_pomodoros?: number
  completed_pomodoros?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export default function PomodoroPage() {
  const [showSettings, setShowSettings] = useState(false)
  const [showTaskSelector, setShowTaskSelector] = useState(false)
  const [showFocusMode, setShowFocusMode] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>({
    id: 1,
    title: "Complete project design mockups",
    description: "Create wireframes and high-fidelity mockups for the new feature",
    estimated_pomodoros: 6,
    completed_pomodoros: 2,
    priority: 'high'
  })
  
  // Use new hooks for better integration
  const {
    activeSession,
    isActive,
    isPaused,
    progress,
    formattedTime,
    startSession,
    toggleSession,
    cancelSession,
    completeSession,
  } = usePomodoroSession()

  const {
    requestPermission,
    handleSessionStart,
    handleSessionComplete,
    settings: notificationSettings,
    testNotification,
  } = usePomodoroNotifications()

  // Legacy timer hook for settings (can be replaced later)
  const {
    settings,
    currentSession,
    completedSessions,
    sessionLabel,
    setSettings,
  } = usePomodoroTimer()

  // Request notification permissions on mount
  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  // Handle session events
  useEffect(() => {
    if (activeSession && isActive) {
      handleSessionStart(activeSession.session_type, selectedTask?.title)
    }
  }, [activeSession, isActive, selectedTask?.title, handleSessionStart])

  const handleToggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleTaskSelect = (task: Task | null) => {
    setSelectedTask(task)
    setShowTaskSelector(false)
  }

  const handleOpenTaskSelector = () => {
    setShowTaskSelector(true)
  }

  const handleOpenFocusMode = () => {
    setShowFocusMode(true)
  }

  const handleCloseFocusMode = () => {
    setShowFocusMode(false)
  }

  const handleStartNewSession = async () => {
    try {
      await startSession({
        session_type: 'work',
        duration: settings.workDuration,
        task_id: selectedTask?.id
      })
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(119,198,255,0.05),transparent_50%)]" />
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        <div className="flex flex-col items-center space-y-8 max-w-4xl w-full">
          {/* Session Header */}
          <PomodoroSessionHeader
            sessionLabel={activeSession ? `${activeSession.session_type.replace('_', ' ').toUpperCase()} SESSION` : sessionLabel}
            completedSessions={completedSessions}
            currentTaskTitle={selectedTask?.title}
            onTaskSelectorOpen={handleOpenTaskSelector}
          />

          {/* Circular Timer */}
          <PomodoroCircularTimer
            formattedTime={formattedTime}
            progress={progress}
            timerState={isActive ? 'running' : isPaused ? 'paused' : 'idle'}
            currentSession={activeSession?.session_type as any || currentSession}
          />

          {/* Controls */}
          <PomodoroControls
            timerState={isActive ? 'running' : isPaused ? 'paused' : 'idle'}
            onStart={activeSession ? toggleSession : handleStartNewSession}
            onPause={toggleSession}
            onStop={cancelSession}
            onSkip={completeSession}
            onToggleSettings={handleToggleSettings}
          />

          {/* Focus Mode Button */}
          {activeSession && (
            <button
              onClick={handleOpenFocusMode}
              className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <Maximize className="w-5 h-5" />
              <span>Enter Focus Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <PomodoroSettingsPanel
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={handleCloseSettings}
        />
      )}

      {/* Task Selector */}
      {showTaskSelector && (
        <TaskSelector
          selectedTask={selectedTask}
          onTaskSelect={handleTaskSelect}
          onClose={() => setShowTaskSelector(false)}
        />
      )}

      {/* Focus Mode */}
      <FocusMode
        isOpen={showFocusMode}
        onClose={handleCloseFocusMode}
        currentTaskTitle={selectedTask?.title}
        sessionType={activeSession?.session_type}
      />
    </div>
  )
}