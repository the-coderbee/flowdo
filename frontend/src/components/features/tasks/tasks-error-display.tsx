import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface TasksErrorDisplayProps {
  error: string
  onDismiss: () => void
  className?: string
}

export function TasksErrorDisplay({ error, onDismiss, className }: TasksErrorDisplayProps) {
  return (
    <Alert variant="destructive" className={`mx-6 mt-4 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        {error}
        <Button
          variant="outline"
          size="sm"
          onClick={onDismiss}
          className="ml-2 h-6 px-2"
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default TasksErrorDisplay