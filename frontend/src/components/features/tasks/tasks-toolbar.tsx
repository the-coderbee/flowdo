import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCreationDialog } from "./task-creation-dialog";

interface TasksToolbarProps {
  onAddTask?: () => void;
  onFilter?: () => void;
  className?: string;
}

export function TasksToolbar({
  onAddTask,
  onFilter,
  className,
}: TasksToolbarProps) {
  return (
    <div className={`flex items-center gap-4 py-6 mb-2 ${className}`}>
      <div className="hidden sm:flex">
        <TaskCreationDialog onTaskCreated={onAddTask} />
      </div>
      <Button
        variant="outline"
        size="lg"
        className="hidden sm:flex cursor-pointer hover:text-foreground"
        onClick={onFilter}
      >
        <Filter className="h-4 w-4 mr-1" />
        Filter
      </Button>
      {/* Mobile: Icon only buttons */}
      {/* TODO: Add mobile search and filter buttons */}
    </div>
  );
}

export default TasksToolbar;
