"use client"

import { useState } from "react"
import { TagsPageHeader } from "./tags-page-header"
import { TagsErrorDisplay } from "./tags-error-display"
import { TagsGrid } from "./tags-grid"
import { TagFormDialog } from "./tag-form-dialog"
import { useTagsManagement } from "@/lib/hooks/use-tags-management"
import { Tag as TagType } from "@/services/tag"

interface TagsContentProps {
  onMobileSidebarToggle?: () => void
  isMobileSidebarOpen?: boolean
}

export function TagsContent({ onMobileSidebarToggle }: TagsContentProps) {
  const {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    clearError
  } = useTagsManagement()

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null)

  const handleCreateTag = async (name: string, color: string) => {
    await createTag(name, color)
    setIsCreateDialogOpen(false)
  }

  const handleEditTag = (tag: TagType) => {
    setSelectedTag(tag)
    setIsEditDialogOpen(true)
  }

  const handleUpdateTag = async (name: string, color: string) => {
    if (!selectedTag) return
    
    await updateTag(selectedTag.id, name, color)
    setIsEditDialogOpen(false)
    setSelectedTag(null)
  }

  const handleDeleteTag = async (tagId: number) => {
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      await deleteTag(tagId)
    }
  }

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false)
    setSelectedTag(null)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <TagsPageHeader
        tagCount={tags.length}
        onMobileSidebarToggle={onMobileSidebarToggle}
        onCreateTag={() => setIsCreateDialogOpen(true)}
      />

      {/* Error Display */}
      {error && (
        <TagsErrorDisplay
          error={error}
          onDismiss={clearError}
        />
      )}

      {/* Tags Grid */}
      <TagsGrid
        tags={tags}
        loading={loading}
        onEditTag={handleEditTag}
        onDeleteTag={handleDeleteTag}
      />

      {/* Create Tag Dialog */}
      <TagFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateTag}
        mode="create"
        loading={loading}
      />

      {/* Edit Tag Dialog */}
      <TagFormDialog
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSubmit={handleUpdateTag}
        mode="edit"
        tag={selectedTag}
        loading={loading}
      />
    </div>
  )
}

export default TagsContent