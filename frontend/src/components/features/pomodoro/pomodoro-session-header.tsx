
interface PomodoroSessionHeaderProps {
  sessionLabel: string
  completedSessions: number
  className?: string
}

export function PomodoroSessionHeader({ 
  sessionLabel, 
  completedSessions, 
  className 
}: PomodoroSessionHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-2xl font-semibold mb-2">{sessionLabel}</h1>
      <p className="text-gray-400">Session {completedSessions + 1}</p>
    </div>
  )
}

export default PomodoroSessionHeader