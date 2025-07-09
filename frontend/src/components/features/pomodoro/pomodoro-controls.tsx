import { Play, Pause, Square, SkipForward, Settings } from 'lucide-react'
import { TimerState } from '@/lib/hooks/use-pomodoro-timer'

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
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Play/Pause button */}
      {timerState === 'idle' || timerState === 'paused' ? (
        <button
          onClick={onStart}
          className="flex items-center justify-center w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          aria-label="Start timer"
        >
          <Play className="w-8 h-8 ml-1" />
        </button>
      ) : (
        <button
          onClick={onPause}
          className="flex items-center justify-center w-16 h-16 bg-yellow-600 hover:bg-yellow-700 rounded-full transition-colors"
          aria-label="Pause timer"
        >
          <Pause className="w-8 h-8" />
        </button>
      )}
      
      {/* Stop button */}
      <button
        onClick={onStop}
        className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
        aria-label="Stop timer"
      >
        <Square className="w-6 h-6" />
      </button>
      
      {/* Skip button */}
      <button
        onClick={onSkip}
        className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Skip session"
      >
        <SkipForward className="w-6 h-6" />
      </button>
      
      {/* Settings button */}
      <button
        onClick={onToggleSettings}
        className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 rounded-full transition-colors"
        aria-label="Open settings"
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  )
}

export default PomodoroControls