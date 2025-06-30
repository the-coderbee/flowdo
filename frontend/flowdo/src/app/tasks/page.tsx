'use client';

import { useEffect, useState, useRef } from 'react';
import { TaskList } from '@/components/tasks/task-list';
import { useRouter } from 'next/navigation';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskComplete, TaskResponse, TaskCreateRequest, TaskPriority, TaskStatus } from '@/lib/task';

import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

// Adapter function to convert API response to frontend Task format
const adaptTaskFromApi = (apiTask: TaskResponse): Task => {
  return {
    id: apiTask.id.toString(),
    title: apiTask.title,
    description: apiTask.description || '',
    completed: apiTask.status === TaskStatus.COMPLETED,
    createdAt: apiTask.created_at || new Date().toISOString(),
    dueDate: apiTask.due_date,
    priority: (apiTask.priority?.toLowerCase() as Task['priority']) || 'medium',
    tags: [], // API doesn't provide tags yet
    estimatedPomodoros: apiTask.estimated_pomodoros || 1,
    completedPomodoros: apiTask.completed_pomodoros || 0,
    groupId: apiTask.group_id?.toString(),
  };
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false); // New state for controlling form visibility
  const router = useRouter();
  const { user } = useAuth();
  const taskListRef = useRef<HTMLDivElement>(null); // For scrolling to task list
  
  const fetchTasks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const apiTasks = await getTasks(user.id);
      const adaptedTasks = apiTasks.map(adaptTaskFromApi);
      setTasks(adaptedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks. Please try again later.');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [user]);
  
  const handleTaskUpdate = async (updatedTask: Task) => {
    if (!user) return;
    
    try {
      const taskId = parseInt(updatedTask.id);
      
      // Convert frontend task to API format
      const apiTask = {
        id: taskId,
        title: updatedTask.title,
        description: updatedTask.description || null,
        // Explicitly make sure the priority is lowercase string
        priority: updatedTask.priority ? updatedTask.priority.toString().toLowerCase() as TaskPriority : null,
        status: updatedTask.completed ? TaskStatus.COMPLETED : TaskStatus.PENDING,
        due_date: updatedTask.dueDate,
        estimated_pomodoros: updatedTask.estimatedPomodoros,
        completed_pomodoros: updatedTask.completedPomodoros,
      };
      
      const updated = await updateTask(apiTask);
      
      // Update local state with updated task
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === updatedTask.id ? adaptTaskFromApi(updated) : task
        )
      );
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };
  
  const handleTaskCreate = async (newTask: Partial<Task>) => {
    if (!user) return;
    
    try {
      // Convert frontend task to API format
      const apiTask: TaskCreateRequest = {
        title: newTask.title || 'New Task',
        description: newTask.description || null,
        // Make sure priority is explicitly converted to lowercase string
        priority: newTask.priority ? newTask.priority.toString().toLowerCase() as TaskPriority : null,
        status: TaskStatus.PENDING,
        due_date: newTask.dueDate || null,
        estimated_pomodoros: newTask.estimatedPomodoros || 1,
        completed_pomodoros: 0,
        user_id: user.id,
        group_id: newTask.groupId ? parseInt(newTask.groupId) : null,
      };
      
      const createdTask = await createTask(apiTask);
      const adaptedTask = adaptTaskFromApi(createdTask);
      
      setTasks(prevTasks => [adaptedTask, ...prevTasks]);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    }
  };
  
  const handleTaskDelete = async (taskId: string) => {
    try {
      const id = parseInt(taskId);
      await deleteTask(id);
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };
  
  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    try {
      const id = parseInt(taskId);
      const updated = await toggleTaskComplete(id, completed);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? adaptTaskFromApi(updated) : task
        )
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
    }
  };
  
  const handleStartPomodoro = (taskId: string) => {
    router.push(`/pomodoro?taskId=${taskId}`);
  };

  // Function to open the task creation form
  const handleOpenNewTaskForm = () => {
    setIsTaskFormOpen(true);
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-40 gap-4">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={fetchTasks}>
            Try Again
          </Button>
        </div>
      );
    }
    
    if (!user) {
      return (
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Please log in to view your tasks</p>
        </div>
      );
    }
    
    return (
      <div ref={taskListRef}>
        <TaskList 
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskCreate={handleTaskCreate}
          onTaskDelete={handleTaskDelete}
          onToggleComplete={handleToggleComplete}
          isFormOpen={isTaskFormOpen}
          setIsFormOpen={setIsTaskFormOpen}
        />
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
        {!loading && user && (
          <Button 
            onClick={handleOpenNewTaskForm} 
            className="gap-1"
          >
            <Plus className="h-4 w-4" /> 
            New Task
          </Button>
        )}
      </div>
      
      {renderContent()}
    </div>
  );
} 