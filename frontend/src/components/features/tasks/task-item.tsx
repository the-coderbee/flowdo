"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Task } from "@/types/task";
import { TaskItemCheckbox } from "./task-item-checkbox";
import { TaskItemInfo } from "./task-item-info";
import { TaskItemActions } from "./task-item-actions";
import { TaskItemSubtasks } from "./task-item-subtasks";
import {
  useSubtasks,
  useCreateSubtask,
  useUpdateSubtask,
  useDeleteSubtask,
  useToggleSubtask,
} from "@/lib/hooks/use-subtask-queries";

interface TaskItemProps {
  task: Task;
  index: number;
  isSelected?: boolean;
  onToggleComplete: (taskId: number) => void;
  onClick: (task: Task) => void;
  onStarTask: (taskId: number) => void;
}

export function TaskItem({
  task,
  index,
  isSelected = false,
  onToggleComplete,
  onClick,
  onStarTask,
}: TaskItemProps) {
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  // Query hooks - only fetch subtasks when expanded (on-demand loading)
  const { data: subtasks = [], isLoading: subtasksLoading } = useSubtasks(
    task.id,
    isSubtasksExpanded // Only fetch when expanded
  );

  // Mutation hooks
  const createSubtaskMutation = useCreateSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const toggleSubtaskMutation = useToggleSubtask();

  const handleClick = () => {
    onClick(task);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement edit functionality
    console.log("Edit task:", task.id);
  };

  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement more options
    console.log("More options for task:", task.id);
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStarTask(task.id);
  };

  const handleSubtasksToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubtasksExpanded(!isSubtasksExpanded);
  };

  const handleAddSubtask = (title: string) => {
    createSubtaskMutation.mutate({
      title,
      position: 0, // Backend expects this field
      task_id: task.id,
    });
  };

  const handleUpdateSubtask = (subtaskId: number, title: string) => {
    updateSubtaskMutation.mutate({
      subtaskId,
      updates: { title },
    });
  };

  const handleDeleteSubtask = (subtaskId: number) => {
    deleteSubtaskMutation.mutate(subtaskId);
  };

  const handleToggleSubtask = (subtaskId: number) => {
    const subtask = displaySubtasks.find((s) => s.id === subtaskId);
    if (subtask) {
      toggleSubtaskMutation.mutate({
        subtaskId,
        currentStatus: subtask.is_completed,
      });
    }
  };

  // Use live subtasks data if expanded and loaded, otherwise fall back to task.subtasks
  // When subtasks are expanded, we should use the live data even if it's empty
  const displaySubtasks = isSubtasksExpanded ? subtasks : task.subtasks || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: "easeOut" }}
      className="group"
    >
      <motion.div
        className={`
          p-4 border-s-2 cursor-pointer
          transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30
          ${
            isSelected
              ? "border-s-3 border-primary/80 shadow-lg shadow-primary/10"
              : ""
          }
          
        `}
        onClick={handleClick}
        data-task-item
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <TaskItemCheckbox task={task} onToggleComplete={onToggleComplete} />

          {/* Task Info */}
          <TaskItemInfo
            task={{ ...task, subtasks: displaySubtasks }}
            isSelected={isSelected}
            isSubtasksExpanded={isSubtasksExpanded}
            onSubtasksToggle={handleSubtasksToggle}
            onAddSubtask={handleAddSubtask}
          />

          {/* Actions */}
          <TaskItemActions
            onEdit={handleEdit}
            onMore={handleMore}
            onStar={handleStar}
            isStarred={task.starred}
          />
        </div>
        <TaskItemSubtasks
          task={{ ...task, subtasks: displaySubtasks }}
          isExpanded={isSubtasksExpanded}
          isLoading={subtasksLoading}
          onUpdateSubtask={handleUpdateSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onToggleSubtask={handleToggleSubtask}
        />
      </motion.div>

      {/* Subtasks */}
    </motion.div>
  );
}

export default TaskItem;
