import { Loader2 } from "lucide-react"

interface TasksLoadingStateProps {
  className?: string
}

export function TasksLoadingState({ className }: TasksLoadingStateProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin mr-2" />
      <span className="text-muted-foreground">Loading tasks...</span>
    </div>
  )
}

export default TasksLoadingState