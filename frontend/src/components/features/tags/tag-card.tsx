import { motion } from "framer-motion"
import { Edit2, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag as TagType } from "@/services/tag"

interface TagCardProps {
  tag: TagType
  onEdit: (tag: TagType) => void
  onDelete: (tagId: number) => void
  className?: string
}

export function TagCard({ tag, onEdit, onDelete, className }: TagCardProps) {
  const handleEdit = () => {
    onEdit(tag)
  }

  const handleDelete = () => {
    onDelete(tag.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="group hover:shadow-md transition-all duration-200 relative overflow-hidden">
        {/* Color indicator */}
        <div 
          className="absolute top-0 left-0 w-full h-1"
          style={{ backgroundColor: tag.color || '#3b82f6' }}
        />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Tag 
                className="w-4 h-4 flex-shrink-0" 
                style={{ color: tag.color || '#3b82f6' }}
              />
              <CardTitle className="text-base font-medium truncate">
                {tag.name}
              </CardTitle>
            </div>
            
            {/* Action buttons - hidden by default, shown on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent"
                onClick={handleEdit}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground">
            {tag.task_count || 0} {tag.task_count === 1 ? 'task' : 'tasks'}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default TagCard