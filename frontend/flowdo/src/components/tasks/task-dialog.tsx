'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority, Tag } from '@/sample/tasks';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Edit, Timer, Calendar, Tag as TagIcon, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStartPomodoro?: (taskId: string) => void;
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export function TaskDialog({ task, isOpen, onClose, onEdit, onDelete, onStartPomodoro }: TaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (task) {
      setIsDeleting(true);
      // Simulate API call with timeout
      setTimeout(() => {
        onDelete(task.id);
        setIsDeleting(false);
        onClose();
      }, 500);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  if (!task) return null;

  const priorityColors: Record<TaskPriority, string> = {
    high: 'bg-red-500/10 text-red-700 dark:text-red-400',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    low: 'bg-green-500/10 text-green-700 dark:text-green-400',
    urgent: 'bg-red-700/10 text-red-800 dark:text-red-300',
  };
  
  // Sample subtasks - in a real app this would be part of the Task interface
  const subtasks: Subtask[] = [];
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-start">
            <div className="flex mr-3 mt-0.5">
              <Checkbox
                checked={task.completed}
                className="h-5 w-5 rounded-full"
              />
            </div>
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-sm flex items-center gap-1 mt-1">
            <Clock className="h-3.5 w-3.5" /> Created {formatDate(task.createdAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Priority & Due Date */}
          <div className="flex flex-wrap gap-4 items-center">
            {task.priority && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`px-2 py-1 ${priorityColors[task.priority]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Badge>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">Due: {formatDate(task.dueDate)}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">Pomodoros: {task.completedPomodoros}/{task.estimatedPomodoros}</span>
            </div>
          </div>
          
          {/* Description */}
          {task.description && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium">Description</h4>
              <div className="text-sm text-muted-foreground">
                {task.description}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium flex items-center">
                <TagIcon className="h-3.5 w-3.5 mr-1" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag: Tag) => (
                  <Badge key={tag.id} variant="secondary" className="px-2 text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Subtasks - Only show if we have any */}
          {subtasks.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-medium flex items-center">
                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                Subtasks
              </h4>
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`subtask-${subtask.id}`}
                      checked={subtask.completed}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`subtask-${subtask.id}`}
                      className={`text-sm ${
                        subtask.completed ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {subtask.title}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between sm:gap-0">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onClose()}
            >
              Close
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            {onStartPomodoro && (
              <Button 
                variant="secondary"
                className="gap-1"
                onClick={() => {
                  if (onStartPomodoro) onStartPomodoro(task.id);
                  onClose();
                }}
              >
                <Timer className="h-4 w-4" />
                Start Pomodoro
              </Button>
            )}
            <Button 
              onClick={() => {
                onEdit(task);
                onClose();
              }}
              className="gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 