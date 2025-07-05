"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Filter, Menu, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TaskItem } from "./task-item"
import { HorizontalTaskInput } from "./horizontal-task-input"
import { TaskModal } from "./task-modal"
import { Task, CreateTaskRequest, UpdateTaskRequest } from "@/types/task"
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
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTodaysTasks,
    getStarredTasks,
    clearError
  } = useTask()
  
  // Local state for UI
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  
  // Load appropriate tasks based on the current page
  useEffect(() => {
    // Only load tasks if the page requires specific filtering
    if (pathname === "/my-day") {
      getTodaysTasks()
    } else if (pathname === "/starred") {
      getStarredTasks()
    }
    // For regular /tasks page, let the context handle initial loading
  }, [pathname, getTodaysTasks, getStarredTasks])
  
  // Task operations
  const handleAddTask = async (taskData: CreateTaskRequest) => {
    try {
      await createTask(taskData)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }
  
  const handleToggleComplete = async (taskId: number) => {
    try {
      const updatedTask = await toggleTaskCompletion(taskId)
      if (selectedTask?.id === taskId && updatedTask) {
        setSelectedTask(updatedTask)
      }
    } catch (error) {
      console.error('Error toggling task completion:', error)
    }
  }
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }
  
  const handleUpdateTask = async (taskId: number, updates: UpdateTaskRequest) => {
    try {
      const updatedTask = await updateTask(taskId, updates)
      if (selectedTask?.id === taskId && updatedTask) {
        setSelectedTask(updatedTask)
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }
  
  const handleDeleteTask = async (taskId: number) => {
    try {
      const success = await deleteTask(taskId)
      if (success) {
        setIsTaskModalOpen(false)
        setSelectedTask(null)
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }
  
  const pendingTasksCount = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived').length

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header - Remove Add Task Button */}
        <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-6">
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
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              {/* Mobile: Icon only buttons */}
              <Button variant="outline" size="sm" className="sm:hidden h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="sm:hidden h-8 w-8 p-0">
                <Filter className="h-4 w-4" />
              </Button>
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
            <div className="flex-1 overflow-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 py-6"
              >
                {/* Task List */}
                {tasks.map((task, index) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onToggleComplete={handleToggleComplete}
                    onClick={handleTaskClick}
                  />
                ))}

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
            </div>
          )}
          
          {/* Sticky Task Input at Bottom */}
          <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm p-6">
            <div className="pl-6"> {/* Same left padding as task items */}
              <HorizontalTaskInput onAdd={handleAddTask} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleUpdateTask}
        onDelete={handleDeleteTask}
        onToggleComplete={handleToggleComplete}
      />
    </>
  )
}