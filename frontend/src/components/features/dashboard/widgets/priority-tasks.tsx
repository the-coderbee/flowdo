"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePriorityTasks } from "@/lib/providers/dashboard-provider"
import { useTask } from "@/lib/providers/task-provider"
import { AlertTriangle, Flame, CheckCircle, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Task } from "@/types/task"

const priorityConfig = {
  urgent: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400"
  },
  high: {
    icon: Flame,
    color: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-300",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  medium: {
    icon: AlertTriangle,
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-300",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  low: {
    icon: AlertTriangle,
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    iconColor: "text-gray-600 dark:text-gray-400"
  }
}

export function PriorityTasksWidget() {
  const { priorityTasks, loading, error } = usePriorityTasks()
  const { toggleTaskComplete } = useTask()

  // Filter tasks by priority
  const urgentTasks = priorityTasks?.filter(task => task.priority === 'urgent') || []
  const highTasks = priorityTasks?.filter(task => task.priority === 'high') || []
  const totalHighPriorityTasks = urgentTasks.length + highTasks.length

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTaskComplete(taskId)
      // The dashboard context will automatically refresh via event listeners
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Priority Tasks
          </CardTitle>
          <CardDescription>
            High priority and urgent tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Priority Tasks
          </CardTitle>
          <CardDescription>
            High priority and urgent tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load priority tasks
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!priorityTasks || (urgentTasks.length === 0 && highTasks.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Priority Tasks
          </CardTitle>
          <CardDescription>
            High priority and urgent tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
            <p className="mt-2 text-sm text-muted-foreground">
              No urgent or high priority tasks
            </p>
            <p className="text-xs text-muted-foreground">
              Great job staying on top of things!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Priority Tasks
        </CardTitle>
        <CardDescription>
          {totalHighPriorityTasks} high priority task{totalHighPriorityTasks !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Urgent Tasks */}
          {urgentTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium">Urgent</span>
              </div>
              <div className="space-y-2">
                {urgentTasks.map((task) => (
                  <PriorityTaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* High Priority Tasks */}
          {highTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">High Priority</span>
              </div>
              <div className="space-y-2">
                {highTasks.map((task) => (
                  <PriorityTaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* View All Button */}
          {totalHighPriorityTasks > 5 && (
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tasks?priority=urgent,high">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All ({totalHighPriorityTasks})
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PriorityTaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const config = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium
  const Icon = config?.icon || AlertTriangle

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <button
        onClick={onToggle}
        className="flex-shrink-0 h-4 w-4 rounded-full border-2 border-muted-foreground hover:border-primary transition-colors"
      >
        {task.status === 'completed' && (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 -m-0.5" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={`h-3 w-3 ${config?.iconColor || 'text-gray-600 dark:text-gray-400'}`} />
          <span className={`text-sm font-medium truncate ${
            task.status === 'completed' ? 'line-through text-muted-foreground' : ''
          }`}>
            {task.title}
          </span>
        </div>
        
        {task.due_date && (
          <div className="text-xs text-muted-foreground mt-1">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}