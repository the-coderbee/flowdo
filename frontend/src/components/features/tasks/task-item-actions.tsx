import { Edit2, MoreVertical, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskItemActionsProps {
  onEdit?: () => void
  onMore?: () => void
  onStar?: () => void
  isStarred?: boolean
  className?: string
}

export function TaskItemActions({ onEdit, onMore, onStar, isStarred, className }: TaskItemActionsProps) {
  return (
    <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 ${className}`}>
      {onStar && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 hover:bg-accent hover:scale-110 transition-all duration-200 ${isStarred ? 'text-yellow-500' : 'text-muted-foreground'}`}
          onClick={onStar}
        >
          <Star className={`h-3 w-3 transition-all duration-200 ${isStarred ? 'fill-current scale-110' : ''}`} />
        </Button>
      )}
      
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent hover:scale-110 transition-all duration-200"
          onClick={onEdit}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
      
      {onMore && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-accent hover:scale-110 transition-all duration-200"
          onClick={onMore}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

export default TaskItemActions