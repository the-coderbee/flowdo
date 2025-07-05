"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/tasks/sidebar"
import { TaskProvider } from "@/contexts/task-context"
import { GroupProvider } from "@/contexts/group-context"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <TaskProvider>
      <GroupProvider>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex h-screen bg-background pt-16">
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
                <div className="absolute left-0 top-16 bottom-0 w-80">
                  <Sidebar />
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 p-6 overflow-auto">
                {children}
              </div>
            </div>
          </div>
        </div>
      </GroupProvider>
    </TaskProvider>
  )
}