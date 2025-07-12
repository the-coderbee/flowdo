
import { Clock, Target, Trophy, Plus } from 'lucide-react'

interface PomodoroSessionHeaderProps {
  sessionLabel: string
  completedSessions: number
  totalSessions?: number
  currentTaskTitle?: string
  onTaskSelectorOpen?: () => void
  className?: string
}

export function PomodoroSessionHeader({ 
  sessionLabel, 
  completedSessions, 
  totalSessions = 8,
  currentTaskTitle,
  onTaskSelectorOpen,
  className 
}: PomodoroSessionHeaderProps) {
  const progressPercentage = (completedSessions / totalSessions) * 100

  return (
    <div className={`text-center space-y-4 ${className}`}>
      {/* Current Task */}
      <div className="mb-6">
        {currentTaskTitle ? (
          <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 relative group">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60 font-medium uppercase tracking-wider">
                Working On
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white/90 truncate max-w-md mx-auto mb-2">
              {currentTaskTitle}
            </h3>
            {onTaskSelectorOpen && (
              <button
                onClick={onTaskSelectorOpen}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
              >
                Change Task
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 border-dashed">
            <div className="flex flex-col items-center space-y-2">
              <Plus className="w-6 h-6 text-white/40" />
              <span className="text-sm text-white/60">No task selected</span>
              {onTaskSelectorOpen && (
                <button
                  onClick={onTaskSelectorOpen}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Select a Task
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Session Progress */}
      <div className="space-y-3">
        {/* Session Counter */}
        <div className="flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-white/60" />
            <span className="text-2xl font-bold text-white">
              Session {completedSessions + 1}
            </span>
          </div>
          <span className="text-white/40 text-lg">of</span>
          <span className="text-lg text-white/60">{totalSessions}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/50">Progress</span>
            <span className="text-xs text-white/50">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>
          </div>
        </div>

        {/* Session Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-4">
          {Array.from({ length: totalSessions }, (_, i) => (
            <div
              key={i}
              className={`transition-all duration-300 ${
                i < completedSessions
                  ? 'w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg shadow-green-500/50'
                  : i === completedSessions
                  ? 'w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg shadow-blue-500/50 animate-pulse'
                  : 'w-2 h-2 bg-white/20 hover:bg-white/30'
              } rounded-full`}
            />
          ))}
        </div>

        {/* Achievement Badge */}
        {completedSessions > 0 && (
          <div className="flex items-center justify-center space-x-2 mt-4 opacity-80">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/70">
              {completedSessions} session{completedSessions !== 1 ? 's' : ''} completed today
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PomodoroSessionHeader