"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGroup } from "@/lib/providers/group-provider"
import { useAuth } from "@/lib/providers/auth-provider"
import { Loader2, FolderPlus } from "lucide-react"

const groupFormSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100, "Group name must be less than 100 characters"),
  description: z.string().optional(),
  color: z.string().optional(),
})

type GroupFormData = z.infer<typeof groupFormSchema>

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const { user } = useAuth()
  const { createGroup, loading } = useGroup()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "",
    },
  })

  const onSubmit = async (data: GroupFormData) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const success = await createGroup({
        name: data.name,
        description: data.description,
        color: data.color,
      })

      if (success) {
        form.reset()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Failed to create group:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Group
          </DialogTitle>
          <DialogDescription>
            Create a new group to organize your tasks. Groups help you categorize and manage related tasks together.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="Enter group name..."
              {...form.register("name")}
              disabled={isSubmitting || loading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description (optional)..."
              {...form.register("description")}
              disabled={isSubmitting || loading}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupDialog