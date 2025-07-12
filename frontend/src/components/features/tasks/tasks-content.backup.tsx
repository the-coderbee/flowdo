"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { TaskDetailsPanel } from "./task-details-panel"
import { TasksPageHeader } from "./tasks-page-header"
import { TasksErrorDisplay } from "./tasks-error-display"
import { TasksErrorFallback } from "./tasks-error-fallback"
import { TasksLoadingState } from "./tasks-loading-state"
import { TasksEmptyState } from "./tasks-empty-state"
import { TasksToolbar } from "./tasks-toolbar"
import { TasksList } from "./tasks-list"
import { Task } from "@/types/task"
import { useTask } from "@/lib/providers/task-provider"
import { getPageTitle } from "@/lib/utils/tasks"

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
    fetchTasks,
    deleteTask,
    toggleTaskCompletion,
    getStarredTasks,
    getMyDayTasks,
    clearError
  } = useTask()
  
  // Local state for UI
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const taskListRef = useRef<HTMLDivElement>(null)
  
  // Track initial fetch to prevent multiple calls
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // Get selected task
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null
  
  // Reset initialization flag when route changes  
  useEffect(() => {
    setHasInitialized(false)
  }, [pathname])

  // Load appropriate tasks based on the current page - only once per route
  useEffect(() => {
    // Don't make additional calls if already loading or already initialized for this route
    if (loading || hasInitialized) return
    
    // Load tasks based on the route
    if (pathname === "/my-day") {
      setHasInitialized(true)
      getMyDayTasks()
    } else if (pathname === "/starred") {
      setHasInitialized(true)
      getStarredTasks()
    }
    // For regular /tasks page, let the context handle initial loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loading, hasInitialized]) // Remove function dependencies to prevent infinite loops
  
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

  const handleAddTask = () => {
    // TODO: Implement add task functionality
    console.log('Add task')
  }

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log('Filter tasks')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <TasksPageHeader
        pageTitle={pageTitle}
        pendingTasksCount={pendingTasksCount}
        onMobileSidebarToggle={onMobileSidebarToggle}
      />

      {/* Error Display */}
      {error && (
        <TasksErrorDisplay
          error={error}
          onDismiss={clearError}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Loading State */}
        {loading && <TasksLoadingState />}
        
        {/* Error State */}
        {!loading && error && (
          <TasksErrorFallback
            error={error}
            onRetry={() => {
              clearError()
              fetchTasks(filters, 1)
            }}
          />
        )}
        
        {/* Content Layout */}
        {!loading && !error && (
          <div className="flex gap-8 overflow-auto px-6">
            {/* Task List Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-6 w-full"
            >
              {/* Toolbar */}
              <TasksToolbar
                onAddTask={handleAddTask}
                onFilter={handleFilter}
              />

              {/* Tasks List */}
              <TasksList
                ref={taskListRef}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onToggleComplete={handleToggleComplete}
                onTaskClick={handleTaskClick}
                onToggleSubtask={handleToggleSubtask}
                onUpdateSubtask={handleUpdateSubtask}
                onDeleteSubtask={handleDeleteSubtask}
                onContainerClick={handleTaskListClick}
              />

              {/* Empty State */}
              {tasks.length === 0 && <TasksEmptyState />}
              
              {/* Spacer */}
              <div className="h-20" />
            </motion.div>

            {/* Details Panel */}
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
  )
}