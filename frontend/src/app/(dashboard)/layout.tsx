"use client"

import { useState } from "react"
import { Sidebar } from "@/components/tasks/sidebar"
import { TaskProvider } from "@/contexts/task-context"
import { GroupProvider } from "@/contexts/group-context"
import { LoadingProvider } from "@/contexts/loading-context"
import { ProfileHeader } from "@/components/dashboard/profile-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <LoadingProvider>
      <TaskProvider>
        <GroupProvider>
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
        </GroupProvider>
      </TaskProvider>
    </LoadingProvider>
  )
}