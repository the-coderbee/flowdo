"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useTask } from "@/lib/providers/task-provider"
import { useAuth } from "@/lib/providers/auth-provider"
import { Plus, Timer, Settings, BarChart3, Zap } from "lucide-react"
import Link from "next/link"

export function QuickActionsWidget() {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const { createTask } = useTask()
  const { user } = useAuth()

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim() || !user) return

    setIsCreating(true)
    try {
      await createTask({
        title: newTaskTitle.trim(),
        priority: 'medium',
        user_id: user.id
      })
      setNewTaskTitle("")
      // Dispatch custom event to refresh dashboard
      window.dispatchEvent(new Event('task:created'))
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Fast access to common actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Task Creation */}
          <div className="space-y-2">
            <label htmlFor="quick-task" className="text-sm font-medium">
              Create New Task
            </label>
            <form onSubmit={handleCreateTask} className="flex gap-2">
              <Input
                id="quick-task"
                placeholder="Enter task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1"
                disabled={isCreating}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newTaskTitle.trim() || isCreating}
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/pomodoro">
                <Timer className="h-4 w-4 mr-2" />
                Start Focus
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/tasks">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Tasks
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/my-day">
                <BarChart3 className="h-4 w-4 mr-2" />
                My Day
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}