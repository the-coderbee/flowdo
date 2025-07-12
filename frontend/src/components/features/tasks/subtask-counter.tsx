"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Subtask, Task } from "@/types/task";

interface SubtaskCounterProps {
  task: Task;
  subtasks?: Subtask[];
  isExpanded: boolean;
  onToggle: (e: React.MouseEvent) => void;
  className?: string;
}

export function SubtaskCounter({
  task,
  subtasks,
  isExpanded,
  onToggle,
  className,
}: SubtaskCounterProps) {
  // Use actual subtasks data if loaded (non-empty array), otherwise use backend metadata
  const hasLoadedSubtasks = subtasks && subtasks.length > 0;
  const completedCount = hasLoadedSubtasks
    ? subtasks.filter((subtask) => subtask.is_completed).length
    : task.completed_subtask_count ?? 0;
  const totalCount = hasLoadedSubtasks
    ? subtasks.length
    : task.subtask_count ?? 0;
  const completionPercentage = hasLoadedSubtasks
    ? totalCount > 0
      ? (completedCount / totalCount) * 100
      : 0
    : task.subtask_completion_percentage ?? 0;

  return (
    <Button
      variant="text"
      size="sm"
      className={`h-6 py-1 gap-1 transition-all duration-200 cursor-pointer ${className}`}
      onClick={onToggle}
    >
      {/* Expansion Icon */}
      <motion.div
        animate={{ rotate: isExpanded ? 0 : -90 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex items-center -ml-4"
      >
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </motion.div>

      {/* Progress Ring */}
      <div className="relative flex items-center justify-center">
        <svg className="w-4 h-4 transform -rotate-90" viewBox="0 0 16 16">
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
            className={`transition-colors duration-200 ${
              completionPercentage === 100
                ? "text-green-500"
                : completionPercentage > 50
                ? "text-blue-500"
                : "text-yellow-500"
            }`}
            pathLength="100"
            initial={{ strokeDasharray: "0 100" }}
            animate={{
              strokeDasharray: `${completionPercentage} 100`,
              scale: completionPercentage === 100 ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              scale: { duration: 0.3 },
            }}
          />
        </svg>
      </div>

      {/* Count Badge */}
      <Badge
        variant="secondary"
        className={`text-xs px-1.5 py-0.5 font-medium transition-all duration-200 ${
          completionPercentage === 100
            ? "bg-green-100 text-green-700 border-green-200"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {completedCount}/{totalCount}
      </Badge>
    </Button>
  );
}

export default SubtaskCounter;
