"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Task, UpdateTaskRequest } from "@/types/task"
import { TaskHeaderForm } from "./task-header-form"
import { TaskDescriptionEditor } from "./task-description-editor"
import { TaskSubtasksManager } from "./task-subtasks-manager"
import { TaskPropertiesForm } from "./task-properties-form"
import { TaskTagsManager } from "./task-tags-manager"
import { TaskTimeline } from "./task-timeline"

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, updates: UpdateTaskRequest) => Promise<void>
  onDelete?: (taskId: number) => Promise<void>
  onToggleComplete?: (taskId: number) => Promise<void>
}

export function TaskModal({ task, isOpen, onClose, onSave, onDelete, onToggleComplete }: TaskModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<UpdateTaskRequest>({})
  const [newSubtask, setNewSubtask] = useState("")
  const [newTag, setNewTag] = useState("")
  
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
  
  const handleSave = async () => {
    await onSave(task.id, formData)
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
  
  const handleToggleComplete = async () => {
    await onToggleComplete?.(task.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isEditing) {
        handleCancel()
      } else {
        onClose()
      }
    }
    if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      if (isEditing) {
        handleSave()
      }
    }
  }

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      // TODO: Implement subtask addition
      setNewSubtask("")
    }
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      // TODO: Implement tag addition
      setNewTag("")
    }
  }
  
  const isCompleted = task.status === 'completed'
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] sm:w-[85vw] lg:w-[75vw] max-w-none h-[95vh] sm:h-[90vh] max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <TaskHeaderForm
            task={task}
            isEditing={isEditing}
            isCompleted={isCompleted}
            title={formData.title || ""}
            onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
            onEdit={() => setIsEditing(true)}
            onSave={handleSave}
            onCancel={handleCancel}
            onToggleComplete={handleToggleComplete}
          />
          
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-0">
              {/* Left Column - Main Content (65%) */}
              <div className="lg:col-span-3 overflow-y-auto lg:border-r border-border">
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  <TaskDescriptionEditor
                    description={formData.description}
                    isEditing={isEditing}
                    onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
                  />
                  
                  <TaskSubtasksManager
                    subtasks={task.subtasks}
                    isEditing={isEditing}
                    newSubtask={newSubtask}
                    onNewSubtaskChange={setNewSubtask}
                    onAddSubtask={handleAddSubtask}
                  />
                </div>
              </div>
              
              {/* Right Column - Properties (35%) */}
              <div className="lg:col-span-2 overflow-y-auto border-t lg:border-t-0 border-border">
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  <TaskPropertiesForm
                    task={task}
                    isEditing={isEditing}
                    priority={formData.priority || task.priority}
                    status={formData.status || task.status}
                    dueDate={formData.due_date || ""}
                    estimatedPomodoros={formData.estimated_pomodoros}
                    onPriorityChange={(priority) => setFormData(prev => ({ ...prev, priority }))}
                    onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
                    onDueDateChange={(due_date) => setFormData(prev => ({ ...prev, due_date }))}
                    onEstimatedPomodorosChange={(estimated_pomodoros) => setFormData(prev => ({ ...prev, estimated_pomodoros }))}
                  />
                  
                  <TaskTagsManager
                    tags={task.tags}
                    isEditing={isEditing}
                    newTag={newTag}
                    onNewTagChange={setNewTag}
                    onAddTag={handleAddTag}
                  />
                  
                  <TaskTimeline task={task} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex-shrink-0 px-4 sm:px-8 py-4 border-t border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {isEditing ? "Press Ctrl+S to save • Esc to cancel" : "Press E to edit"}
              </div>
              
              {!isEditing && onDelete && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => onDelete(task.id)}
                  className="h-9 px-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}