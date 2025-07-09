import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface TaskDescriptionProps {
  description?: string
  className?: string
}

export function TaskDescription({ description, className }: TaskDescriptionProps) {
  if (!description?.trim()) {
    return (
      <div className={`text-sm text-muted-foreground italic ${className}`}>
        No description provided
      </div>
    )
  }

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {description}
      </ReactMarkdown>
    </div>
  )
}

export default TaskDescription