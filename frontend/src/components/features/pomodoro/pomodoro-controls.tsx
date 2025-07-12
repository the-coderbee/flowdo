import { Play, Pause, Square, SkipForward, Settings, Volume2, VolumeX } from 'lucide-react'
import { TimerState } from '@/lib/hooks/use-pomodoro-timer'
import { useEffect, useState } from 'react'

interface PomodoroControlsProps {
  timerState: TimerState
  onStart: () => void
  onPause: () => void
  onStop: () => void
  onSkip: () => void
  onToggleSettings: () => void
  className?: string
}

export function PomodoroControls({
  timerState,
  onStart,
  onPause,
  onStop,
  onSkip,
  onToggleSettings,
  className
}: PomodoroControlsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (timerState === 'idle' || timerState === 'paused') {
            onStart()
          } else if (timerState === 'running') {
            onPause()
          }
          break
        case 'Escape':
          e.preventDefault()
          onStop()
          break
        case 's':
        case 'S':
          e.preventDefault()
          onSkip()
          break
        case 't':
        case 'T':
          e.preventDefault()
          onToggleSettings()
          break
        case 'm':
        case 'M':
          e.preventDefault()
          setSoundEnabled(!soundEnabled)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timerState, onStart, onPause, onStop, onSkip, onToggleSettings, soundEnabled])

  const getMainButtonStyle = () => {
    if (timerState === 'idle' || timerState === 'paused') {
      return 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-green-500/30'
    } else {
      return 'bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 shadow-yellow-500/30'
    }
  }

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Main Control Button */}
      <div className="relative">
        {timerState === 'idle' || timerState === 'paused' ? (
          <button
            onClick={onStart}
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl ${getMainButtonStyle()}`}
            aria-label="Start timer (Space/Enter)"
          >
            <Play className="w-10 h-10 text-white ml-1 drop-shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        ) : (
          <button
            onClick={onPause}
            className={`group relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl ${getMainButtonStyle()}`}
            aria-label="Pause timer (Space/Enter)"
          >
            <Pause className="w-10 h-10 text-white drop-shadow-lg" />
            <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        )}
        
        {/* Pulsing ring for running state */}
        {timerState === 'running' && (
          <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
        )}
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center space-x-6">
        {/* Stop button */}
        <button
          onClick={onStop}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/30"
          aria-label="Stop timer (Esc)"
        >
          <Square className="w-6 h-6 text-white drop-shadow-lg" />
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
        
        {/* Skip button */}
        <button
          onClick={onSkip}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
          aria-label="Skip session (S)"
        >
          <SkipForward className="w-6 h-6 text-white drop-shadow-lg" />
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
        
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
          aria-label={soundEnabled ? "Mute sounds (M)" : "Enable sounds (M)"}
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 text-white drop-shadow-lg" />
          ) : (
            <VolumeX className="w-6 h-6 text-white drop-shadow-lg" />
          )}
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
        
        {/* Settings button */}
        <button
          onClick={onToggleSettings}
          className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-500/30"
          aria-label="Open settings (T)"
        >
          <Settings className="w-6 h-6 text-white drop-shadow-lg group-hover:rotate-90 transition-transform duration-300" />
          <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-white/40 text-center space-y-1 mt-4">
        <div className="flex items-center justify-center space-x-4">
          <span>Space: Play/Pause</span>
          <span>•</span>
          <span>Esc: Stop</span>
          <span>•</span>
          <span>S: Skip</span>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <span>M: Mute</span>
          <span>•</span>
          <span>T: Settings</span>
        </div>
      </div>
    </div>
  )
}

export default PomodoroControls