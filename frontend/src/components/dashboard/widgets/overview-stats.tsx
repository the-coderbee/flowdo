"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "@/contexts/dashboard-context"
import { CheckCircle, Circle, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function OverviewStats() {
  const { stats, loading, error } = useDashboardStats()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Task statistics and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-3 w-20" />
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
          <CardTitle>Overview</CardTitle>
          <CardDescription>Task statistics and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Failed to load statistics
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0

  const pomodoroCompletionRate = stats.totalPomodoros > 0
    ? Math.round((stats.completedPomodoros / stats.totalPomodoros) * 100)
    : 0

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: Circle,
      color: "text-blue-600 dark:text-blue-400",
      description: "All tasks",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      description: `${completionRate}% complete`,
    },
    {
      title: "Pending",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-yellow-600 dark:text-yellow-400",
      description: "In progress",
    },
    {
      title: "Overdue",
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      description: "Past due date",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Overview
        </CardTitle>
        <CardDescription>
          Task statistics and progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </span>
              </div>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Completed Today
              </div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {stats.completedToday}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Pomodoro Progress
              </div>
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {stats.completedPomodoros}/{stats.totalPomodoros}
              </div>
              <div className="text-xs text-muted-foreground">
                {pomodoroCompletionRate}% complete
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}