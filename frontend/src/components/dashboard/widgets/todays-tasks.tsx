"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTodaysTasks } from "@/contexts/dashboard-context"
import { useTask } from "@/contexts/task-context"
import { Sun, CheckCircle, Clock, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import Link from "next/link"
import { Task } from "@/types/task"

const priorityColors = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-300",
}

export function TodaysTasksWidget() {
  const { todaysTasks, loading, error } = useTodaysTasks()
  const { toggleTaskCompletion } = useTask()

  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTaskCompletion(taskId)
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
            <Sun className="h-5 w-5" />
            Today&apos;s Tasks
          </CardTitle>
          <CardDescription>
            Tasks due today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20 mt-1" />
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
            <Sun className="h-5 w-5" />
            Today&apos;s Tasks
          </CardTitle>
          <CardDescription>
            Tasks due today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load today&apos;s tasks
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!todaysTasks || todaysTasks.tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Today&apos;s Tasks
          </CardTitle>
          <CardDescription>
            Tasks due today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 dark:text-green-400" />
            <p className="mt-2 text-sm text-muted-foreground">
              No tasks due today!
            </p>
            <p className="text-xs text-muted-foreground">
              You&apos;re all caught up
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
          <Sun className="h-5 w-5" />
          Today&apos;s Tasks
        </CardTitle>
        <CardDescription>
          {todaysTasks.totalCount} task{todaysTasks.totalCount !== 1 ? 's' : ''} due today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {todaysTasks.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleTask(task.id)}
            />
          ))}
        </div>

        {todaysTasks.totalCount > todaysTasks.tasks.length && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/my-day">
                <ExternalLink className="h-4 w-4 mr-2" />
                View All ({todaysTasks.totalCount})
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <button
        onClick={onToggle}
        className="flex-shrink-0 h-5 w-5 rounded-full border-2 border-muted-foreground hover:border-primary transition-colors"
      >
        {task.status === 'completed' && (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 -m-0.5" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium truncate ${
            task.status === 'completed' ? 'line-through text-muted-foreground' : ''
          }`}>
            {task.title}
          </span>
          <Badge variant="secondary" className={`text-xs ${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
        </div>
        
        {task.due_date && (
          <div className="text-xs text-muted-foreground mt-1">
            Due: {format(new Date(task.due_date), 'h:mm a')}
          </div>
        )}
      </div>
    </div>
  )
}