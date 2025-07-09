"use client"

import { useState } from "react"
import { usePomodoroTimer } from "@/lib/hooks/use-pomodoro-timer"
import { PomodoroSessionHeader } from "@/components/features/pomodoro/pomodoro-session-header"
import { PomodoroCircularTimer } from "@/components/features/pomodoro/pomodoro-circular-timer"
import { PomodoroControls } from "@/components/features/pomodoro/pomodoro-controls"
import { PomodoroSettingsPanel } from "@/components/features/pomodoro/pomodoro-settings-panel"

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export default function PomodoroPage() {
  const [showSettings, setShowSettings] = useState(false)
  
  const {
    settings,
    currentSession,
    completedSessions,
    timerState,
    progress,
    sessionLabel,
    formattedTime,
    setSettings,
    startTimer,
    pauseTimer,
    stopTimer,
    skipSession
  } = usePomodoroTimer()

  const handleToggleSettings = () => {
    setShowSettings(!showSettings)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <div className="flex flex-col items-center space-y-8">
        {/* Session Header */}
        <PomodoroSessionHeader
          sessionLabel={sessionLabel}
          completedSessions={completedSessions}
        />

        {/* Circular Timer */}
        <PomodoroCircularTimer
          formattedTime={formattedTime}
          progress={progress}
          timerState={timerState}
          currentSession={currentSession}
        />

        {/* Controls */}
        <PomodoroControls
          timerState={timerState}
          onStart={startTimer}
          onPause={pauseTimer}
          onStop={stopTimer}
          onSkip={skipSession}
          onToggleSettings={handleToggleSettings}
        />

        {/* Settings Panel */}
        {showSettings && (
          <PomodoroSettingsPanel
            settings={settings}
            onUpdateSettings={setSettings}
            onClose={handleCloseSettings}
          />
        )}
      </div>
    </div>
  )
}