import { Plus, Tag as TagIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tag } from "@/types/task"

interface TaskTagsManagerProps {
  tags?: Tag[]
  isEditing: boolean
  newTag: string
  onNewTagChange: (value: string) => void
  onAddTag: () => void
  className?: string
}

export function TaskTagsManager({
  tags,
  isEditing,
  newTag,
  onNewTagChange,
  onAddTag,
  className
}: TaskTagsManagerProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <TagIcon className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Tags</h3>
      </div>
      
      {tags && tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs px-2 py-1">
              {tag.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">No tags assigned</p>
      )}
      
      {isEditing && (
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => onNewTagChange(e.target.value)}
            placeholder="Add a tag..."
            className="flex-1 h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTag.trim()) {
                onAddTag()
              }
            }}
          />
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3"
            onClick={onAddTag}
            disabled={!newTag.trim()}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export default TaskTagsManager