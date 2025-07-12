import { SessionType, TimerState } from '@/lib/hooks/use-pomodoro-timer'
import { useEffect, useState } from 'react'
import { useTimerTheme } from '@/lib/hooks/use-theme-settings'

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
  const [pulseKey, setPulseKey] = useState(0)
  const { getSessionTheme } = useTimerTheme()

  useEffect(() => {
    if (timerState === 'completed') {
      setPulseKey(prev => prev + 1)
    }
  }, [timerState])

  const getStatusText = () => {
    switch (timerState) {
      case 'running':
        return 'Focus Time'
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Session Complete!'
      default:
        return 'Ready to Start'
    }
  }

  const getSessionTitle = () => {
    switch (currentSession) {
      case 'work':
        return 'Work Session'
      case 'short_break':
        return 'Short Break'
      case 'long_break':
        return 'Long Break'
      default:
        return 'Pomodoro Timer'
    }
  }

  // Get theme colors based on current session
  const sessionType = currentSession === 'work' ? 'work' : 
                     currentSession === 'short_break' ? 'short_break' : 'long_break'
  const theme = getSessionTheme(sessionType)
  
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference * (1 - progress / 100)

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Session Title */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-white/90 mb-1">
          {getSessionTitle()}
        </h2>
        <p className="text-sm text-white/60 font-medium tracking-wide">
          {getStatusText()}
        </p>
      </div>

      {/* Timer Container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-1000"
          style={{
            boxShadow: timerState === 'running' 
              ? `0 0 80px ${theme.glow}, 0 0 120px ${theme.glow}` 
              : `0 0 40px ${theme.glow}`
          }}
        />
        
        {/* Background gradient */}
        <div 
          className="absolute inset-0 rounded-full transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${theme.background} 0%, transparent 70%)`
          }}
        />

        {/* SVG Timer */}
        <div className="relative">
          <svg 
            className="w-80 h-80 md:w-96 md:h-96 -rotate-90 drop-shadow-2xl" 
            viewBox="0 0 200 200"
          >
            <defs>
              {/* Progress gradient */}
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.gradient.start} />
                <stop offset="50%" stopColor={theme.gradient.mid} />
                <stop offset="100%" stopColor={theme.gradient.end} />
              </linearGradient>
              
              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Pulse animation */}
              <animate 
                id="pulseAnimation"
                attributeName="stroke-width"
                values="6;8;6"
                dur="2s"
                repeatCount="3"
                begin={`pulse${pulseKey}.begin`}
              />
            </defs>

            {/* Background track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
            
            {/* Subtle inner track */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />

            {/* Progress circle */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              filter="url(#glow)"
              className={`transition-all duration-1000 ${
                timerState === 'running' ? 'ease-linear' : 'ease-out'
              }`}
              style={{
                transformOrigin: 'center'
              }}
            >
              {timerState === 'completed' && (
                <animate
                  id={`pulse${pulseKey}`}
                  attributeName="stroke-width"
                  values="6;10;6"
                  dur="0.6s"
                  repeatCount="3"
                />
              )}
            </circle>

            {/* Minute markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = (i * 30) * Math.PI / 180
              const x1 = 100 + 82 * Math.cos(angle)
              const y1 = 100 + 82 * Math.sin(angle)
              const x2 = 100 + 78 * Math.cos(angle)
              const y2 = 100 + 78 * Math.sin(angle)
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )
            })}

            {/* Five-minute markers */}
            {Array.from({ length: 60 }, (_, i) => {
              if (i % 5 !== 0) return null
              const angle = (i * 6) * Math.PI / 180
              const x1 = 100 + 85 * Math.cos(angle)
              const y1 = 100 + 85 * Math.sin(angle)
              const x2 = 100 + 75 * Math.cos(angle)
              const y2 = 100 + 75 * Math.sin(angle)
              
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* Time display overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-5xl md:text-6xl font-mono font-bold text-white mb-1 transition-all duration-300 ${
              timerState === 'completed' ? 'animate-pulse' : ''
            }`}>
              {formattedTime}
            </div>
            <div className="text-xs md:text-sm text-white/50 font-medium uppercase tracking-widest">
              {Math.round(progress)}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Progress indicator dots */}
      <div className="mt-6 flex space-x-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < progress / 25 
                ? 'bg-white/80 scale-110' 
                : 'bg-white/20 scale-90'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default PomodoroCircularTimer