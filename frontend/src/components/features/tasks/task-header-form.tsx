import { CheckCircle, Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Task } from "@/types/task"
import { TaskStatusBadges } from "./task-status-badges"

interface TaskHeaderFormProps {
  task: Task
  isEditing: boolean
  isCompleted: boolean
  title: string
  onTitleChange: (title: string) => void
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onToggleComplete: () => void
}

export function TaskHeaderForm({
  task,
  isEditing,
  isCompleted,
  title,
  onTitleChange,
  onEdit,
  onSave,
  onCancel,
  onToggleComplete
}: TaskHeaderFormProps) {
  return (
    <DialogHeader className="flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 border-b border-border bg-card">
      <DialogTitle className={`text-xl sm:text-2xl font-bold leading-tight ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
        {isEditing ? (title || "Edit Task") : task.title}
      </DialogTitle>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Completion Toggle */}
          <button
            onClick={onToggleComplete}
            className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0
              transition-all duration-200 hover:scale-105
              ${isCompleted 
                ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                : 'border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950'
              }
            `}
          >
            {isCompleted && (
              <CheckCircle className="w-5 h-5" />
            )}
          </button>
          
          {/* Title Input for Editing */}
          <div className="flex-1 min-w-0">
            {isEditing && (
              <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="text-xl sm:text-2xl font-bold h-auto px-0 py-1 border-none shadow-none bg-transparent focus:ring-0 focus:border-none"
                placeholder="Task title..."
                autoFocus
              />
            )}
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <Button onClick={onSave} size="sm" className="h-9 px-4">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={onCancel} className="h-9 px-4">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={onEdit} className="h-9 px-4">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
      
      {/* Status Badges */}
      <TaskStatusBadges task={task} className="mt-4" />
    </DialogHeader>
  )
}

export default TaskHeaderForm