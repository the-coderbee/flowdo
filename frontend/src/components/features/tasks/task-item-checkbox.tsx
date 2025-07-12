import { CheckSquare } from "lucide-react";
import { Task } from "@/types/task";

interface TaskItemCheckboxProps {
  task: Task;
  onToggleComplete: (taskId: number) => void;
  className?: string;
}

export function TaskItemCheckbox({
  task,
  onToggleComplete,
  className,
}: TaskItemCheckboxProps) {
  const isCompleted = task.status === "completed";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        w-5 h-5 rounded-sm border-2 flex items-center justify-center flex-shrink-0
        transition-all duration-200
        ${
          isCompleted
            ? "bg-green-500 border-green-500 text-white shadow-sm"
            : "border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
        }
        ${className}
      `}
      aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
    >
      {isCompleted && <CheckSquare className="w-3 h-3" />}
    </button>
  );
}

export default TaskItemCheckbox;
