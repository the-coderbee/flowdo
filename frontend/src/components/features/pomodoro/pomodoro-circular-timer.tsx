import { SessionType, TimerState } from '@/lib/hooks/use-pomodoro-timer'

interface PomodoroCircularTimerProps {
  formattedTime: string
  progress: number
  timerState: TimerState
  currentSession: SessionType
  className?: string
}

export function PomodoroCircularTimer({
  formattedTime,
  progress,
  timerState,
  currentSession,
  className
}: PomodoroCircularTimerProps) {
  const getStatusText = () => {
    switch (timerState) {
      case 'running':
        return 'Running'
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Completed!'
      default:
        return 'Ready'
    }
  }

  const getGradientColors = () => {
    switch (currentSession) {
      case 'work':
        return { start: '#3b82f6', end: '#1d4ed8' }
      case 'short_break':
        return { start: '#10b981', end: '#059669' }
      case 'long_break':
        return { start: '#8b5cf6', end: '#7c3aed' }
      default:
        return { start: '#3b82f6', end: '#1d4ed8' }
    }
  }

  const colors = getGradientColors()

  return (
    <div className={`relative ${className}`}>
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
          strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
          className="transition-all duration-1000 ease-linear"
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
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
          {formattedTime}
        </div>
        <div className="text-sm text-gray-400">
          {getStatusText()}
        </div>
      </div>
    </div>
  )
}

export default PomodoroCircularTimer