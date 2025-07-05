"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Calendar, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CreateTaskRequest } from "@/types/task"

interface AddTaskFormProps {
  onAdd: (task: CreateTaskRequest) => void
  onCancel?: () => void
  groupId?: number
}

const priorityOptions = [
  { value: 'low' as const, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
  { value: 'medium' as const, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
  { value: 'high' as const, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: 'urgent' as const, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" }
]

export function AddTaskForm({ onAdd, onCancel, groupId }: AddTaskFormProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: "",
    description: "",
    priority: 'low',
    due_date: "",
    estimated_pomodoros: undefined,
    group_id: groupId,
    user_id: 1 // This will be set by the context
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    
    onAdd({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      due_date: formData.due_date || undefined
    })
    
    // Reset form
    setFormData({
      title: "",
      description: "",
      priority: 'low',
      due_date: "",
      estimated_pomodoros: undefined,
      group_id: groupId,
      user_id: 1 // This will be set by the context
    })
    setIsExpanded(false)
  }
  
  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      priority: 'low',
      due_date: "",
      estimated_pomodoros: undefined,
      group_id: groupId,
      user_id: 1 // This will be set by the context
    })
    setIsExpanded(false)
    onCancel?.()
  }
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isExpanded && formData.title.trim()) {
        handleSubmit(e as React.FormEvent)
      }
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="pl-6" // Same left padding as task items
    >
      <form onSubmit={handleSubmit} className="w-full">
        <div className={`
          border border-dashed border-muted-foreground/30 rounded-lg p-4 
          transition-all duration-200 hover:border-primary/50 focus-within:border-primary
          ${isExpanded ? 'bg-card border-solid border-border' : ''}
        `}>
          {/* Quick Add Input */}
          <div className="flex items-center gap-4">
            <div className="flex items-center pt-1">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center">
                <Plus className="w-3 h-3 text-muted-foreground/40" />
              </div>
            </div>
            
            <div className="flex-1">
              <Input
                placeholder="Add a new task..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                onFocus={() => setIsExpanded(true)}
                onKeyDown={handleTitleKeyDown}
                className="border-none shadow-none text-base bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          
          {/* Expanded Form */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              {/* Description */}
              <div className="ml-9">
                <Textarea
                  placeholder="Add a description (optional)..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="border-none shadow-none bg-transparent px-0 resize-none min-h-[60px] focus-visible:ring-0"
                />
              </div>
              
              {/* Options Row */}
              <div className="ml-9 flex items-center gap-4 flex-wrap">
                {/* Priority Selector */}
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {priorityOptions.map((option) => (
                      <Badge
                        key={option.value}
                        variant={formData.priority === option.value ? "default" : "outline"}
                        className={`
                          cursor-pointer text-xs px-2 py-1 transition-all
                          ${formData.priority === option.value ? option.color : ''}
                        `}
                        onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                      >
                        {option.label}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Due Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="h-7 text-xs border-none shadow-none bg-transparent px-2 focus-visible:ring-0"
                  />
                </div>
                
                {/* Pomodoro Estimate */}
                <div className="flex items-center gap-2">
                  <span className="text-sm">🍅</span>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="Est."
                    value={formData.estimated_pomodoros || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimated_pomodoros: e.target.value ? parseInt(e.target.value) : undefined 
                    }))}
                    className="h-7 w-16 text-xs border-none shadow-none bg-transparent px-2 focus-visible:ring-0"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="ml-9 flex items-center gap-2 pt-2">
                <Button type="submit" size="sm" disabled={!formData.title.trim()}>
                  Add Task
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </motion.div>
  )
}