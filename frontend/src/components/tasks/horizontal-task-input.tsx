"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CreateTaskRequest, TaskPriority } from "@/types/task"

interface HorizontalTaskInputProps {
  onAdd: (task: CreateTaskRequest) => void
  groupId?: number
}

const priorityOptions = [
  { value: TaskPriority.LOW, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  { value: TaskPriority.MEDIUM, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  { value: TaskPriority.HIGH, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: TaskPriority.URGENT, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
]

export function HorizontalTaskInput({ onAdd, groupId }: HorizontalTaskInputProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    priority: TaskPriority.MEDIUM,
    due_date: "",
    group_id: groupId
  })
  
  const [isDateExpanded, setIsDateExpanded] = useState(false)
  const [isPriorityExpanded, setIsPriorityExpanded] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const titleInputRef = useRef<HTMLInputElement>(null)
  const dateInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDateExpanded(false)
        setIsPriorityExpanded(false)
        setIsFocused(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    
    onAdd({
      ...formData,
      title: formData.title.trim(),
      due_date: formData.due_date || undefined
    })
    
    // Reset form
    setFormData({
      title: "",
      priority: TaskPriority.MEDIUM,
      due_date: "",
      group_id: groupId
    })
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
  
  return (
    <div ref={containerRef} className="w-full">
      <form onSubmit={handleSubmit}>
        <div 
          className={`
            flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200
            ${isFocused 
              ? 'border-primary bg-card shadow-sm' 
              : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
            }
          `}
        >
          {/* Plus Icon */}
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center">
              <Plus className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </div>
          
          {/* Title Input - Takes remaining space */}
          <div className="flex-1 min-w-0">
            <Input
              ref={titleInputRef}
              placeholder="Add a new task..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              onFocus={() => setIsFocused(true)}
              onKeyDown={handleKeyDown}
              className="border-none shadow-none bg-transparent px-0 h-auto py-1 text-base focus-visible:ring-0 placeholder:text-muted-foreground/60"
            />
          </div>
          
          {/* Date Component */}
          <div className="flex-shrink-0 relative">
            <button
              type="button"
              onClick={() => {
                setIsDateExpanded(!isDateExpanded)
                setIsPriorityExpanded(false)
              }}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200
                ${formData.due_date || isDateExpanded
                  ? 'bg-accent text-accent-foreground border border-border' 
                  : 'hover:bg-accent/50 text-muted-foreground'
                }
              `}
            >
              <Calendar className="w-4 h-4" />
              {formData.due_date ? (
                <span className="text-sm font-medium">
                  {formatDateForDisplay(formData.due_date)}
                </span>
              ) : (
                <span className="text-sm">Date</span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${isDateExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDateExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[200px]"
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
              }}
              className="flex items-center gap-2 transition-all duration-200"
            >
              <Badge 
                className={`${selectedPriority?.color} cursor-pointer transition-all`}
                variant="secondary"
              >
                {selectedPriority?.label}
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isPriorityExpanded ? 'rotate-180' : ''}`} />
              </Badge>
            </button>
            
            <AnimatePresence>
              {isPriorityExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 p-3 bg-popover border rounded-lg shadow-lg z-50 min-w-[160px]"
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
      </form>
    </div>
  )
}