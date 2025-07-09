import { Target } from "lucide-react"
import dynamic from "next/dynamic"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

interface TaskDescriptionEditorProps {
  description?: string
  isEditing: boolean
  onDescriptionChange: (description: string) => void
  className?: string
}

export function TaskDescriptionEditor({
  description,
  isEditing,
  onDescriptionChange,
  className
}: TaskDescriptionEditorProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Description</h3>
      </div>
      
      {isEditing ? (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <MDEditor
            value={description || ""}
            onChange={(val) => onDescriptionChange(val || "")}
            preview="edit"
            visibleDragbar={false}
            height={400}
          />
        </div>
      ) : (
        <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-6 min-h-[300px] border border-border">
          {description ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {description}
            </ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">No description provided</p>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskDescriptionEditor