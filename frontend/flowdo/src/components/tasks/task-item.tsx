'use client';

import React from 'react';
import { Task, Tag } from '@/sample/tasks';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Timer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onRemoveTag?: (taskId: string, tagId: string) => void;
  onClick?: () => void;
}

export function TaskItem({ 
  task, 
  onToggleComplete,
  onRemoveTag,
  onClick
}: TaskItemProps) {
  
  const handleCheckboxChange = (checked: boolean) => {
    onToggleComplete(task.id, checked);
  };
  
  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveTag) {
      onRemoveTag(task.id, tagId);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Task priority colors
  const priorityColors = {
    low: 'bg-green-100 dark:bg-green-950',
    medium: 'bg-yellow-100 dark:bg-yellow-950',
    high: 'bg-red-100 dark:bg-red-950',
    urgent: 'bg-red-200 dark:bg-red-900',
  };
  
  return (
    <div 
      className={cn(
        "flex p-4 rounded-lg border border-border transition-colors",
        task.completed ? "bg-muted/30" : "bg-card hover:border-primary/50",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
      onClick={onClick}
    >
      {/* Checkbox column */}
      <div className="mr-4 flex items-start pt-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleCheckboxChange}
          className="h-5 w-5 rounded-full"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
      
      {/* Content column */}
      <div className="flex-grow">
        {/* Title row */}
        <div className="flex justify-between items-center">
          <h3 
            className={cn(
              "text-lg font-medium",
              task.completed && "text-muted-foreground line-through",
              "hover:underline"
            )}
          >
            {task.title}
          </h3>
          
          {/* Priority indicator */}
          {task.priority && (
            <div 
              className={cn(
                "text-sm font-medium px-3 py-1 rounded-full",
                priorityColors[task.priority]
              )}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </div>
          )}
        </div>
        
        {/* Task metadata */}
        <div className="flex flex-wrap gap-y-2 items-center mt-2">
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mr-auto">
              {task.tags.map((tag: Tag) => (
                <Badge 
                  key={tag.id} 
                  variant="outline"
                  className={cn(
                    "px-2 text-xs flex items-center gap-1 group",
                    tag.color === "red" && "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
                    tag.color === "blue" && "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200", 
                    tag.color === "green" && "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
                    tag.color === "yellow" && "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
                    tag.color === "purple" && "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200",
                    !tag.color && "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                  )}
                >
                  {tag.name}
                  {onRemoveTag && (
                    <X 
                      className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(tag.id, e);
                      }}
                    />
                  )}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Pomodoro counter */}
          {(task.estimatedPomodoros > 0 || task.completedPomodoros > 0) && (
            <div className="flex items-center mr-4">
              <Timer className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>
          )}
          
          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              <span className="text-xs text-muted-foreground">
                Due: {formatDate(task.dueDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 