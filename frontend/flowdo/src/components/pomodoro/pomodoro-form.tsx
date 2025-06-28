'use client';

import React, { useState } from 'react';
import { Task, sampleTasks } from '@/sample/tasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Coffee, Timer } from 'lucide-react';

export interface PomodoroSettings {
  taskId: string | null;
  focusDuration: number; // in seconds
  breakDuration: number; // in seconds
  sessionsCount: number;
}

interface PomodoroFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (settings: PomodoroSettings) => void;
  initialSettings?: Partial<PomodoroSettings>;
  tasks: Task[];
}

export function PomodoroForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialSettings,
  tasks
}: PomodoroFormProps) {
  const defaultSettings: PomodoroSettings = {
    taskId: null,
    focusDuration: 25 * 60, // 25 minutes in seconds
    breakDuration: 5 * 60, // 5 minutes in seconds
    sessionsCount: 4,
  };
  
  const [settings, setSettings] = useState<PomodoroSettings>({
    ...defaultSettings,
    ...initialSettings
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'focusDurationMinutes') {
      setSettings({
        ...settings,
        focusDuration: parseInt(value) * 60
      });
    } else if (name === 'breakDurationMinutes') {
      setSettings({
        ...settings,
        breakDuration: parseInt(value) * 60
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(settings);
    onOpenChange(false);
  };
  
  // Convert seconds to minutes for form display
  const focusDurationMinutes = Math.floor(settings.focusDuration / 60);
  const breakDurationMinutes = Math.floor(settings.breakDuration / 60);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Set Up Pomodoro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Task Selection */}
          <div className="space-y-2">
            <label htmlFor="taskId" className="flex items-center text-base font-medium">
              <Timer className="mr-2 h-5 w-5 text-primary" />
              Select Task
            </label>
            <select
              id="taskId"
              name="taskId"
              value={settings.taskId || ''}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2.5 text-base focus:outline-none focus:ring-1 focus:ring-primary bg-background"
            >
              <option value="">No Specific Task</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.completedPomodoros}/{task.estimatedPomodoros})
                </option>
              ))}
            </select>
          </div>
          
          {/* Focus Duration */}
          <div className="space-y-2">
            <label htmlFor="focusDurationMinutes" className="flex items-center text-base font-medium">
              <Clock className="mr-2 h-5 w-5 text-primary" />
              Focus Duration (minutes)
            </label>
            <div className="flex items-center">
              <input
                id="focusDurationMinutes"
                name="focusDurationMinutes"
                type="range"
                min="5"
                max="60"
                step="5"
                value={focusDurationMinutes}
                onChange={handleChange}
                className="flex-1 h-2 rounded-full accent-primary bg-accent"
              />
              <span className="w-16 text-center text-base ml-3">{focusDurationMinutes} min</span>
            </div>
            
            <div className="flex justify-between mt-2">
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, focusDuration: 15 * 60})}
              >
                15m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, focusDuration: 25 * 60})}
              >
                25m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, focusDuration: 45 * 60})}
              >
                45m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, focusDuration: 60 * 60})}
              >
                60m
              </button>
            </div>
          </div>
          
          {/* Break Duration */}
          <div className="space-y-2">
            <label htmlFor="breakDurationMinutes" className="flex items-center text-base font-medium">
              <Coffee className="mr-2 h-5 w-5 text-primary" />
              Break Duration (minutes)
            </label>
            <div className="flex items-center">
              <input
                id="breakDurationMinutes"
                name="breakDurationMinutes"
                type="range"
                min="1"
                max="30"
                step="1"
                value={breakDurationMinutes}
                onChange={handleChange}
                className="flex-1 h-2 rounded-full accent-primary bg-accent"
              />
              <span className="w-16 text-center text-base ml-3">{breakDurationMinutes} min</span>
            </div>
            
            <div className="flex justify-between mt-2">
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, breakDuration: 3 * 60})}
              >
                3m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, breakDuration: 5 * 60})}
              >
                5m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, breakDuration: 10 * 60})}
              >
                10m
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, breakDuration: 15 * 60})}
              >
                15m
              </button>
            </div>
          </div>
          
          {/* Sessions Count */}
          <div className="space-y-2">
            <label htmlFor="sessionsCount" className="flex items-center text-base font-medium">
              <span className="mr-2 bg-primary/10 text-primary rounded-md p-1 text-sm font-bold">#</span>
              Number of Sessions
            </label>
            <div className="flex items-center">
              <input
                id="sessionsCount"
                name="sessionsCount"
                type="range"
                min="1"
                max="10"
                value={settings.sessionsCount}
                onChange={handleChange}
                className="flex-1 h-2 rounded-full accent-primary bg-accent"
              />
              <span className="w-16 text-center text-base ml-3">{settings.sessionsCount}</span>
            </div>
            
            <div className="flex justify-between mt-2">
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, sessionsCount: 2})}
              >
                2
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, sessionsCount: 4})}
              >
                4
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, sessionsCount: 6})}
              >
                6
              </button>
              <button 
                type="button" 
                className="text-sm text-muted-foreground px-2 py-1 hover:bg-accent rounded-md"
                onClick={() => setSettings({...settings, sessionsCount: 8})}
              >
                8
              </button>
            </div>
          </div>
          
          {/* Total Time Calculation */}
          <div className="p-4 bg-accent/20 rounded-md text-center">
            <div className="text-muted-foreground mb-1">Total Work Time</div>
            <div className="text-lg font-bold">
              {Math.floor((settings.focusDuration * settings.sessionsCount) / 60)} minutes
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-base"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="text-base"
            >
              Start Pomodoro
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 