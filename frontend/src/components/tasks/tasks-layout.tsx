"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { TasksContent } from "./tasks-content"

export function TasksLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
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
        <TasksContent 
          onMobileSidebarToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isMobileSidebarOpen={isMobileSidebarOpen}
        />
      </div>
    </div>
  )
}