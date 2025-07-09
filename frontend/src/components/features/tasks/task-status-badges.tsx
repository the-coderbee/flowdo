import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/task"
import { priorityOptions } from "./priority-selector"
import { statusOptions } from "./status-selector"
import { formatDisplayDate } from "@/lib/utils/date"

interface TaskStatusBadgesProps {
  task: Task
  className?: string
}

export function TaskStatusBadges({ task, className }: TaskStatusBadgesProps) {
  const currentPriority = priorityOptions.find(p => p.value === task.priority)
  const currentStatus = statusOptions.find(s => s.value === task.status)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Badge className={`${currentPriority?.color} px-3 py-1 text-sm font-medium border`}>
        {currentPriority?.icon} {currentPriority?.label}
      </Badge>
      <Badge className={`${currentStatus?.color} px-3 py-1 text-sm font-medium border`}>
        {currentStatus?.icon} {currentStatus?.label}
      </Badge>
      {task.due_date && (
        <Badge variant="outline" className="px-3 py-1 text-sm">
          <CalendarDays className="w-4 h-4 mr-2" />
          {formatDisplayDate(task.due_date)}
        </Badge>
      )}
    </div>
  )
}

export default TaskStatusBadges