import { Loader2, Tag } from "lucide-react"
import { TagCard } from "./tag-card"
import { Tag as TagType } from "@/services/tag"

interface TagsGridProps {
  tags: TagType[]
  loading: boolean
  onEditTag: (tag: TagType) => void
  onDeleteTag: (tagId: number) => void
  className?: string
}

export function TagsGrid({ tags, loading, onEditTag, onDeleteTag, className }: TagsGridProps) {
  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading tags...</span>
        </div>
      </div>
    )
  }

  if (tags.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Tag className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-foreground">No tags yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first tag to organize your tasks and make them easier to find.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {tags.map((tag) => (
        <TagCard
          key={tag.id}
          tag={tag}
          onEdit={onEditTag}
          onDelete={onDeleteTag}
        />
      ))}
    </div>
  )
}

export default TagsGrid