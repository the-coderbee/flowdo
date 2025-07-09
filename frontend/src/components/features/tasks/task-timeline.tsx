import { Task } from "@/types/task"
import { formatDisplayDateTime } from "@/lib/utils/date"

interface TaskTimelineProps {
  task: Task
  className?: string
}

export function TaskTimeline({ task, className }: TaskTimelineProps) {
  return (
    <div className={`space-y-3 pt-6 border-t border-border ${className}`}>
      <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
      <div className="text-xs text-muted-foreground space-y-2">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDisplayDateTime(task.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Updated:</span>
          <span>{formatDisplayDateTime(task.updated_at)}</span>
        </div>
        {task.completed_at && (
          <div className="flex justify-between">
            <span>Completed:</span>
            <span>{formatDisplayDateTime(task.completed_at)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskTimeline