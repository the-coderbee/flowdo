"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddSubtaskButtonProps {
  onAddSubtask: (title: string) => void
  className?: string
}

export function AddSubtaskButton({ onAddSubtask, className }: AddSubtaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")

  const handleAdd = () => {
    if (title.trim()) {
      onAddSubtask(title.trim())
      setTitle("")
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setTitle("")
    setIsAdding(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isAdding) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`flex items-center gap-2 ${className}`}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add subtask..."
          className="h-6 px-2 py-1 text-xs border border-border/50 focus:border-primary/50 transition-colors"
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700 transition-all duration-200"
          onClick={handleAdd}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 py-1 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-all duration-200"
        onClick={() => setIsAdding(true)}
      >
        <motion.div
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="h-3 w-3" />
        </motion.div>
        Add subtask
      </Button>
    </motion.div>
  )
}

export default AddSubtaskButton