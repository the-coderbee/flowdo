"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { TaskForm } from "@/components/forms/task-form"

interface TaskCreationDialogProps {
  trigger?: React.ReactNode
  onTaskCreated?: () => void
}

export function TaskCreationDialog({ trigger, onTaskCreated }: TaskCreationDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSuccess = () => {
    setIsOpen(false)
    onTaskCreated?.()
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const defaultTrigger = (
    <Button 
      variant="default" 
      size="lg" 
      className="text-foreground bg-primary/70 hover:bg-primary/50"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Task
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <TaskForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}