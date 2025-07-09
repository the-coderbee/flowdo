import { GripVertical, Edit2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskItemActionsProps {
  onEdit?: () => void
  onMore?: () => void
  className?: string
}

export function TaskItemActions({ onEdit, onMore, className }: TaskItemActionsProps) {
  return (
    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-accent cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </Button>
      
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
      
      {onMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent"
          onClick={onMore}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default TaskItemActions