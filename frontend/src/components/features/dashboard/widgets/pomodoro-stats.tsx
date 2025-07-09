"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Timer, Play, RotateCcw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function PomodoroStatsWidget() {
  // Mock data for now - replace with actual pomodoro context when available
  const loading = false
  const error = null
  const pomodoroStats = {
    currentSession: {
      isActive: false,
      timeRemaining: 0,
      sessionType: 'work' as const
    },
    dailyStats: {
      completed: 4,
      target: 8,
      focusTime: 120 // in minutes
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Pomodoro
          </CardTitle>
          <CardDescription>
            Focus time and sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
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
            <Timer className="h-5 w-5" />
            Pomodoro
          </CardTitle>
          <CardDescription>
            Focus time and sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Timer className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Failed to load pomodoro stats
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!pomodoroStats) {
    return null
  }

  const { currentSession, dailyStats } = pomodoroStats
  const dailyProgress = (dailyStats.completed / dailyStats.target) * 100
  const focusHours = Math.floor(dailyStats.focusTime / 60)
  const focusMinutes = dailyStats.focusTime % 60

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Pomodoro
        </CardTitle>
        <CardDescription>
          Focus time and sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Session */}
          <div className="p-3 rounded-lg bg-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${
                  currentSession.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium">
                  {currentSession.isActive ? 'Session Active' : 'Ready to Start'}
                </span>
              </div>
              <Badge variant={currentSession.sessionType === 'work' ? 'default' : 'secondary'}>
                {currentSession.sessionType === 'work' ? 'Work' : 'Break'}
              </Badge>
            </div>
            
            {currentSession.isActive && (
              <div className="mt-2 text-2xl font-mono font-bold text-center">
                {Math.floor(currentSession.timeRemaining / 60)}:{(currentSession.timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>

          {/* Daily Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Daily Progress</span>
              <span className="text-sm text-muted-foreground">
                {dailyStats.completed}/{dailyStats.target}
              </span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {Math.round(dailyProgress)}% complete
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-card border">
              <div className="text-sm text-muted-foreground">Focus Time</div>
              <div className="text-lg font-bold">
                {focusHours > 0 ? `${focusHours}h ` : ''}{focusMinutes}m
              </div>
            </div>
            <div className="p-3 rounded-lg bg-card border">
              <div className="text-sm text-muted-foreground">Sessions</div>
              <div className="text-lg font-bold">{dailyStats.completed}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" asChild>
              <Link href="/pomodoro">
                <Play className="h-4 w-4 mr-2" />
                Start Focus
              </Link>
            </Button>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}