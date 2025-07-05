"use client"

import { motion } from "framer-motion"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Task, TaskPriority } from "@/types/task"

interface TaskItemProps {
  task: Task
  index: number
  onToggleComplete: (taskId: number) => void
  onClick: (task: Task) => void
}

function getPriorityColor(priority: TaskPriority) {
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

function formatDueDate(dueDate: string | undefined): string {
  if (!dueDate) return ''
  
  const date = new Date(dueDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Remove time component for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today'
  } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString()
  }
}

export function TaskItem({ task, index, onToggleComplete, onClick }: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete(task.id)
  }
  
  const handleTaskClick = () => {
    onClick(task)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="pl-6 w-full" // Left padding and full width
    >
      <div 
        className={`
          w-full p-4 rounded-lg border border-border bg-card hover:bg-accent/50 
          transition-all duration-200 cursor-pointer group
          ${isCompleted ? 'opacity-60' : ''}
        `}
        onClick={handleTaskClick}
      >
        <div className="flex items-start gap-4">
          {/* Rounded Checkbox */}
          <div className="flex items-center pt-1">
            <button
              onClick={handleCheckboxClick}
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110
                ${isCompleted 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground hover:border-primary'
                }
              `}
            >
              {isCompleted && (
                <svg 
                  className="w-3 h-3" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Task Content - Full Width */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`
                  font-medium text-base leading-6
                  ${isCompleted 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground group-hover:text-primary'
                  }
                `}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                {/* Task Meta - Tags and Info */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority.toLowerCase()}
                  </Badge>
                  
                  {task.due_date && (
                    <span className="text-xs text-muted-foreground">
                      Due: {formatDueDate(task.due_date)}
                    </span>
                  )}
                  
                  {task.group_id && (
                    <span className="text-xs text-muted-foreground">
                      Group {task.group_id}
                    </span>
                  )}
                  
                  {task.estimated_pomodoros && (
                    <span className="text-xs text-muted-foreground">
                      🍅 {task.completed_pomodoros || 0}/{task.estimated_pomodoros}
                    </span>
                  )}
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 3).map((tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="outline" 
                          className="text-xs px-2 py-0"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {task.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle more actions
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}