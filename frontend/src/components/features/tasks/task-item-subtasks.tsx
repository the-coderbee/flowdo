import { motion, AnimatePresence } from "framer-motion"
import { Task } from "@/types/task"
import { SubtaskItem } from "./subtask-item"

interface TaskItemSubtasksProps {
  task: Task
  isExpanded: boolean
  onUpdateSubtask?: (taskId: number, subtaskId: number, title: string) => void
  onDeleteSubtask?: (taskId: number, subtaskId: number) => void
  onToggleSubtask?: (taskId: number, subtaskId: number) => void
  className?: string
}

export function TaskItemSubtasks({ 
  task, 
  isExpanded, 
  onUpdateSubtask, 
  onDeleteSubtask, 
  onToggleSubtask,
  className 
}: TaskItemSubtasksProps) {
  if (!task.subtasks || task.subtasks.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={`overflow-hidden ${className}`}
        >
          <div className="pl-7 pt-2 space-y-1">
            {task.subtasks.map((subtask) => (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                onToggle={onToggleSubtask ? () => onToggleSubtask(task.id, subtask.id) : undefined}
                onUpdate={onUpdateSubtask ? (title) => onUpdateSubtask(task.id, subtask.id, title) : undefined}
                onDelete={onDeleteSubtask ? () => onDeleteSubtask(task.id, subtask.id) : undefined}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default TaskItemSubtasks