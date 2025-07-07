"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Filter, Menu, AlertCircle, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TaskItem } from "./task-item"
import { TaskDetailsPanel } from "./task-details-panel"
import { Task } from "@/types/task"
import { useTask } from "@/contexts/task-context"


function getPageTitle(pathname: string) {
  if (pathname === "/tasks") return "All Tasks"
  if (pathname === "/my-day") return "My Day"
  if (pathname === "/starred") return "Starred"
  if (pathname === "/pomodoro") return "Pomodoro Sessions"
  if (pathname === "/settings") return "Configurations"
  if (pathname.startsWith("/tasks/groups/")) {
    const groupId = pathname.split("/").pop()
    return `${groupId?.charAt(0).toUpperCase()}${groupId?.slice(1)} Tasks`
  }
  return "Tasks"
}

interface TasksContentProps {
  onMobileSidebarToggle?: () => void
  isMobileSidebarOpen?: boolean
}

export function TasksContent({ onMobileSidebarToggle }: TasksContentProps) {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  
  // Task context
  const {
    tasks,
    loading,
    error,
    filters,
    deleteTask,
    toggleTaskCompletion,
    getTodaysTasks,
    getStarredTasks,
    clearError
  } = useTask()
  
  // Local state for UI
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const taskListRef = useRef<HTMLDivElement>(null)
  
  // Get selected task
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null
  
  // Load appropriate tasks based on the current page
  useEffect(() => {
    // Don't make additional calls if already loading
    if (loading) return
    
    // Only load specific data if not already loaded for this page
    if (pathname === "/my-day") {
      // Check if we already have today's tasks loaded
      const today = new Date().toISOString().split('T')[0]
      const hasCurrentFilters = filters.due_date_from === today
      if (!hasCurrentFilters) {
        getTodaysTasks()
      }
    } else if (pathname === "/starred") {
      // Check if we already have starred tasks loaded
      const hasStarredFilters = filters.priority && 
        Array.isArray(filters.priority) && 
        filters.priority.includes('high') && 
        filters.priority.includes('urgent')
      if (!hasStarredFilters) {
        getStarredTasks()
      }
    }
    // For regular /tasks page, let the context handle initial loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loading, filters]) // Remove function deps to prevent unnecessary re-renders
  
  // Task operations
  
  const handleToggleComplete = async (taskId: number) => {
    try {
      await toggleTaskCompletion(taskId)
    } catch (error) {
      console.error('Error toggling task completion:', error)
    }
  }
  
  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id)
  }
  
  
  const handleDeleteTask = async (taskId: number) => {
    try {
      const success = await deleteTask(taskId)
      if (success && selectedTaskId === taskId) {
        setSelectedTaskId(null)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
  
  // Subtask handlers
  const handleToggleSubtask = async (taskId: number, subtaskId: number) => {
    // TODO: Implement subtask toggle logic
    console.log('Toggle subtask:', taskId, subtaskId)
  }
  
  const handleUpdateSubtask = async (taskId: number, subtaskId: number, title: string) => {
    // TODO: Implement subtask update logic
    console.log('Update subtask:', taskId, subtaskId, title)
  }
  
  const handleDeleteSubtask = async (taskId: number, subtaskId: number) => {
    // TODO: Implement subtask delete logic
    console.log('Delete subtask:', taskId, subtaskId)
  }
  
  // Click outside to deselect
  const handleTaskListClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the task list container, not on tasks
    if (e.target === taskListRef.current) {
      setSelectedTaskId(null)
    }
  }
  
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived').length

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={onMobileSidebarToggle}
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div>
                <motion.h1 
                  key={pageTitle}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-foreground"
                >
                  {pageTitle}
                </motion.h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {pendingTasksCount} pending tasks
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mx-6 mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={clearError}
                className="ml-2 h-6 px-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content with Sticky Input */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading tasks...</span>
            </div>
          )}
          
          {/* Scrollable Task List */}
          {!loading && (
            <div className="flex gap-8 overflow-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="pt-6 w-full"
              >
                <div className="flex items-center gap-4 p-4">
                  <Button variant="default" size="lg" className="hidden sm:flex text-foreground bg-primary/70 hover:bg-primary/50 cursor-pointer">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Task
                  </Button>
                  <Button variant="outline" size="lg" className="hidden sm:flex cursor-pointer hover:text-foreground">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                  </Button>
                  {/* Mobile: Icon only buttons */}
                  {/* TODO: Add mobile search and filter buttons */}
                </div>
                {/* Task List */}
                <div ref={taskListRef} onClick={handleTaskListClick} className="space-y-1">
                  {tasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      index={index}
                      isSelected={selectedTaskId === task.id}
                      onToggleComplete={handleToggleComplete}
                      onClick={handleTaskClick}
                      onToggleSubtask={handleToggleSubtask}
                      onUpdateSubtask={handleUpdateSubtask}
                      onDeleteSubtask={handleDeleteSubtask}
                    />
                  ))}
                </div>

                {/* Empty State */}
                {tasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-muted-foreground">
                      <p className="text-lg font-medium">No tasks yet</p>
                      <p className="text-sm">Create your first task to get started</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Spacer for sticky input */}
                <div className="h-20" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  width: isPanelCollapsed ? "48px" : "576px"
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-shrink-0"
              >
                <TaskDetailsPanel
                  task={selectedTask}
                  isCollapsed={isPanelCollapsed}
                  onCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
                  onEdit={(task) => {
                    // TODO: Implement edit functionality
                    console.log('Edit task:', task)
                  }}
                  onDelete={handleDeleteTask}
                />
              </motion.div>
            </div>
          )}
          
        </div>
      </div>

    </>
  )
}