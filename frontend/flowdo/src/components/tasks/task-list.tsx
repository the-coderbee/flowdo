'use client';

import React, { useState } from 'react';
import { Task } from '@/sample/tasks';
import { TaskItem } from './task-item';
import { TaskDialog } from './task-dialog';
import { TaskForm } from './task-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Partial<Task>) => void;
}

export function TaskList({ tasks, onTaskUpdate, onTaskCreate }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | undefined>(undefined);
  const router = useRouter();
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.tags.some(tag => 
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
    // In a real app, you would call an API to delete the task
    // For now, we'll just remove it from the local state
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    // Update the parent component
  };
  
  // Handle task edit
  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskFormOpen(true);
  };
  
  // Toggle task completion
  const handleToggleComplete = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onTaskUpdate({
        ...task,
        completed
      });
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
          onClick={() => {
            setTaskToEdit(undefined);
            setIsTaskFormOpen(true);
          }}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> 
          Add Task
        </Button>
      </div>
      
      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try a different search query' : 'Click "Add Task" to create a new task'}
          </p>
        </div>
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