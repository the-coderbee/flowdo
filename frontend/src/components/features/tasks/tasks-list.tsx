import { forwardRef } from "react"
import { Task } from "@/types/task"
import { TaskItem } from "./task-item"

interface TasksListProps {
  tasks: Task[]
  selectedTaskId: number | null
  onToggleComplete: (taskId: number) => void
  onTaskClick: (task: Task) => void
  onToggleSubtask: (taskId: number, subtaskId: number) => void
  onUpdateSubtask: (taskId: number, subtaskId: number, title: string) => void
  onDeleteSubtask: (taskId: number, subtaskId: number) => void
  onContainerClick: (e: React.MouseEvent) => void
  className?: string
}

export const TasksList = forwardRef<HTMLDivElement, TasksListProps>(
  ({ 
    tasks, 
    selectedTaskId, 
    onToggleComplete, 
    onTaskClick, 
    onToggleSubtask, 
    onUpdateSubtask, 
    onDeleteSubtask, 
    onContainerClick, 
    className 
  }, ref) => {
    return (
      <div 
        ref={ref} 
        onClick={onContainerClick} 
        className={`space-y-1 ${className}`}
      >
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            index={index}
            isSelected={selectedTaskId === task.id}
            onToggleComplete={onToggleComplete}
            onClick={onTaskClick}
            onToggleSubtask={onToggleSubtask}
            onUpdateSubtask={onUpdateSubtask}
            onDeleteSubtask={onDeleteSubtask}
          />
        ))}
      </div>
    )
  }
)

TasksList.displayName = "TasksList"

export default TasksList