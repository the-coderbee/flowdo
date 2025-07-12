"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { TaskDetailsPanel } from "./task-details-panel";
import { TasksPageHeader } from "./tasks-page-header";
import { TasksErrorDisplay } from "./tasks-error-display";
import { TasksErrorFallback } from "./tasks-error-fallback";
import { TasksLoadingState } from "./tasks-loading-state";
import { TasksEmptyState } from "./tasks-empty-state";
import { TasksToolbar } from "./tasks-toolbar";
import { TasksList } from "./tasks-list";
import { Task } from "@/types/task";
import {
  useTasksByRoute,
  useToggleTask,
  useDeleteTask,
  useStarTask,
} from "@/lib/hooks/use-task-queries";
import { getPageTitle } from "@/lib/utils/tasks";

interface TasksContentProps {
  onMobileSidebarToggle?: () => void;
  isMobileSidebarOpen?: boolean;
}

export function TasksContent({ onMobileSidebarToggle }: TasksContentProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  // React Query hooks
  const { data: tasksData, isLoading, error, refetch } = useTasksByRoute();
  const toggleTaskMutation = useToggleTask();
  const deleteTaskMutation = useDeleteTask();
  const starTaskMutation = useStarTask();
  // const updateTaskMutation = useUpdateTask() // TODO: Implement task editing functionality

  // Extract tasks from data
  const tasks = tasksData?.tasks || [];

  // Local state for UI
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const taskListRef = useRef<HTMLDivElement>(null);

  // Get selected task
  const selectedTask = selectedTaskId
    ? tasks.find((t) => t.id === selectedTaskId) || null
    : null;

  // Task operations
  const handleToggleComplete = async (taskId: number) => {
    try {
      await toggleTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleStarTask = async (taskId: number) => {
    try {
      await starTaskMutation.mutateAsync(taskId);
    } catch (error) {
      console.error("Error starring task:", error);
    }
  };

  // Subtask handlers
  const handleToggleSubtask = async (taskId: number, subtaskId: number) => {
    // TODO: Implement subtask toggle logic
    console.log("Toggle subtask:", taskId, subtaskId);
  };

  const handleUpdateSubtask = async (
    taskId: number,
    subtaskId: number,
    title: string
  ) => {
    // TODO: Implement subtask update logic
    console.log("Update subtask:", taskId, subtaskId, title);
  };

  const handleDeleteSubtask = async (taskId: number, subtaskId: number) => {
    // TODO: Implement subtask delete logic
    console.log("Delete subtask:", taskId, subtaskId);
  };

  // Click outside to deselect
  const handleTaskListClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the task list container, not on tasks
    if (e.target === taskListRef.current) {
      setSelectedTaskId(null);
    }
  };

  // Handle panel collapse and unselect task
  const handlePanelCollapse = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
    // Unselect task when minimizing the panel
    if (!isPanelCollapsed) {
      setSelectedTaskId(null);
    }
  };

  const pendingTasksCount = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "archived"
  ).length;

  const handleAddTask = () => {
    // Task creation handled by TaskCreationDialog
    // This callback is called after successful task creation
    console.log("Task created successfully");
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log("Filter tasks");
  };

  // Handle retry on error
  const handleRetry = () => {
    refetch();
  };

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
          error={error.message || "An error occurred"}
          onDismiss={() => {
            // React Query handles error state automatically
            // No manual error clearing needed
          }}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto p">
        {/* Loading State */}
        {isLoading && <TasksLoadingState />}

        {/* Error State */}
        {!isLoading && error && (
          <TasksErrorFallback
            error={error.message || "An error occurred"}
            onRetry={handleRetry}
          />
        )}

        {/* Content Layout */}
        {!isLoading && !error && (
          <div
            className="flex gap-8"
            onClick={(e) => {
              // Deselect task if clicking outside of task items or task details panel
              const target = e.target as HTMLElement;
              const isTaskItem = target.closest("[data-task-item]");
              const isTaskPanel = target.closest("[data-task-panel]");

              if (!isTaskItem && !isTaskPanel) {
                setSelectedTaskId(null);
              }
            }}
          >
            {/* Task List Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-6 px-6 w-full"
            >
              {/* Toolbar */}
              <TasksToolbar onAddTask={handleAddTask} onFilter={handleFilter} />

              {/* Tasks List */}
              <TasksList
                ref={taskListRef}
                tasks={tasks}
                selectedTaskId={selectedTaskId}
                onToggleComplete={handleToggleComplete}
                onTaskClick={handleTaskClick}
                onStarTask={handleStarTask}
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
                width: isPanelCollapsed ? "40px" : "400px",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-shrink-0"
              data-task-panel
            >
              <TaskDetailsPanel
                task={selectedTask}
                isCollapsed={isPanelCollapsed}
                onCollapse={handlePanelCollapse}
                onEdit={async (task) => {
                  // TODO: Implement edit modal or inline editing
                  console.log("Edit task:", task);
                }}
                onDelete={handleDeleteTask}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
