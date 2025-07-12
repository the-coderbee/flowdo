"use client"

import { useState, useCallback } from "react"
import { X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTagsManagement } from "@/lib/hooks/use-tags-management"
import { Tag } from "@/types/task"

interface TagSelectorProps {
  selectedTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  placeholder = "Search or create tags...",
  disabled = false,
  className = ""
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const { tags, loading, createTag } = useTagsManagement()

  // Filter available tags (exclude already selected ones)
  const availableTags = tags.filter(tag => 
    !selectedTags.some(selectedTag => selectedTag.id === tag.id) &&
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle tag selection
  const handleTagSelect = useCallback((tag: Tag) => {
    onTagsChange([...selectedTags, tag])
    setSearchQuery("")
    setShowDropdown(false)
  }, [selectedTags, onTagsChange])

  // Handle tag removal
  const handleTagRemove = useCallback((tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter(tag => tag.id !== tagToRemove.id))
  }, [selectedTags, onTagsChange])

  // Handle creating new tag
  const handleCreateTag = useCallback(async () => {
    if (!searchQuery.trim()) return

    try {
      // Generate a random color for the new tag
      const colors = [
        "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", 
        "#f97316", "#06b6d4", "#84cc16", "#ec4899", "#6b7280"
      ]
      const randomColor = colors[Math.floor(Math.random() * colors.length)]
      
      await createTag(searchQuery.trim(), randomColor)
      setSearchQuery("")
      setShowDropdown(false)
    } catch (error) {
      console.error("Failed to create tag:", error)
    }
  }, [searchQuery, createTag])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      e.preventDefault()
      if (availableTags.length > 0) {
        handleTagSelect(availableTags[0])
      } else {
        handleCreateTag()
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
      setSearchQuery("")
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Tags</Label>
      
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-2 py-1 text-xs flex items-center gap-1"
              style={{ 
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color || undefined,
                color: tag.color || undefined
              }}
            >
              <span>{tag.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => handleTagRemove(tag)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Tag input with dropdown */}
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full"
        />
        
        {/* Dropdown */}
        {showDropdown && (searchQuery.length > 0 || availableTags.length > 0) && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {/* Create new tag option */}
            {searchQuery.trim() && !availableTags.some(tag => tag.name.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 border-b"
                onClick={handleCreateTag}
              >
                <Plus className="h-4 w-4" />
                <span>Create "{searchQuery.trim()}"</span>
              </button>
            )}
            
            {/* Available tags */}
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={() => handleTagSelect(tag)}
              >
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ 
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined
                  }}
                >
                  {tag.name}
                </Badge>
              </button>
            ))}
            
            {/* No results */}
            {searchQuery.length > 0 && availableTags.length === 0 && !searchQuery.trim() && (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No tags found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}