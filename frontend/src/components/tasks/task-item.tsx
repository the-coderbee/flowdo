"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GripVertical, Edit2, Calendar, MoreVertical, CheckSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/types/task"
import { SubtaskItem } from "./subtask-item"

interface TaskItemProps {
  task: Task
  index: number
  isSelected?: boolean
  onToggleComplete: (taskId: number) => void
  onClick: (task: Task) => void
  onUpdateSubtask?: (taskId: number, subtaskId: number, title: string) => void
  onDeleteSubtask?: (taskId: number, subtaskId: number) => void
  onToggleSubtask?: (taskId: number, subtaskId: number) => void
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

export function TaskItem({ task, index, isSelected = false, onToggleComplete, onClick, onUpdateSubtask, onDeleteSubtask, onToggleSubtask }: TaskItemProps) {
  const isCompleted = task.status === 'completed'
  const [isExpanded, setIsExpanded] = useState(false)
  
  const hasSubtasks = task.subtasks && task.subtasks.length > 0
  const completedSubtasks = task.subtasks?.filter(s => s.is_completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete(task.id)
  }
  
  const handleTaskClick = () => {
    onClick(task)
  }
  
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasSubtasks) {
      setIsExpanded(!isExpanded)
    }
  }
  
  const handleSubtaskToggle = (subtaskId: number) => {
    onToggleSubtask?.(task.id, subtaskId)
  }
  
  const handleSubtaskUpdate = (subtaskId: number, title: string) => {
    onUpdateSubtask?.(task.id, subtaskId, title)
  }
  
  const handleSubtaskDelete = (subtaskId: number) => {
    onDeleteSubtask?.(task.id, subtaskId)
  }
  
  return (
    <div className="w-full">
      <motion.div 
        initial={false}
        animate={{
          backgroundColor: isSelected ? 'hsl(var(--primary) / 0.05)' : 'transparent',
          borderLeftColor: isSelected ? 'hsl(var(--primary))' : 'transparent',
          opacity: isCompleted ? 0.6 : 1
        }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={`
          w-full p-4 border-b cursor-pointer group
          border-l-4 ${isSelected ? 'shadow-sm' : ''}
        `}
        onClick={handleTaskClick}
      >
        {/* Main Task Row */}
        <div className="flex items-start gap-4">
          {/* Grip Vertical Icon */}
          <div className="flex items-center pt-1">
            <button
              onClick={handleExpandClick}
              className={`
                text-muted-foreground/60 hover:text-muted-foreground 
                transition-all duration-200 cursor-grab
                ${hasSubtasks ? 'hover:scale-110' : 'cursor-default'}
              `}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <GripVertical className="w-6 h-6" />
              </motion.div>
            </button>
          </div>
          {/* Checkbox */}
          <div className="flex items-center pt-1.5">
            <button
              onClick={handleCheckboxClick}
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110 cursor-pointer
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

          {/* Task Content */}
          <div className="flex-1 min-w-0 ml-1 pt-0.5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                {/* Task Title */}
                <h3 className={`
                  font-base text-lg leading-6
                  ${isCompleted 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                  }
                `}>
                  {task.title}
                </h3>
                
                {/* Task Description */}
                {task.description && (
                  <p className="text-base text-muted-foreground mt-1 line-clamp-1 truncate">
                    {task.description}
                  </p>
                )}
                
                {/* Task Meta Row */}
                <div className="flex items-center gap-3 mt-2 flex-wrap px-3 py-1">
                  {/* Subtasks Count */}
                  {hasSubtasks && (
                    <button
                      onClick={handleExpandClick}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>{completedSubtasks}/{totalSubtasks}</span>
                    </button>
                  )}
                  
                  {/* Due Date */}
                  {task.due_date && (
                    <div className="flex gap-2 text-sm text-muted-foreground/70 items-center">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDueDate(task.due_date)}</span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex gap-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge 
                          key={tag.id} 
                          variant="outline" 
                          className="text-sm px-2 py-0 h-5"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{task.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-6 opacity-0 group-hover:opacity-60 transition-opacity">
                <Button 
                  variant="text" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle edit action
                  }}
                >
                  <Edit2 className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="text" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle calendar action
                  }}
                >
                  <Calendar className="h-6 w-6" />
                </Button>
                
                <Button 
                  variant="text" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle more actions
                  }}
                >
                  <MoreVertical className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expandable Subtasks */}
        <AnimatePresence>
          {isExpanded && hasSubtasks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3"
            >
              {task.subtasks?.map((subtask) => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  onToggleComplete={handleSubtaskToggle}
                  onUpdate={handleSubtaskUpdate}
                  onDelete={handleSubtaskDelete}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}