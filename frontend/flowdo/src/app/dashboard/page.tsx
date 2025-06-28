'use client'

import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()

  if (loading) {
  return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
      </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome, {user?.display_name}</h1>
          <Button variant="outline" onClick={logout}>Logout</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage your tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <p>You have 0 active tasks</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/tasks">View Tasks</a>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pomodoro</CardTitle>
              <CardDescription>Focus on your work</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Start a pomodoro session</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/pomodoro">Start Session</a>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Display Name:</strong> {user?.display_name}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <a href="/profile">Edit Profile</a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
} 