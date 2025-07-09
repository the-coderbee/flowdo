import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TagColorPicker } from "./tag-color-picker"
import { Tag as TagType } from "@/services/tag"

interface TagFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string, color: string) => Promise<void>
  mode: 'create' | 'edit'
  tag?: TagType | null
  loading?: boolean
}

export function TagFormDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode, 
  tag,
  loading = false 
}: TagFormDialogProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && tag) {
        setName(tag.name)
        setColor(tag.color || "#3b82f6")
      } else {
        setName("")
        setColor("#3b82f6")
      }
    }
  }, [isOpen, mode, tag])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(name.trim(), color)
      onClose()
    } catch (error) {
      console.error('Error submitting tag:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  const isFormValid = name.trim().length > 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? 'Create New Tag' : 'Edit Tag'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'create' 
                ? 'Add a new tag to organize your tasks.' 
                : 'Update the tag name and color.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="tag-name" className="text-sm font-medium text-foreground">
                Name
              </label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name..."
                disabled={isSubmitting || loading}
                autoFocus
                maxLength={50}
              />
            </div>
            
            <TagColorPicker
              selectedColor={color}
              onColorChange={setColor}
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || loading}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Tag' : 'Update Tag'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TagFormDialog