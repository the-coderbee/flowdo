import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TasksErrorFallbackProps {
  error: string
  onRetry: () => void
  className?: string
}

export function TasksErrorFallback({ error, onRetry, className }: TasksErrorFallbackProps) {
  return (
    <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
      <div className="max-w-md w-full text-center space-y-4">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Unable to load tasks</h3>
          <p className="text-muted-foreground text-sm">
            There was a problem fetching your tasks. Please check your connection and try again.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertDescription className="text-xs">
            <strong>Error details:</strong> {error}
          </AlertDescription>
        </Alert>

        <Button onClick={onRetry} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  )
}