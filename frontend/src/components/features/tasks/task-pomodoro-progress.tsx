import { Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TaskPomodoroProgressProps {
  completedPomodoros: number
  estimatedPomodoros: number
  isEditing: boolean
  onEstimateChange: (estimate: number | undefined) => void
  className?: string
}

export function TaskPomodoroProgress({
  completedPomodoros,
  estimatedPomodoros,
  isEditing,
  onEstimateChange,
  className
}: TaskPomodoroProgressProps) {
  if (isEditing) {
    return (
      <Input
        type="number"
        min="1"
        max="20"
        value={estimatedPomodoros || ""}
        onChange={(e) => onEstimateChange(e.target.value ? parseInt(e.target.value) : undefined)}
        placeholder="How many pomodoros?"
        className={`w-full h-10 ${className}`}
      />
    )
  }

  return (
    <div className={`bg-muted/20 p-4 rounded-lg border border-border ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">
          {completedPomodoros || 0} / {estimatedPomodoros || 0} completed
        </span>
      </div>
      {estimatedPomodoros > 0 && (
        <div className="bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (completedPomodoros / estimatedPomodoros) * 100)}%` 
            }}
          />
        </div>
      )}
    </div>
  )
}

export default TaskPomodoroProgress