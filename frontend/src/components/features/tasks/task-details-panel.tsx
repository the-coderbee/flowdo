"use client";

import { motion } from "framer-motion";
import { Task } from "@/types/task";
import { TaskDetailsPanelCollapsed } from "./task-details-panel-collapsed";
import { TaskDetailsPanelEmpty } from "./task-details-panel-empty";
import { TaskDetailsPanelHeader } from "./task-details-panel-header";
import { TaskDetailsPanelContent } from "./task-details-panel-content";

interface TaskDetailsPanelProps {
  task: Task | null;
  isCollapsed?: boolean;
  onCollapse?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

export function TaskDetailsPanel({
  task,
  isCollapsed = false,
  onCollapse,
  onEdit,
  onDelete,
}: TaskDetailsPanelProps) {
  // Collapsed state
  if (isCollapsed) {
    return <TaskDetailsPanelCollapsed onExpand={onCollapse} />;
  }

  // Empty state (no task selected)
  if (!task) {
    return <TaskDetailsPanelEmpty onCollapse={onCollapse} />;
  }

  // Task selected state
  return (
    <motion.div
      initial={{ width: 50 }}
      animate={{ width: 400 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex flex-col"
    >
      <TaskDetailsPanelHeader
        task={task}
        onCollapse={onCollapse}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <TaskDetailsPanelContent task={task} />
    </motion.div>
  );
}

export default TaskDetailsPanel;
