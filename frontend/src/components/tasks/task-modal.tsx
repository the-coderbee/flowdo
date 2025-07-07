"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Save, X, Plus, CalendarDays, Tag, Users, Clock, Target, Flag, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Task, UpdateTaskRequest } from "@/types/task"
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSave: (taskId: number, updates: UpdateTaskRequest) => Promise<void>
  onDelete?: (taskId: number) => Promise<void>
  onToggleComplete?: (taskId: number) => Promise<void>
}

const priorityOptions = [
  { value: 'low' as const, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800", icon: "🔹" },
  { value: 'medium' as const, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", icon: "🔸" },
  { value: 'high' as const, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800", icon: "🔥" },
  { value: 'urgent' as const, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: "🚨" }
]

const statusOptions = [
  { value: 'pending' as const, label: "Pending", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800", icon: "⏳" },
  { value: 'in_progress' as const, label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: "🔄" },
  { value: 'completed' as const, label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800", icon: "✅" },
  { value: 'archived' as const, label: "Archived", color: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400 border-slate-200 dark:border-slate-800", icon: "📁" },
  { value: 'cancelled' as const, label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: "❌" }
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

function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
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
  
  const isCompleted = task.status === 'completed'
  const currentPriority = priorityOptions.find(p => p.value === task.priority)
  const currentStatus = statusOptions.find(s => s.value === task.status)
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[95vw] sm:w-[85vw] lg:w-[75vw] max-w-none h-[95vh] sm:h-[90vh] max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 border-b border-border bg-card">
            {/* Accessible Dialog Title */}
            <DialogTitle className={`text-xl sm:text-2xl font-bold leading-tight ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
              {isEditing ? (formData.title || "Edit Task") : task.title}
            </DialogTitle>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                {/* Completion Toggle */}
                <button
                  onClick={handleToggleComplete}
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
                      value={formData.title || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
                    <Button onClick={handleSave} size="sm" className="h-9 px-4">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} className="h-9 px-4">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="h-9 px-4">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
            
            {/* Status Badges */}
            <div className="flex items-center gap-3 mt-4">
              <Badge className={`${currentPriority?.color} px-3 py-1 text-sm font-medium border`}>
                {currentPriority?.icon} {currentPriority?.label}
              </Badge>
              <Badge className={`${currentStatus?.color} px-3 py-1 text-sm font-medium border`}>
                {currentStatus?.icon} {currentStatus?.label}
              </Badge>
              {task.due_date && (
                <Badge variant="outline" className="px-3 py-1 text-sm">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  {formatDateShort(task.due_date)}
                </Badge>
              )}
            </div>
          </DialogHeader>
          
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-0">
              {/* Left Column - Main Content (65%) */}
              <div className="lg:col-span-3 overflow-y-auto lg:border-r border-border">
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  {/* Description */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Description</h3>
                    </div>
                    
                    {isEditing ? (
                      <div className="border border-border rounded-lg overflow-hidden bg-card">
                        <MDEditor
                          value={formData.description || ""}
                          onChange={(val) => setFormData(prev => ({ ...prev, description: val || "" }))}
                          preview="edit"
                          visibleDragbar={false}
                          height={400}
                        />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-6 min-h-[300px] border border-border">
                        {task.description ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {task.description}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-muted-foreground italic">No description provided</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Subtasks */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Subtasks</h3>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {task.subtasks?.filter(s => s.is_completed).length || 0}/{task.subtasks?.length || 0}
                      </Badge>
                    </div>
                    
                    {task.subtasks && task.subtasks.length > 0 ? (
                      <div className="space-y-3">
                        {task.subtasks.map((subtask) => (
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
                          onChange={(e) => setNewSubtask(e.target.value)}
                          placeholder="Add a new subtask..."
                          className="flex-1"
                        />
                        <Button size="sm" variant="outline" className="px-3">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Properties (35%) */}
              <div className="lg:col-span-2 overflow-y-auto border-t lg:border-t-0 border-border">
                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                  {/* Properties */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Properties</h3>
                    </div>
                    
                    {/* Priority */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Priority</label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                          {priorityOptions.map((option) => (
                            <Button
                              key={option.value}
                              variant={formData.priority === option.value ? "default" : "outline"}
                              size="sm"
                              className={`justify-start h-10 text-sm ${
                                formData.priority === option.value 
                                  ? `${option.color} border-2` 
                                  : 'border-border'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                            >
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className={`${currentPriority?.color} w-fit px-3 py-2 rounded-lg border text-sm font-medium`}>
                          {currentPriority?.icon} {currentPriority?.label}
                        </div>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      {isEditing ? (
                        <div className="space-y-2">
                          {statusOptions.map((option) => (
                            <Button
                              key={option.value}
                              variant={formData.status === option.value ? "default" : "outline"}
                              size="sm"
                              className={`justify-start w-full h-10 text-sm ${
                                formData.status === option.value 
                                  ? `${option.color} border-2` 
                                  : 'border-border'
                              }`}
                              onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                            >
                              <span className="mr-2">{option.icon}</span>
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className={`${currentStatus?.color} w-fit px-3 py-2 rounded-lg border text-sm font-medium`}>
                          {currentStatus?.icon} {currentStatus?.label}
                        </div>
                      )}
                    </div>
                    
                    {/* Due Date */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={formData.due_date || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                          className="w-full h-10"
                        />
                      ) : (
                        <div className="text-sm bg-muted/20 p-3 rounded-lg border border-border">
                          {task.due_date ? formatDate(task.due_date) : "No due date set"}
                        </div>
                      )}
                    </div>
                    
                    {/* Pomodoro Estimate */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-muted-foreground">Pomodoro Estimate</label>
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
                          placeholder="How many pomodoros?"
                          className="w-full h-10"
                        />
                      ) : (
                        <div className="bg-muted/20 p-4 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {task.completed_pomodoros || 0} / {task.estimated_pomodoros || 0} completed
                            </span>
                          </div>
                          {task.estimated_pomodoros > 0 && (
                            <div className="bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, (task.completed_pomodoros / task.estimated_pomodoros) * 100)}%` 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Tags */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">Tags</h3>
                    </div>
                    
                    {task.tags && task.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-1">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No tags assigned</p>
                    )}
                    
                    {isEditing && (
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add a tag..."
                          className="flex-1 h-9"
                        />
                        <Button size="sm" variant="outline" className="px-3">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
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
                  
                  {/* Timeline */}
                  <div className="space-y-3 pt-6 border-t border-border">
                    <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{formatDate(task.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span>{formatDate(task.updated_at)}</span>
                      </div>
                      {task.completed_at && (
                        <div className="flex justify-between">
                          <span>Completed:</span>
                          <span>{formatDate(task.completed_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
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