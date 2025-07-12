import { motion } from "framer-motion";
import { CheckSquare, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskDetailsPanelEmptyProps {
  onCollapse?: () => void;
  className?: string;
}

export function TaskDetailsPanelEmpty({
  onCollapse,
  className,
}: TaskDetailsPanelEmptyProps) {
  return (
    <motion.div
      initial={{ width: 50 }}
      animate={{ width: 400 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {/* <h2 className="text-lg font-semibold">Task Details</h2> */}
        {/* {onCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )} */}
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              No task selected
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a task from the list to view its details, edit properties,
              or manage subtasks.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaskDetailsPanelEmpty;
