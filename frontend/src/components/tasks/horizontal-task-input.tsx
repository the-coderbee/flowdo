"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, ChevronDown, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CreateTaskRequest } from "@/types/task"

interface HorizontalTaskInputProps {
  onAdd: (task: CreateTaskRequest) => Promise<void>
  groupId?: number
}

const priorityOptions = [
  { value: 'low' as const, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  { value: 'medium' as const, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  { value: 'high' as const, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: 'urgent' as const, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
]

const sampleTags = [
  { id: 1, name: "Work", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
  { id: 2, name: "Personal", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400" },
  { id: 3, name: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" },
  { id: 4, name: "Meeting", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  { id: 5, name: "Shopping", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" }
]

export function HorizontalTaskInput({ onAdd, groupId }: HorizontalTaskInputProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    priority: 'medium',
    due_date: "",
    group_id: groupId,
    user_id: 1 // This will be set by the context
  })
  
  const [isDateExpanded, setIsDateExpanded] = useState(false)
  const [isPriorityExpanded, setIsPriorityExpanded] = useState(false)
  const [isTagsExpanded, setIsTagsExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedTags, setSelectedTags] = useState<typeof sampleTags>([])
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDateExpanded(false)
        setIsPriorityExpanded(false)
        setIsTagsExpanded(false)
        setIsFocused(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    
    // Format the data for the backend
    const taskData: CreateTaskRequest = {
      ...formData,
      title: formData.title.trim(),
      due_date: formData.due_date ? `${formData.due_date}T00:00:00.000Z` : undefined
    }
    
    await onAdd(taskData)
    
    // Reset form
    setFormData({
      title: "",
      priority: 'medium',
      due_date: "",
      group_id: groupId,
      user_id: 1
    })
    setSelectedTags([])
    setIsFocused(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as React.FormEvent)
    }
    if (e.key === 'Escape') {
      setIsFocused(false)
      titleInputRef.current?.blur()
    }
  }
  
  const formatDateForDisplay = (dateValue: string) => {
    if (!dateValue) return ""
    const date = new Date(dateValue)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
    
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today'
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }
  
  const selectedPriority = priorityOptions.find(p => p.value === formData.priority)
  
  const handleTagToggle = (tag: typeof sampleTags[0]) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id)
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id)
      } else {
        return [...prev, tag]
      }
    })
  }

  const handleTagRemove = (tagId: number) => {
    setSelectedTags(prev => prev.filter(t => t.id !== tagId))
  }
  
  return (
    <div ref={containerRef} className="w-full space-y-3">
      <form onSubmit={handleSubmit}>
        <div 
          className={`
            flex flex-col gap-3 p-4 rounded-lg border-2 transition-all duration-200
            ${isFocused 
              ? 'border-primary bg-card shadow-sm' 
              : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
            }
          `}
        >
          {/* Main Input Row */}
          <div className="flex items-center gap-3">
            {/* Plus Icon */}
            <div className="flex-shrink-0">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center">
                <Plus className="w-3 h-3 text-muted-foreground/40" />
              </div>
            </div>
            
            {/* Title Input - Smaller and more compact */}
            <div className="flex-1 min-w-0">
              <Input
                ref={titleInputRef}
                placeholder="Add a new task..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                className="border-none shadow-none bg-transparent px-0 h-auto py-1 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2">
              {/* Tags Button */}
              <div className="flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsTagsExpanded(!isTagsExpanded)
                    setIsDateExpanded(false)
                    setIsPriorityExpanded(false)
                  }}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 text-xs
                    ${selectedTags.length > 0 || isTagsExpanded
                      ? 'bg-accent text-accent-foreground border border-border' 
                      : 'hover:bg-accent/50 text-muted-foreground'
                    }
                  `}
                >
                  <Tag className="w-3 h-3" />
                  {selectedTags.length > 0 ? (
                    <span className="font-medium">{selectedTags.length}</span>
                  ) : (
                    <span>Tags</span>
                  )}
                  <ChevronDown className={`w-2 h-2 transition-transform ${isTagsExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>
          
              {/* Date Component */}
              <div className="flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsDateExpanded(!isDateExpanded)
                    setIsPriorityExpanded(false)
                    setIsTagsExpanded(false)
                  }}
                  className={`
                    flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 text-xs
                    ${formData.due_date || isDateExpanded
                      ? 'bg-accent text-accent-foreground border border-border' 
                      : 'hover:bg-accent/50 text-muted-foreground'
                    }
                  `}
                >
                  <Calendar className="w-3 h-3" />
                  {formData.due_date ? (
                    <span className="font-medium">
                      {formatDateForDisplay(formData.due_date)}
                    </span>
                  ) : (
                    <span>Date</span>
                  )}
                  <ChevronDown className={`w-2 h-2 transition-transform ${isDateExpanded ? 'rotate-180' : ''}`} />
                </button>
            
                <AnimatePresence>
                  {isDateExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[200px]"
                    >
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Due Date</label>
                    <Input
                      ref={dateInputRef}
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, due_date: e.target.value }))
                        if (e.target.value) {
                          setTimeout(() => setIsDateExpanded(false), 100)
                        }
                      }}
                      className="h-8 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, due_date: new Date().toISOString().split('T')[0] }))
                          setIsDateExpanded(false)
                        }}
                      >
                        Today
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          const tomorrow = new Date()
                          tomorrow.setDate(tomorrow.getDate() + 1)
                          setFormData(prev => ({ ...prev, due_date: tomorrow.toISOString().split('T')[0] }))
                          setIsDateExpanded(false)
                        }}
                      >
                        Tomorrow
                      </Button>
                      {formData.due_date && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, due_date: "" }))
                            setIsDateExpanded(false)
                          }}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
              {/* Priority Component */}
              <div className="flex-shrink-0 relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsPriorityExpanded(!isPriorityExpanded)
                    setIsDateExpanded(false)
                    setIsTagsExpanded(false)
                  }}
                  className="flex items-center gap-1 transition-all duration-200"
                >
                  <Badge 
                    className={`${selectedPriority?.color} cursor-pointer transition-all text-xs`}
                    variant="secondary"
                  >
                    {selectedPriority?.label}
                    <ChevronDown className={`w-2 h-2 ml-1 transition-transform ${isPriorityExpanded ? 'rotate-180' : ''}`} />
                  </Badge>
                </button>
                
                <AnimatePresence>
                  {isPriorityExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[160px]"
                    >
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Priority</label>
                    <div className="grid gap-2">
                      {priorityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, priority: option.value }))
                            setIsPriorityExpanded(false)
                          }}
                          className={`
                            text-left px-3 py-1.5 rounded-md text-sm transition-all
                            ${formData.priority === option.value 
                              ? `${option.color} border border-border` 
                              : 'hover:bg-accent'
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Selected Tags Display */}
          <AnimatePresence>
            {selectedTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 px-8"
              >
                {selectedTags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
                      ${tag.color} border border-border/20
                    `}
                  >
                    <span>{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag.id)}
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Tags Dropdown */}
      <AnimatePresence>
        {isTagsExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[250px]"
          >
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground">Add Tags</label>
              <div className="grid gap-2">
                {sampleTags.map((tag) => {
                  const isSelected = selectedTags.some(t => t.id === tag.id)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`
                        text-left px-3 py-2 rounded-md text-sm transition-all flex items-center justify-between
                        ${isSelected 
                          ? `${tag.color} border border-border` 
                          : 'hover:bg-accent'
                        }
                      `}
                    >
                      <span>{tag.name}</span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        >
                          <span className="text-xs">✓</span>
                        </motion.div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}