"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CreateTaskRequest, Tag } from "@/types/task"
import { useCreateTask } from "@/lib/hooks/use-task-queries"
import { useAuth } from "@/lib/providers/auth-provider"
import { useGroup } from "@/lib/providers/group-provider"
import { TagSelector } from "@/components/features/tasks/tag-selector"

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  due_date: z.string().optional(),
  estimated_pomodoros: z.number().min(1).max(20).optional(),
  is_in_my_day: z.boolean().optional(),
  starred: z.boolean().optional(),
  group_id: z.number().optional(),
  tag_ids: z.array(z.number()).optional(),
})

type TaskFormData = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  defaultValues?: Partial<TaskFormData>
}

export function TaskForm({ onSuccess, onCancel, defaultValues }: TaskFormProps) {
  const { user } = useAuth()
  const createTaskMutation = useCreateTask()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const { groups } = useGroup()

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      due_date: "",
      estimated_pomodoros: 1,
      is_in_my_day: false,
      starred: false,
      group_id: undefined,
      tag_ids: [],
      ...defaultValues
    }
  })

  const onSubmit = async (data: TaskFormData) => {
    if (!user) {
      console.error("User not authenticated")
      return
    }

    setIsSubmitting(true)
    try {
      const createTaskRequest: CreateTaskRequest = {
        title: data.title,
        description: data.description || undefined,
        priority: data.priority || "medium",
        due_date: data.due_date || undefined,
        estimated_pomodoros: data.estimated_pomodoros || 1,
        is_in_my_day: data.is_in_my_day || false,
        starred: data.starred || false,
        group_id: data.group_id || undefined,
        tag_ids: selectedTags.map(tag => tag.id),
        user_id: user.id
      }

      await createTaskMutation.mutateAsync(createTaskRequest)
      form.reset()
      setSelectedTags([])
      onSuccess?.()
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          placeholder="Enter task title..."
          {...form.register("title")}
          className="w-full"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description..."
          {...form.register("description")}
          className="w-full min-h-[100px]"
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={form.watch("priority")}
          onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high" | "urgent")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input
          id="due_date"
          type="date"
          {...form.register("due_date")}
          className="w-full"
        />
      </div>

      {/* Estimated Pomodoros */}
      <div className="space-y-2">
        <Label htmlFor="estimated_pomodoros">Estimated Pomodoros</Label>
        <Input
          id="estimated_pomodoros"
          type="number"
          min={1}
          max={20}
          {...form.register("estimated_pomodoros", { valueAsNumber: true })}
          className="w-full"
        />
      </div>

      {/* Group */}
      <div className="space-y-2">
        <Label htmlFor="group_id">Group</Label>
        <Select
          value={form.watch("group_id")?.toString() || "none"}
          onValueChange={(value) => form.setValue("group_id", value === "none" ? undefined : parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a group (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Group</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags */}
      <TagSelector
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        disabled={isSubmitting || createTaskMutation.isPending}
      />

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="is_in_my_day">Add to My Day</Label>
          <Switch
            id="is_in_my_day"
            checked={form.watch("is_in_my_day")}
            onCheckedChange={(checked) => form.setValue("is_in_my_day", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="starred">Mark as Important</Label>
          <Switch
            id="starred"
            checked={form.watch("starred")}
            onCheckedChange={(checked) => form.setValue("starred", checked)}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || createTaskMutation.isPending}
        >
          {isSubmitting || createTaskMutation.isPending ? "Creating..." : "Create Task"}
        </Button>
      </div>

      {/* Error Display */}
      {createTaskMutation.error && (
        <div className="text-sm text-red-500">
          Error creating task: {createTaskMutation.error.message}
        </div>
      )}
    </form>
  )
}