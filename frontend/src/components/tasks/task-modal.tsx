"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Save, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Task, TaskPriority, TaskStatus, UpdateTaskRequest } from "@/types/task"

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, updates: UpdateTaskRequest) => void
  onDelete?: (taskId: number) => void
  onToggleComplete?: (taskId: number) => void
}

const priorityOptions = [
  { value: TaskPriority.LOW, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  { value: TaskPriority.MEDIUM, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  { value: TaskPriority.HIGH, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: TaskPriority.URGENT, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
]

const statusOptions = [
  { value: TaskStatus.PENDING, label: "Pending" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.COMPLETED, label: "Completed" },
  { value: TaskStatus.ARCHIVED, label: "Archived" },
  { value: TaskStatus.CANCELLED, label: "Cancelled" }
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TaskModal({ task, isOpen, onClose, onSave, onDelete, onToggleComplete }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateTaskRequest>({})
  
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? task.due_date.split('T')[0] : "",
        estimated_pomodoros: task.estimated_pomodoros
      })
    }
  }, [task])
  
  if (!task) return null
  
  const handleSave = () => {
    onSave(task.id, formData)
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ? task.due_date.split('T')[0] : "",
      estimated_pomodoros: task.estimated_pomodoros
    })
    setIsEditing(false)
  }
  
  const handleToggleComplete = () => {
    onToggleComplete?.(task.id)
  }
  
  const isCompleted = task.status === TaskStatus.COMPLETED
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Checkbox */}
                <button
                  onClick={handleToggleComplete}
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1
                    transition-all duration-200 hover:scale-110 flex-shrink-0
                    ${isCompleted 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground hover:border-primary'
                    }
                  `}
                >
                  {isCompleted && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
                
                {/* Title */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      value={formData.title || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-xl font-semibold h-auto p-0 border-none shadow-none bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <DialogTitle className={`text-xl font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </DialogTitle>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              {isEditing ? (
                <Textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                  className="min-h-[100px] resize-none"
                />
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {task.description || "No description"}
                </p>
              )}
            </div>
            
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Priority */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
                {isEditing ? (
                  <div className="flex gap-2 flex-wrap">
                    {priorityOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={formData.priority === option.value ? "default" : "outline"}
                        className={`
                          cursor-pointer transition-all
                          ${formData.priority === option.value ? option.color : ''}
                        `}
                        onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge className={priorityOptions.find(p => p.value === task.priority)?.color}>
                    {task.priority.toLowerCase()}
                  </Badge>
                )}
              </div>
              
              {/* Status */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                {isEditing ? (
                  <div className="flex gap-2 flex-wrap">
                    {statusOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={formData.status === option.value ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="outline">
                    {task.status.replace('_', ' ').toLowerCase()}
                  </Badge>
                )}
              </div>
              
              {/* Due Date */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Due Date</h3>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm">
                    {task.due_date ? formatDate(task.due_date) : "No due date"}
                  </p>
                )}
              </div>
              
              {/* Estimated Pomodoros */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Pomodoro Estimate</h3>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.estimated_pomodoros || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimated_pomodoros: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    placeholder="Enter estimate"
                  />
                ) : (
                  <p className="text-sm">
                    🍅 {task.completed_pomodoros || 0}/{task.estimated_pomodoros || 0}
                  </p>
                )}
              </div>
            </div>
            
            {/* Group & Tags */}
            {(task.group || (task.tags && task.tags.length > 0)) && (
              <div className="space-y-4">
                {task.group && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Group</h3>
                    <Badge variant="outline" className="text-sm">
                      {task.group.name}
                    </Badge>
                  </div>
                )}
                
                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                    <div className="flex gap-2 flex-wrap">
                      {task.tags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Subtasks</h3>
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.is_completed}
                        readOnly
                        className="w-4 h-4 rounded"
                      />
                      <span className={`text-sm ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Metadata */}
            <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
              <p>Created: {formatDate(task.created_at)}</p>
              <p>Updated: {formatDate(task.updated_at)}</p>
              {task.completed_at && (
                <p>Completed: {formatDate(task.completed_at)}</p>
              )}
            </div>
          </div>
          
          {/* Footer */}
          {!isEditing && onDelete && (
            <div className="flex-shrink-0 p-6 pt-0">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => onDelete(task.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}