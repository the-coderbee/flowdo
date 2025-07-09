import { Calendar } from "lucide-react"
import { getRelativeDate, getDueDateClass } from "@/lib/utils/date"

interface TaskDueDateDisplayProps {
  dueDate?: string
  className?: string
}

export function TaskDueDateDisplay({ dueDate, className }: TaskDueDateDisplayProps) {
  if (!dueDate) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Calendar className="w-4 h-4" />
        <span>No due date</span>
      </div>
    )
  }

  const relativeDateText = getRelativeDate(dueDate)
  const dateClass = getDueDateClass(dueDate)

  return (
    <div className={`flex items-center gap-2 text-sm ${dateClass} ${className}`}>
      <Calendar className="w-4 h-4" />
      <span>{relativeDateText}</span>
    </div>
  )
}

export default TaskDueDateDisplay