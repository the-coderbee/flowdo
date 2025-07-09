import { Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TasksToolbarProps {
  onAddTask?: () => void
  onFilter?: () => void
  className?: string
}

export function TasksToolbar({ onAddTask, onFilter, className }: TasksToolbarProps) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      <Button 
        variant="default" 
        size="lg" 
        className="hidden sm:flex text-foreground bg-primary/70 hover:bg-primary/50 cursor-pointer"
        onClick={onAddTask}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Task
      </Button>
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
  )
}

export default TasksToolbar