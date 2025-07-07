"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGroup } from "@/contexts/group-context"
import { FolderOpen, Users, ExternalLink, Plus } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

const groupColors = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-purple-600 dark:text-purple-400",
  "text-pink-600 dark:text-pink-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-lime-600 dark:text-lime-400",
]

export function GroupsOverviewWidget() {
  const { groups, loading, error } = useGroup()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Groups
          </CardTitle>
          <CardDescription>
            Task groups and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8 ml-auto" />
                </div>
                <Skeleton className="h-2 w-full" />
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
            <Users className="h-5 w-5" />
            Groups
          </CardTitle>
          <CardDescription>
            Task groups and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load groups
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!groups || groups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Groups
          </CardTitle>
          <CardDescription>
            Task groups and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FolderOpen className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No groups created yet
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Create groups to organize your tasks
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show only first 4 groups to keep widget compact
  const displayGroups = groups.slice(0, 4)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Groups
        </CardTitle>
        <CardDescription>
          {groups.length} group{groups.length !== 1 ? 's' : ''} with tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayGroups.map((group, index) => {
            // Mock progress calculation - replace with actual completed/total tasks
            const completedTasks = Math.floor((group.task_count || 0) * 0.6) // Mock 60% completion
            const totalTasks = group.task_count || 0
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

            return (
              <GroupItem
                key={group.id}
                group={group}
                colorClass={groupColors[index % groupColors.length]}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
                progress={progress}
              />
            )
          })}

          {groups.length > 4 && (
            <div className="pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href="/tasks">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Groups ({groups.length})
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface GroupItemProps {
  group: {
    id: number
    name: string
    task_count?: number
  }
  colorClass: string
  completedTasks: number
  totalTasks: number
  progress: number
}

function GroupItem({
  group,
  colorClass,
  completedTasks,
  totalTasks,
  progress
}: GroupItemProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <div className="space-y-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className={`h-4 w-4 ${colorClass}`} />
            <span className="text-sm font-medium truncate">
              {group.name}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {totalTasks} task{totalTasks !== 1 ? 's' : ''}
          </span>
        </div>
        
        {totalTasks > 0 && (
          <div className="space-y-1">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completedTasks} completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}