"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDashboard, useDashboardStats } from "@/lib/providers/dashboard-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardDebug() {
  const dashboard = useDashboard()
  const statsHook = useDashboardStats()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await dashboard.refreshDashboard()
    } catch (error) {
      console.error('Dashboard refresh error:', error)
    }
    setIsRefreshing(false)
  }

  return (
    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="text-sm">Dashboard Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <strong>Stats Loading:</strong> {dashboard.statsLoading ? "Yes" : "No"}
          </div>
          <div>
            <strong>Stats Error:</strong> {dashboard.statsError ? "Yes" : "No"}
          </div>
          <div>
            <strong>Priority Tasks:</strong> {dashboard.priorityTasks.length}
          </div>
          <div>
            <strong>Today's Tasks:</strong> {dashboard.todaysTasks.length}
          </div>
        </div>

        {dashboard.statsError && (
          <Alert variant="destructive">
            <AlertDescription className="text-xs">
              <strong>Stats Error:</strong> {dashboard.statsError}
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <div className="text-xs space-y-1">
              <p><strong>Stats Data:</strong></p>
              <pre className="whitespace-pre-wrap bg-muted p-2 rounded text-xs">
                {JSON.stringify(dashboard.stats, null, 2)}
              </pre>
            </div>
          </AlertDescription>
        </Alert>

        <Button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          size="sm"
          className="w-full"
        >
          {isRefreshing ? "Refreshing..." : "Refresh Dashboard"}
        </Button>
      </CardContent>
    </Card>
  )
}