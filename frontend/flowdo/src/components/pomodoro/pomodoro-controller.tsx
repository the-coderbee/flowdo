'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PomodoroTimer } from './pomodoro-timer';
import { PomodoroForm, PomodoroSettings } from './pomodoro-form';
import { Task } from '@/sample/tasks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PomodoroStatus = 'idle' | 'focus' | 'break' | 'completed';

export interface PomodoroSessionProps {
  tasks: Task[];
  onCompletePomodoro?: (taskId: string) => void;
}

export function PomodoroController({ tasks, onCompletePomodoro }: PomodoroSessionProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [status, setStatus] = useState<PomodoroStatus>('idle');
  const [settings, setSettings] = useState<PomodoroSettings | null>(null);
  const [currentSession, setCurrentSession] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Find the current task if one is selected
  const currentTask = settings?.taskId 
    ? tasks.find(t => t.id === settings.taskId) 
    : null;
  
  // Handle starting a new Pomodoro session
  const handleStart = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    setCurrentSession(1);
    setStatus('focus');
    setIsPaused(false);
    
    // Request notification permission if not yet granted
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };
  
  // Handle completing a focus session
  const handleFocusComplete = () => {
    // Play sound
    try {
      const audio = new Audio('/sounds/bell.mp3');
      audio.play().catch(() => {
        // Fallback for browsers that block autoplay
        console.log('Audio play was prevented');
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
    
    // Send notification
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Focus session completed!', {
        body: 'Time for a break.',
        icon: '/images/brand/logo-nobg.png'
      });
    }
    
    // Update completed pomodoro count if task is selected
    if (settings?.taskId && onCompletePomodoro) {
      onCompletePomodoro(settings.taskId);
    }
    
    // If this was the last session, complete the whole thing
    if (settings && currentSession >= settings.sessionsCount) {
      setStatus('completed');
    } else {
      setStatus('break');
    }
  };
  
  // Handle completing a break
  const handleBreakComplete = () => {
    // Play sound
    try {
      const audio = new Audio('/sounds/bell.mp3');
      audio.play().catch(() => {
        console.log('Audio play was prevented');
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
    
    // Send notification
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Break time is over!', {
        body: 'Time to focus again.',
        icon: '/images/brand/logo-nobg.png'
      });
    }
    
    setCurrentSession(currentSession + 1);
    setStatus('focus');
  };
  
  // Handle skipping current session
  const handleSkip = () => {
    if (status === 'focus') {
      handleFocusComplete();
    } else if (status === 'break') {
      handleBreakComplete();
    }
  };
  
  // Reset session
  const handleReset = () => {
    setStatus('idle');
    setSettings(null);
    setCurrentSession(1);
  };
  
  // Toggle pause state
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };
  
  // Return to task if task is selected
  const handleGoToTask = () => {
    if (settings?.taskId) {
      router.push(`/tasks?id=${settings.taskId}`);
    }
  };
  
  return (
    <div className="mx-auto max-w-3xl">
      {status === 'idle' ? (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
            <p className="text-muted-foreground">
              Use the Pomodoro Technique to boost your productivity
            </p>
          </div>
          
          <Card className="border-2 border-dashed border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <Settings className="w-5 h-5 mr-2" /> Configure Your Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full text-lg"
                size="lg"
              >
                Start New Pomodoro
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Start Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card 
              className="border cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleStart({
                taskId: null,
                focusDuration: 25 * 60,
                breakDuration: 5 * 60,
                sessionsCount: 4
              })}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span>Focus:</span>
                    <span className="font-medium">25 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break:</span>
                    <span className="font-medium">5 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">4</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="border cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleStart({
                taskId: null,
                focusDuration: 45 * 60,
                breakDuration: 10 * 60,
                sessionsCount: 3
              })}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Extended Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span>Focus:</span>
                    <span className="font-medium">45 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break:</span>
                    <span className="font-medium">10 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="border cursor-pointer hover:border-primary transition-colors"
              onClick={() => handleStart({
                taskId: null,
                focusDuration: 15 * 60,
                breakDuration: 3 * 60,
                sessionsCount: 6
              })}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Short Bursts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-1 text-sm">
                  <div className="flex justify-between">
                    <span>Focus:</span>
                    <span className="font-medium">15 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Break:</span>
                    <span className="font-medium">3 mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">6</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Session status indicator */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="rounded-full h-9 w-9"
            >
              <span className="sr-only">Return</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Button>
            
            <div className="text-center">
              {status === 'focus' && (
                <h2 className="text-xl font-medium">
                  Focus Session {currentSession}/{settings?.sessionsCount || 1}
                </h2>
              )}
              {status === 'break' && (
                <h2 className="text-xl font-medium">
                  Break Time {currentSession}/{settings?.sessionsCount || 1}
                </h2>
              )}
              {status === 'completed' && (
                <h2 className="text-xl font-medium">
                  Session Completed!
                </h2>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(true)}
              className="rounded-full h-9 w-9"
            >
              <span className="sr-only">Settings</span>
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Task info if present */}
          {currentTask && (
            <Card 
              className="border mb-4 cursor-pointer hover:border-primary transition-all"
              onClick={handleGoToTask}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-grow">
                    <h3 className="font-medium text-lg">Current Task</h3>
                    <p className="text-muted-foreground text-base truncate">
                      {currentTask.title}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {currentTask.completedPomodoros}/{currentTask.estimatedPomodoros}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex flex-col items-center justify-center">
            {status === 'focus' && settings && (
              <PomodoroTimer
                duration={settings.focusDuration}
                onComplete={handleFocusComplete}
                onSkip={handleSkip}
                isPaused={isPaused}
                size="lg"
                className="mb-4"
              />
            )}
            
            {status === 'break' && settings && (
              <PomodoroTimer
                duration={settings.breakDuration}
                onComplete={handleBreakComplete}
                onSkip={handleSkip}
                isPaused={isPaused}
                size="lg"
                className="mb-4"
              />
            )}
            
            {status === 'completed' && (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 p-6 mb-6">
                  <Check className="h-12 w-12 text-green-700 dark:text-green-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Great job!</h3>
                <p className="text-muted-foreground mb-6">
                  You've completed all your pomodoro sessions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => {
                      if (settings) {
                        handleStart(settings);
                      }
                    }}
                  >
                    Repeat Session
                  </Button>
                  <Button size="lg" onClick={handleReset}>
                    New Session
                  </Button>
                </div>
              </div>
            )}
            
            {/* Session controls */}
            {(status === 'focus' || status === 'break') && (
              <div className="flex gap-4">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-muted-foreground"
                  onClick={handleTogglePause}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  size="lg"
                  onClick={handleSkip}
                >
                  Skip
                </Button>
              </div>
            )}
          </div>
          
          {/* Session progress indicators */}
          {(status === 'focus' || status === 'break') && settings && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: settings.sessionsCount }).map((_, index) => {
                // Current session is active
                const isCurrent = index + 1 === currentSession;
                // Past sessions are completed
                const isCompleted = index + 1 < currentSession;
                // Session is focus or break
                const isBreak = index + 1 === currentSession && status === 'break';
                
                return (
                  <div 
                    key={index}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all",
                      isBreak ? "bg-blue-500" :
                      isCurrent ? "bg-primary ring-2 ring-primary/30" :
                      isCompleted ? "bg-green-500" : 
                      "bg-accent"
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Pomodoro Setup Form */}
      {showForm && (
        <PomodoroForm
          open={showForm}
          onOpenChange={setShowForm}
          onSubmit={handleStart}
          initialSettings={settings || undefined}
          tasks={tasks}
        />
      )}
    </div>
  );
} 