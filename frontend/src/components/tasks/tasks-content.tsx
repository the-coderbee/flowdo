"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Filter, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TaskItem } from "./task-item"
import { HorizontalTaskInput } from "./horizontal-task-input"
import { TaskModal } from "./task-modal"
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus, TaskPriority } from "@/types/task"

// Mock task data with proper typing
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Review project proposal",
    description: "Go through the client's project proposal and prepare feedback",
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    due_date: new Date().toISOString(),
    user_id: 1,
    estimated_pomodoros: 3,
    completed_pomodoros: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    group: { id: 1, name: "Work", user_id: 1, created_at: "", updated_at: "" },
    tags: [
      { id: 1, name: "urgent", user_id: 1, created_at: "", updated_at: "" },
      { id: 2, name: "client", user_id: 1, created_at: "", updated_at: "" }
    ]
  },
  {
    id: 2,
    title: "Buy groceries",
    description: "Milk, bread, eggs, vegetables",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    due_date: new Date(Date.now() + 86400000).toISOString(),
    user_id: 1,
    estimated_pomodoros: 1,
    completed_pomodoros: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    group: { id: 2, name: "Personal", user_id: 1, created_at: "", updated_at: "" }
  },
  {
    id: 3,
    title: "Complete workout routine",
    description: "30 minutes cardio + strength training",
    priority: TaskPriority.LOW,
    status: TaskStatus.COMPLETED,
    due_date: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    user_id: 1,
    estimated_pomodoros: 2,
    completed_pomodoros: 2,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    group: { id: 3, name: "Health", user_id: 1, created_at: "", updated_at: "" }
  },
  {
    id: 4,
    title: "Plan weekend trip",
    description: "Research destinations and book accommodation",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    user_id: 1,
    estimated_pomodoros: 4,
    completed_pomodoros: 1,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date().toISOString(),
    group: { id: 2, name: "Personal", user_id: 1, created_at: "", updated_at: "" },
    tags: [
      { id: 3, name: "travel", user_id: 1, created_at: "", updated_at: "" }
    ]
  }
]

function getPageTitle(pathname: string) {
  if (pathname === "/tasks") return "All Tasks"
  if (pathname === "/tasks/my-day") return "My Day"
  if (pathname === "/tasks/starred") return "Starred"
  if (pathname === "/tasks/pomodoro") return "Pomodoro Sessions"
  if (pathname === "/tasks/settings") return "Configurations"
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
  
  // State management
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  
  // Task operations
  const handleAddTask = (taskData: CreateTaskRequest) => {
    const newTask: Task = {
      id: Math.max(...tasks.map(t => t.id)) + 1,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      due_date: taskData.due_date,
      user_id: 1, // TODO: Get from auth context
      estimated_pomodoros: taskData.estimated_pomodoros,
      completed_pomodoros: 0,
      group_id: taskData.group_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setTasks(prev => [newTask, ...prev])
  }
  
  const handleToggleComplete = (taskId: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: task.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED,
            completed_at: task.status === TaskStatus.COMPLETED ? undefined : new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        : task
    ))
  }
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }
  
  const handleUpdateTask = (taskId: number, updates: UpdateTaskRequest) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updated_at: new Date().toISOString() }
        : task
    ))
    // Update selected task if it's the one being edited
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null)
    }
  }
  
  const handleDeleteTask = (taskId: number) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    setIsTaskModalOpen(false)
    setSelectedTask(null)
  }
  
  const pendingTasksCount = tasks.filter(t => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.ARCHIVED).length

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

        {/* Main Content with Sticky Input */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Scrollable Task List */}
          <div className="flex-1 overflow-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 py-6" // Full width, remove max-width constraint
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