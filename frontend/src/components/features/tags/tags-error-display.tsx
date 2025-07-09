import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface TagsErrorDisplayProps {
  error: string
  onDismiss: () => void
  className?: string
}

export function TagsErrorDisplay({ error, onDismiss, className }: TagsErrorDisplayProps) {
  return (
    <Alert variant="destructive" className={`mb-6 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 hover:bg-destructive/20"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default TagsErrorDisplay