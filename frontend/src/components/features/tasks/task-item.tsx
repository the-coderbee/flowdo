"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Task } from "@/types/task"
import { TaskItemCheckbox } from "./task-item-checkbox"
import { TaskItemInfo } from "./task-item-info"
import { TaskItemActions } from "./task-item-actions"
import { TaskItemSubtasks } from "./task-item-subtasks"

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

export function TaskItem({
  task,
  index,
  isSelected = false,
  onToggleComplete,
  onClick,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask
}: TaskItemProps) {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false)

  const handleClick = () => {
    onClick(task)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement edit functionality
    console.log('Edit task:', task.id)
  }

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation()
    // TODO: Implement more options
    console.log('More options for task:', task.id)
  }

  const handleSubtasksToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsSubtasksExpanded(!isSubtasksExpanded)
  }

  const hasSubtasks = task.subtasks && task.subtasks.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="group"
    >
      <div
        className={`
          p-4 bg-card border border-border rounded-lg cursor-pointer
          transition-all duration-200 hover:shadow-md hover:border-border/80
          ${isSelected ? 'ring-2 ring-primary border-primary/20 bg-primary/5' : ''}
        `}
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <TaskItemCheckbox
            task={task}
            onToggleComplete={onToggleComplete}
          />

          {/* Task Info */}
          <TaskItemInfo
            task={task}
            isSelected={isSelected}
          />

          {/* Actions */}
          <TaskItemActions
            onEdit={handleEdit}
            onMore={handleMore}
          />
        </div>

        {/* Subtasks toggle */}
        {hasSubtasks && (
          <div className="mt-2 pl-8">
            <button
              onClick={handleSubtasksToggle}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSubtasksExpanded ? 'Hide' : 'Show'} subtasks ({task.subtasks?.length})
            </button>
          </div>
        )}
      </div>

      {/* Subtasks */}
      <TaskItemSubtasks
        task={task}
        isExpanded={isSubtasksExpanded}
        onUpdateSubtask={onUpdateSubtask}
        onDeleteSubtask={onDeleteSubtask}
        onToggleSubtask={onToggleSubtask}
      />
    </motion.div>
  )
}

export default TaskItem