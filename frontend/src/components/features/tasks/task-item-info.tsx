import { Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/task"
import { TaskStatusBadges } from "./task-status-badges"
import { getRelativeDate, getDueDateClass } from "@/lib/utils/date"

interface TaskItemInfoProps {
  task: Task
  isSelected?: boolean
  className?: string
}

export function TaskItemInfo({ task, isSelected, className }: TaskItemInfoProps) {
  const isCompleted = task.status === 'completed'
  const dueDateText = task.due_date ? getRelativeDate(task.due_date) : null
  const dueDateClass = task.due_date ? getDueDateClass(task.due_date) : ''

  return (
    <div className={`flex-1 min-w-0 ${className}`}>
      {/* Task title */}
      <div className="flex items-center gap-2 mb-1">
        <h3 className={`
          text-sm font-medium truncate flex-1
          ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}
          ${isSelected ? 'text-primary' : ''}
        `}>
          {task.title}
        </h3>
      </div>

      {/* Task metadata */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority and Status badges */}
        <div className="flex items-center gap-1">
          <TaskStatusBadges task={task} className="[&>*]:text-xs [&>*]:px-1.5 [&>*]:py-0.5" />
        </div>

        {/* Due date */}
        {dueDateText && (
          <div className={`flex items-center gap-1 text-xs ${dueDateClass}`}>
            <Calendar className="w-3 h-3" />
            <span>{dueDateText}</span>
          </div>
        )}

        {/* Subtask count */}
        {task.subtasks && task.subtasks.length > 0 && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
            {task.subtasks.filter(s => s.is_completed).length}/{task.subtasks.length}
          </Badge>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="text-xs px-1.5 py-0.5"
                style={{ color: tag.color || undefined }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskItemInfo