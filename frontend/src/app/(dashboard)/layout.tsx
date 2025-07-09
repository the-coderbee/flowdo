"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { TaskProvider } from "@/lib/providers/task-provider"
import { GroupProvider } from "@/lib/providers/group-provider"
import { DashboardProvider } from "@/lib/providers/dashboard-provider"
import { ProfileHeader } from "@/components/features/dashboard/profile-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <TaskProvider>
      <GroupProvider>
        <DashboardProvider>
          <div className="min-h-screen bg-background">
            <div className="flex h-screen bg-background">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                <Sidebar />
              </div>
              
              {/* Mobile Sidebar Overlay */}
              {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                  <div 
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                  <div className="absolute left-0 top-0 bottom-0 w-80">
                    <Sidebar />
                  </div>
                </div>
              )}
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0">
                <ProfileHeader />
                <div className="flex-1 overflow-auto">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </DashboardProvider>
      </GroupProvider>
    </TaskProvider>
  )
}