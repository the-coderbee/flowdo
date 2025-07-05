"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Menu, AlertCircle, Loader2, Plus, Tag, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { tagService, Tag as TagType, CreateTagRequest } from "@/services/tag"
import { useAuth } from "@/contexts/auth-context"

interface TagsContentProps {
  onMobileSidebarToggle?: () => void
  isMobileSidebarOpen?: boolean
}


export function TagsContent({ onMobileSidebarToggle }: TagsContentProps) {
  const { user } = useAuth()
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#3b82f6")

  // Load tags from API
  useEffect(() => {
    const loadTags = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        const fetchedTags = await tagService.getTagsForUser(user.id)
        setTags(fetchedTags)
      } catch (error) {
        console.error('Error loading tags:', error)
        setError('Failed to load tags')
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [user])

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
      const createRequest: CreateTagRequest = {
        name: newTagName.trim(),
        color: newTagColor,
        user_id: user.id
      }
      
      const newTag = await tagService.createTag(createRequest)
      setTags([...tags, newTag])
      setNewTagName("")
      setNewTagColor("#3b82f6")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating tag:', error)
      setError('Failed to create tag')
    } finally {
      setLoading(false)
    }
  }

  const handleEditTag = async () => {
    if (!selectedTag || !newTagName.trim() || !user) return

    setLoading(true)
    setError(null)

    try {
      const updatedTag = await tagService.updateTag(selectedTag.id, {
        id: selectedTag.id,
        name: newTagName.trim(),
        color: newTagColor,
        user_id: user.id
      })
      
      setTags(tags.map(tag => 
        tag.id === selectedTag.id ? updatedTag : tag
      ))
      setNewTagName("")
      setNewTagColor("#3b82f6")
      setSelectedTag(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating tag:', error)
      setError('Failed to update tag')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async (tagId: number) => {
    setLoading(true)
    setError(null)

    try {
      await tagService.deleteTag(tagId)
      setTags(tags.filter(tag => tag.id !== tagId))
    } catch (error) {
      console.error('Error deleting tag:', error)
      setError('Failed to delete tag')
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (tag: TagType) => {
    setSelectedTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
    setIsEditDialogOpen(true)
  }

  const clearError = () => setError(null)

  const tagColors = tagService.getColorOptions()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-8 w-8 p-0"
              onClick={onMobileSidebarToggle}
            >
              <Menu className="h-4 w-4" />
            </Button>
            
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-foreground"
              >
                Tags
              </motion.h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tags.length} tags
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                  <DialogDescription>
                    Add a new tag to organize your tasks better.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="tag-name" className="text-right">
                      Name
                    </label>
                    <Input
                      id="tag-name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="col-span-3"
                      placeholder="Enter tag name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="tag-color" className="text-right">
                      Color
                    </label>
                    <div className="col-span-3 flex gap-2">
                      {tagColors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newTagColor === color ? "border-foreground" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setNewTagColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTag} disabled={!newTagName.trim()}>
                    Create Tag
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Mobile: Icon only buttons */}
            <Button variant="outline" size="sm" className="sm:hidden h-8 w-8 p-0">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="sm:hidden h-8 w-8 p-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mx-6 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-2 h-6 px-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto px-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading tags...</span>
          </div>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-6"
          >
            {/* Tags Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <Card key={tag.id} className="relative group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <CardTitle className="text-lg">{tag.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEditDialog(tag)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {tag.task_count} {tag.task_count === 1 ? 'task' : 'tasks'}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {tags.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium">No tags yet</p>
                  <p className="text-sm">Create your first tag to organize your tasks</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name and color.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-tag-name" className="text-right">
                Name
              </label>
              <Input
                id="edit-tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="col-span-3"
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-tag-color" className="text-right">
                Color
              </label>
              <div className="col-span-3 flex gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTagColor === color ? "border-foreground" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditTag} disabled={!newTagName.trim()}>
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}