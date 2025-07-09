import { Plus, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Subtask } from "@/types/task"

interface TaskSubtasksManagerProps {
  subtasks?: Subtask[]
  isEditing: boolean
  newSubtask: string
  onNewSubtaskChange: (value: string) => void
  onAddSubtask: () => void
  className?: string
}

export function TaskSubtasksManager({
  subtasks,
  isEditing,
  newSubtask,
  onNewSubtaskChange,
  onAddSubtask,
  className
}: TaskSubtasksManagerProps) {
  const completedCount = subtasks?.filter(s => s.is_completed).length || 0
  const totalCount = subtasks?.length || 0

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Subtasks</h3>
        <Badge variant="secondary" className="ml-2 text-xs">
          {completedCount}/{totalCount}
        </Badge>
      </div>
      
      {subtasks && subtasks.length > 0 ? (
        <div className="space-y-3">
          {subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border">
              <input
                type="checkbox"
                checked={subtask.is_completed}
                readOnly
                className="w-4 h-4 rounded border-border"
              />
              <span className={`flex-1 ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm bg-muted/20 p-6 rounded-lg border border-border text-center">
          No subtasks yet. Add some to break down this task!
        </div>
      )}
      
      {isEditing && (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => onNewSubtaskChange(e.target.value)}
            placeholder="Add a new subtask..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newSubtask.trim()) {
                onAddSubtask()
              }
            }}
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3"
            onClick={onAddSubtask}
            disabled={!newSubtask.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default TaskSubtasksManager