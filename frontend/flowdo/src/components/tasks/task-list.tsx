'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TaskItem } from './task-item';
import { TaskDialog } from './task-dialog';
import { TaskForm } from './task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ClipboardList } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define Task interface locally
interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  dueDate: string | null;
  priority: string;
  tags: Tag[];
  estimatedPomodoros: number;
  completedPomodoros: number;
  groupId?: string;
}

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  isFormOpen?: boolean;
  setIsFormOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function TaskList({ 
  tasks, 
  onTaskUpdate, 
  onTaskCreate, 
  onTaskDelete, 
  onToggleComplete,
  isFormOpen,
  setIsFormOpen
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const router = useRouter();

  // Sync local and parent form state
  useEffect(() => {
    if (isFormOpen !== undefined) {
      setIsTaskFormOpen(isFormOpen);
    }
  }, [isFormOpen]);

  // Sync back to parent when local state changes
  useEffect(() => {
    if (setIsFormOpen && isTaskFormOpen !== isFormOpen) {
      setIsFormOpen(isTaskFormOpen);
    }
  }, [isTaskFormOpen, setIsFormOpen, isFormOpen]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (task.tags && task.tags.some(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );
  
  // Handle task click
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  // Close task dialog
  const handleCloseDialog = () => {
    setIsTaskDialogOpen(false);
    setSelectedTask(null);
  };
  
  // Handle task deletion
  const handleDeleteTask = (taskId: string) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    }
  };
  
  // Handle task edit
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };
  
  // Toggle task completion
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    if (onToggleComplete) {
      onToggleComplete(taskId, completed);
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        onTaskUpdate({
          ...task,
          completed
        });
      }
    }
  };
  
  // Handle task form submission
  const handleTaskFormSubmit = (taskData: Partial<Task>) => {
    if (taskToEdit) {
      onTaskUpdate({
        ...taskToEdit,
        ...taskData
      } as Task);
    } else {
      onTaskCreate(taskData);
    }
    
    setIsTaskFormOpen(false);
    setTaskToEdit(undefined);
  };
  
  // Start pomodoro for specific task
  const handleStartPomodoro = (taskId: string) => {
    router.push(`/pomodoro?taskId=${taskId}`);
  };

  // Create a new task button handler
  const handleCreateNewTask = () => {
    setTaskToEdit(undefined);
    setIsTaskFormOpen(true);
  };
  
  // Render empty state
  const renderEmptyState = () => {
    if (searchQuery) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            Try a different search query
          </p>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Create your first task to get started with organizing your work
        </p>
        <Button onClick={handleCreateNewTask} className="gap-2">
          <Plus className="h-4 w-4" /> 
          Create your first task
        </Button>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col">
      {/* Search and Add Task */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <Button 
          onClick={handleCreateNewTask}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> 
          Add Task
        </Button>
      </div>
      
      {/* Task List */}
      {filteredTasks.length === 0 ? (
        renderEmptyState()
      ) : (
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
      
      {/* Task Detail Dialog */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={handleCloseDialog}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onStartPomodoro={handleStartPomodoro}
        />
      )}
      
      {/* Create/Edit Task Form */}
      <TaskForm
        initialTask={taskToEdit}
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        onSubmit={handleTaskFormSubmit}
        mode={taskToEdit ? 'edit' : 'create'}
      />
    </div>
  );
} 