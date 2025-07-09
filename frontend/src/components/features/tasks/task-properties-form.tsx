import { Flag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TaskPriority, TaskStatus, Task } from "@/types/task"
import { PrioritySelector } from "./priority-selector"
import { StatusSelector } from "./status-selector"
import { TaskPomodoroProgress } from "./task-pomodoro-progress"
import { formatDisplayDateTime } from "@/lib/utils/date"

interface TaskPropertiesFormProps {
  task: Task
  isEditing: boolean
  priority: TaskPriority
  status: TaskStatus
  dueDate: string
  estimatedPomodoros: number | undefined
  onPriorityChange: (priority: TaskPriority) => void
  onStatusChange: (status: TaskStatus) => void
  onDueDateChange: (date: string) => void
  onEstimatedPomodorosChange: (estimate: number | undefined) => void
  className?: string
}

export function TaskPropertiesForm({
  task,
  isEditing,
  priority,
  status,
  dueDate,
  estimatedPomodoros,
  onPriorityChange,
  onStatusChange,
  onDueDateChange,
  onEstimatedPomodorosChange,
  className
}: TaskPropertiesFormProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Flag className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Properties</h3>
      </div>
      
      {/* Priority */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Priority</label>
        <PrioritySelector
          value={priority}
          onChange={onPriorityChange}
          readonly={!isEditing}
        />
      </div>
      
      {/* Status */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Status</label>
        <StatusSelector
          value={status}
          onChange={onStatusChange}
          readonly={!isEditing}
        />
      </div>
      
      {/* Due Date */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Due Date</label>
        {isEditing ? (
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => onDueDateChange(e.target.value)}
            className="w-full h-10"
          />
        ) : (
          <div className="text-sm bg-muted/20 p-3 rounded-lg border border-border">
            {task.due_date ? formatDisplayDateTime(task.due_date) : "No due date set"}
          </div>
        )}
      </div>
      
      {/* Pomodoro Estimate */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Pomodoro Estimate</label>
        <TaskPomodoroProgress
          completedPomodoros={task.completed_pomodoros}
          estimatedPomodoros={estimatedPomodoros || task.estimated_pomodoros}
          isEditing={isEditing}
          onEstimateChange={onEstimatedPomodorosChange}
        />
      </div>
      
      {/* Group */}
      {task.group_id && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground">Group</label>
          <Badge variant="outline" className="w-fit px-3 py-1">
            Group {task.group_id}
          </Badge>
        </div>
      )}
    </div>
  )
}

export default TaskPropertiesForm