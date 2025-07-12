import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/task";
import { TaskStatusBadges } from "./task-status-badges";
import { SubtaskCounter } from "./subtask-counter";
import { AddSubtaskButton } from "./add-subtask-button";
import { getRelativeDate, getDueDateClass, isOverdue } from "@/lib/utils/date";

interface TaskItemInfoProps {
  task: Task;
  isSelected?: boolean;
  isSubtasksExpanded?: boolean;
  onSubtasksToggle?: (e: React.MouseEvent) => void;
  onAddSubtask?: (title: string) => void;
  className?: string;
}

export function TaskItemInfo({
  task,
  isSelected,
  isSubtasksExpanded = false,
  onSubtasksToggle,
  onAddSubtask,
  className,
}: TaskItemInfoProps) {
  const isCompleted = task.status === "completed";
  const dueDateText = task.due_date ? getRelativeDate(task.due_date) : null;
  const dueDateClass = task.due_date ? getDueDateClass(task.due_date) : "";
  const taskIsOverdue = task.due_date ? isOverdue(task.due_date) : false;
  // Use backend metadata first, fallback to checking actual subtasks array
  const hasSubtasks =
    (task.has_subtasks ?? false) || (task.subtasks && task.subtasks.length > 0);

  return (
    <div className={`flex-1 min-w-0 ${className} px-1`}>
      {/* Task title */}
      <span className="flex items-center gap-2 mb-2">
        <h3
          className={`
          text-sm font-medium truncate flex-1
          ${
            isCompleted
              ? "line-through text-muted-foreground"
              : "text-foreground"
          }
          ${isSelected ? "text-primary" : ""}
        `}
        >
          {task.title}
        </h3>
      </span>

      {/* Task metadata */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Subtask counter - at the beginning */}
        {hasSubtasks && onSubtasksToggle && (
          <SubtaskCounter
            task={task}
            subtasks={task.subtasks}
            isExpanded={isSubtasksExpanded}
            onToggle={onSubtasksToggle}
          />
        )}

        {/* Priority and Status badges */}
        <div className="flex items-center gap-1">
          <TaskStatusBadges
            task={task}
            className="[&>*]:text-xs [&>*]:px-1.5 [&>*]:py-0.5"
          />
        </div>

        {/* Due date - unified overdue/due display */}
        {dueDateText && (
          <div className={`flex items-center gap-1 text-xs ${dueDateClass}`}>
            <Calendar className="w-3 h-3" />
            <span>
              {taskIsOverdue
                ? `Overdue: ${dueDateText}`
                : `Due: ${dueDateText}`}
            </span>
          </div>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs px-1.5 py-0.5"
                style={{ color: tag.color || undefined }}
              >
                {tag.name}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Add subtask button - always available when callback provided */}
        {onAddSubtask && <AddSubtaskButton onAddSubtask={onAddSubtask} />}
      </div>
    </div>
  );
}

export default TaskItemInfo;
