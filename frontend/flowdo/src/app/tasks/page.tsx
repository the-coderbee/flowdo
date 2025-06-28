'use client';

import { useState } from 'react';
import { sampleTasks, Task } from '@/sample/tasks';
import { TaskList } from '@/components/tasks/task-list';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const router = useRouter();
  
  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };
  
  const handleTaskCreate = (newTask: Partial<Task>) => {
    const createdAt = new Date().toISOString();
    
    const task: Task = {
      id: uuidv4(),
      title: newTask.title || 'New Task',
      description: newTask.description || '',
      completed: false,
      createdAt,
      dueDate: newTask.dueDate || null,
      priority: newTask.priority || 'medium',
      tags: newTask.tags || [],
      estimatedPomodoros: newTask.estimatedPomodoros || 1,
      completedPomodoros: 0,
      groupId: newTask.groupId,
    };
    
    setTasks(prevTasks => [task, ...prevTasks]);
  };
  
  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  
  const handleStartPomodoro = (taskId: string) => {
    router.push(`/pomodoro?taskId=${taskId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>
      
      <TaskList 
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskCreate={handleTaskCreate}
      />
    </div>
  );
} 