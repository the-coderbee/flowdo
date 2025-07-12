import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/types/task";
import { SubtaskItem } from "./subtask-item";

interface TaskItemSubtasksProps {
  task: Task;
  isExpanded: boolean;
  isLoading?: boolean;
  onUpdateSubtask?: (subtaskId: number, title: string) => void;
  onDeleteSubtask?: (subtaskId: number) => void;
  onToggleSubtask?: (subtaskId: number) => void;
  className?: string;
}

export function TaskItemSubtasks({
  task,
  isExpanded,
  isLoading = false,
  onUpdateSubtask,
  onDeleteSubtask,
  onToggleSubtask,
  className,
}: TaskItemSubtasksProps) {
  // Show the subtasks section if expanded, even if no subtasks loaded yet (for loading state)
  // Or if task has subtasks metadata indicating subtasks exist
  const shouldShow =
    (task.has_subtasks ?? false) || (task.subtasks && task.subtasks.length > 0);

  if (!shouldShow) {
    return null;
  }

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.04, 0.62, 0.23, 0.98],
            opacity: { duration: 0.2 },
          }}
          className={`overflow-hidden ${className}`}
        >
          <motion.div
            className="bg-transparent p-4 pt-2 space-y-2"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="flex items-center gap-3 py-2 px-3 rounded-md"
                  >
                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                    <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              task.subtasks.map((subtask, index) => (
                <motion.div
                  key={subtask.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                >
                  <SubtaskItem
                    subtask={subtask}
                    onToggleComplete={
                      onToggleSubtask
                        ? () => onToggleSubtask(subtask.id)
                        : undefined
                    }
                    onUpdate={
                      onUpdateSubtask
                        ? (subtaskId, title) =>
                            onUpdateSubtask(subtaskId, title)
                        : undefined
                    }
                    onDelete={
                      onDeleteSubtask
                        ? () => onDeleteSubtask(subtask.id)
                        : undefined
                    }
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TaskItemSubtasks;
