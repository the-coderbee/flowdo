"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRecentActivity } from "@/lib/providers/dashboard-provider"
import { CheckCircle, Plus, Clock, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { Task } from "@/types/task"

const activityIcons = {
  completed: CheckCircle,
  created: Plus,
  updated: Clock,
}

const activityColors = {
  completed: "text-green-600 dark:text-green-400",
  created: "text-blue-600 dark:text-blue-400",
  updated: "text-yellow-600 dark:text-yellow-400",
}

export function RecentActivityWidget() {
  const { recentActivity, loading, error } = useRecentActivity()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest task activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24 mt-1" />
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
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest task activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load recent activity
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recentActivity) {
    return null
  }

  // Combine all activities and sort by date
  const activities: Array<{
    id: string
    type: 'completed' | 'created' | 'updated'
    task: Task
    date: string
  }> = []

  // Helper function to validate date
  const isValidDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  // Add completed tasks
  recentActivity.recentCompleted.forEach(task => {
    if (task.completed_at && isValidDate(task.completed_at)) {
      activities.push({
        id: `completed-${task.id}`,
        type: 'completed',
        task,
        date: task.completed_at
      })
    }
  })

  // Add created tasks
  recentActivity.recentCreated.forEach(task => {
    if (isValidDate(task.created_at)) {
      activities.push({
        id: `created-${task.id}`,
        type: 'created',
        task,
        date: task.created_at
      })
    }
  })

  // Add updated tasks
  recentActivity.recentUpdated.forEach(task => {
    if (isValidDate(task.updated_at)) {
      activities.push({
        id: `updated-${task.id}`,
        type: 'updated',
        task,
        date: task.updated_at
      })
    }
  })

  // Sort by date (most recent first) and limit to 5
  const sortedActivities = activities
    .sort((a, b) => {
      try {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        if (isNaN(dateA) && isNaN(dateB)) return 0
        if (isNaN(dateA)) return 1
        if (isNaN(dateB)) return -1
        return dateB - dateA
      } catch (error) {
        console.warn('Error sorting activities by date:', error)
        return 0
      }
    })
    .slice(0, 5)

  if (sortedActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest task activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Start working on tasks to see activity here
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
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest task activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ activity }: { 
  activity: {
    id: string
    type: 'completed' | 'created' | 'updated'
    task: Task
    date: string
  }
}) {
  const Icon = activityIcons[activity.type]
  const iconColor = activityColors[activity.type]
  
  const getActivityText = () => {
    switch (activity.type) {
      case 'completed':
        return 'Completed'
      case 'created':
        return 'Created'
      case 'updated':
        return 'Updated'
      default:
        return 'Modified'
    }
  }

  const getFormattedDate = () => {
    try {
      if (!activity.date) {
        return 'Recently'
      }
      
      const date = new Date(activity.date)
      if (isNaN(date.getTime())) {
        return 'Recently'
      }
      
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.warn('Error formatting date:', activity.date, error)
      return 'Recently'
    }
  }

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-shrink-0">
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {activity.task.title}
          </span>
          <Badge variant="outline" className="text-xs">
            {getActivityText()}
          </Badge>
        </div>
        
        <div className="text-xs text-muted-foreground mt-1">
          {getFormattedDate()}
        </div>
      </div>
    </div>
  )
}