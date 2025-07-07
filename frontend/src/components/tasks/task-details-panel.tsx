"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  Tag, 
  CheckSquare,
  Edit2,
  Trash2,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Task } from "@/types/task"

interface TaskDetailsPanelProps {
  task: Task | null
  isCollapsed?: boolean
  onCollapse?: () => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: number) => void
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatDueDate(dueDate: string | undefined): string {
  if (!dueDate) return ''
  
  const date = new Date(dueDate)
  
  // Handle invalid dates
  if (isNaN(date.getTime())) return ''
  
  const today = new Date()
  
  // Remove time component for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Calculate yesterday and tomorrow
  const yesterday = new Date(todayOnly)
  yesterday.setDate(yesterday.getDate() - 1)
  
  const tomorrow = new Date(todayOnly)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Check for yesterday, today, tomorrow (1 day gap)
  if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  } else if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today'
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  }
  
  // Check if it's in the same week
  const startOfWeek = new Date(todayOnly)
  const dayOfWeek = startOfWeek.getDay() // 0 = Sunday, 1 = Monday, etc.
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to Monday-based week
  startOfWeek.setDate(startOfWeek.getDate() - daysToMonday)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(endOfWeek.getDate() + 6) // Monday + 6 days = Sunday
  
  if (dateOnly >= startOfWeek && dateOnly <= endOfWeek) {
    // Return day name (e.g., "Monday", "Friday")
    return dateOnly.toLocaleDateString('en-US', { weekday: 'long' })
  }
  
  // Otherwise return date month format (e.g., "15 July", "3 December")
  return dateOnly.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long' 
  })
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    case 'high':
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
    case 'medium':
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
    case 'low':
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
    case 'in_progress':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
    case 'pending':
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    case 'archived':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
    case 'cancelled':
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  }
}

export function TaskDetailsPanel({ task, isCollapsed = false, onCollapse, onEdit, onDelete }: TaskDetailsPanelProps) {

  if (isCollapsed) {
    return (
      <div className="h-full bg-background border-l border-border flex flex-col">
        <div className="p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="h-full bg-background border-l border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">Task Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckSquare className="w-8 h-8 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <h3 className="text-lg font-semibold mb-2">Ready to dive into productive state?</h3>
              <p className="text-muted-foreground">
                Select a task from the list to view its details and start working on it.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0

  return (
    <div className="h-full bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold leading-tight mb-2">{task.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)} variant="secondary">
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(task)}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(task.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Description */}
        {task.description && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Description</h4>
            <p className="text-sm leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Due Date</p>
              <p className="text-sm text-muted-foreground">{formatDueDate(task.due_date)}</p>
            </div>
          </div>
        )}

        {/* Subtasks */}
        {hasSubtasks && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Subtasks</p>
                <p className="text-sm text-muted-foreground">{completedSubtasks} of {totalSubtasks} completed</p>
              </div>
            </div>
            
            <div className="space-y-2 ml-7">
              {task.subtasks?.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded border flex-shrink-0 ${subtask.is_completed ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                  <span className={`text-sm ${subtask.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-start gap-3">
            <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(task.created_at)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Last Updated</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(task.updated_at)}</p>
            </div>
          </div>

          {task.completed_at && (
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(task.completed_at)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}