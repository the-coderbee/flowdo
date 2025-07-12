import { ChevronRight, Edit2, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/task";
import { TaskStatusBadges } from "./task-status-badges";

interface TaskDetailsPanelHeaderProps {
  task: Task;
  onCollapse?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
  className?: string;
}

export function TaskDetailsPanelHeader({
  task,
  onCollapse,
  onEdit,
  onDelete,
  className,
}: TaskDetailsPanelHeaderProps) {
  const handleEdit = () => {
    onEdit?.(task);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task Details</h2>
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
          {onCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapse}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Task title */}
      <div>
        <h3
          className={`text-xl font-semibold ${
            task.status === "completed"
              ? "line-through text-muted-foreground"
              : ""
          }`}
        >
          {task.title}
        </h3>
      </div>

      {/* Status badges */}
      <TaskStatusBadges task={task} />
    </div>
  );
}

export default TaskDetailsPanelHeader;
