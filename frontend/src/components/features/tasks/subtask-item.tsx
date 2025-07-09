"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { GripVertical, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Subtask } from "@/types/task"

interface SubtaskItemProps {
  subtask: Subtask
  onToggleComplete: (subtaskId: number) => void
  onUpdate: (subtaskId: number, title: string) => void
  onDelete: (subtaskId: number) => void
}

export function SubtaskItem({ subtask, onToggleComplete, onUpdate, onDelete }: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(subtask.title)
  
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleComplete(subtask.id)
  }
  
  const handleEdit = () => {
    setIsEditing(true)
  }
  
  const handleSave = () => {
    if (editTitle.trim() && editTitle !== subtask.title) {
      onUpdate(subtask.id, editTitle.trim())
    }
    setIsEditing(false)
  }
  
  const handleCancel = () => {
    setEditTitle(subtask.title)
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="ml-8 pl-4 border-l-2 border-border/30"
    >
      <div className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent/30 transition-colors group">
        {/* 4-dot grip icon */}
        <div className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>
        
        {/* Checkbox */}
        <div className="flex items-center">
          <button
            onClick={handleCheckboxClick}
            className={`
              w-4 h-4 rounded border-2 flex items-center justify-center
              transition-all duration-200 hover:scale-110
              ${subtask.is_completed 
                ? 'bg-primary border-primary text-primary-foreground' 
                : 'border-muted-foreground hover:border-primary'
              }
            `}
          >
            {subtask.is_completed && (
              <svg 
                className="w-2.5 h-2.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </button>
        </div>
        
        {/* Subtask title */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-6 px-2 py-0 text-sm border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
          ) : (
            <span
              className={`
                text-sm leading-5 cursor-pointer
                ${subtask.is_completed 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground hover:text-primary'
                }
              `}
              onClick={handleEdit}
            >
              {subtask.title}
            </span>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleEdit}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={() => onDelete(subtask.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}