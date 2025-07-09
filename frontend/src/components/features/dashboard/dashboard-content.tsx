"use client"

import { OverviewStats } from "./widgets/overview-stats"
import { TodaysTasksWidget } from "./widgets/todays-tasks"
import { PomodoroStatsWidget } from "./widgets/pomodoro-stats"
import { RecentActivityWidget } from "./widgets/recent-activity"
import { PriorityTasksWidget } from "./widgets/priority-tasks"
import { QuickActionsWidget } from "./widgets/quick-actions"
import { GroupsOverviewWidget } from "./widgets/groups-overview"

export function DashboardContent() {
  return (
    <div className="space-y-6">
      {/* Quick Actions - Always at top */}
      <div className="w-full">
        <QuickActionsWidget />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Overview Stats - Takes 2 columns on large screens */}
        <div className="md:col-span-2">
          <OverviewStats />
        </div>

        {/* Today's Tasks */}
        <div className="md:col-span-1">
          <TodaysTasksWidget />
        </div>

        {/* Pomodoro Stats */}
        <div className="md:col-span-1">
          <PomodoroStatsWidget />
        </div>

        {/* Priority Tasks - Takes 2 columns on medium screens */}
        <div className="md:col-span-2 lg:col-span-1">
          <PriorityTasksWidget />
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-1">
          <RecentActivityWidget />
        </div>

        {/* Groups Overview */}
        <div className="md:col-span-1">
          <GroupsOverviewWidget />
        </div>
      </div>
    </div>
  )
}