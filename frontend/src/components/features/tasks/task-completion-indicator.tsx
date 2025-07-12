"use client"

import { motion } from "framer-motion"
import { Task } from "@/types/task"
import { SubtaskService } from "@/lib/api/subtask-service"

interface TaskCompletionIndicatorProps {
  task: Task
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TaskCompletionIndicator({ 
  task, 
  showPercentage = false, 
  size = 'sm',
  className = "" 
}: TaskCompletionIndicatorProps) {
  const subtasks = task.subtasks || []
  const hasSubtasks = subtasks.length > 0
  
  if (!hasSubtasks) {
    // Show task completion status if no subtasks
    const isCompleted = task.status === 'completed'
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className={`
          rounded-full border-2 transition-all duration-200
          ${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}
          ${isCompleted 
            ? 'bg-green-500 border-green-500' 
            : 'border-muted-foreground/40'
          }
        `}>
          {isCompleted && (
            <motion.svg 
              className={`w-full h-full text-white`}
              fill="currentColor" 
              viewBox="0 0 20 20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, ease: "backOut" }}
            >
              <path 
                fillRule="evenodd" 
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                clipRule="evenodd" 
              />
            </motion.svg>
          )}
        </div>
        {showPercentage && (
          <span className="text-xs text-muted-foreground">
            {isCompleted ? '100%' : '0%'}
          </span>
        )}
      </div>
    )
  }

  // Calculate subtask completion
  const stats = SubtaskService.calculateSubtaskStats(subtasks)
  const { completion_percentage, completed, total } = stats
  
  const circumference = 2 * Math.PI * 6 // radius of 6
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (completion_percentage / 100) * circumference
  
  const getColorClass = (percentage: number) => {
    if (percentage === 100) return 'text-green-500'
    if (percentage >= 75) return 'text-blue-500'
    if (percentage >= 50) return 'text-yellow-500'
    if (percentage >= 25) return 'text-orange-500'
    return 'text-red-500'
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-10 h-10'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Circular progress */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        <svg 
          className={`${sizeClasses[size]} transform -rotate-90`} 
          viewBox="0 0 16 16"
        >
          {/* Background circle */}
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={`transition-colors duration-200 ${getColorClass(completion_percentage)}`}
            strokeDasharray={strokeDasharray}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </svg>
        
        {/* Center text for larger sizes */}
        {size !== 'sm' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-medium ${getColorClass(completion_percentage)}`}>
              {Math.round(completion_percentage)}%
            </span>
          </div>
        )}
      </div>
      
      {/* Progress text */}
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {completed}/{total} completed
        </span>
        {showPercentage && size === 'sm' && (
          <span className={`text-xs font-medium ${getColorClass(completion_percentage)}`}>
            {Math.round(completion_percentage)}%
          </span>
        )}
      </div>
    </div>
  )
}

export default TaskCompletionIndicator