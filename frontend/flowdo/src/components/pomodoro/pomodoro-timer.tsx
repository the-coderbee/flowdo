'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PomodoroTimerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onSkip?: () => void;
  isPaused?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  initialRemainingTime?: number;
}

export function PomodoroTimer({
  duration,
  onComplete,
  onSkip,
  isPaused: externalIsPaused,
  size = 'md',
  className,
  initialRemainingTime
}: PomodoroTimerProps) {
  const [remainingTime, setRemainingTime] = useState(initialRemainingTime || duration);
  const [isActive, setIsActive] = useState(!externalIsPaused);
  const [isPaused, setIsPaused] = useState(externalIsPaused || false);
  
  // Calculate dimensions based on size
  const dimensions = {
    sm: { size: 120, strokeWidth: 6, fontSize: 'text-xl' },
    md: { size: 200, strokeWidth: 8, fontSize: 'text-3xl' },
    lg: { size: 300, strokeWidth: 10, fontSize: 'text-5xl' },
  }[size];
  
  // Calculate SVG properties
  const radius = (dimensions.size / 2) - (dimensions.strokeWidth * 1.5);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - remainingTime / duration);
  
  // Format time as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle external pause state changes
  useEffect(() => {
    if (externalIsPaused !== undefined) {
      setIsPaused(externalIsPaused);
      setIsActive(!externalIsPaused);
    }
  }, [externalIsPaused]);
  
  // Countdown timer effect
  useEffect(() => {
    if (!isActive || remainingTime <= 0) return;
    
    const intervalId = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isActive, remainingTime, onComplete]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    setIsPaused(!isPaused);
    setIsActive(!isActive);
  };
  
  // Handle skip
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };
  
  // Reset timer
  const resetTimer = () => {
    setRemainingTime(duration);
    setIsPaused(true);
    setIsActive(false);
  };
  
  // Calculate progress percentage
  const progressPercentage = (remainingTime / duration) * 100;
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative flex items-center justify-center">
        {/* Background circle */}
        <svg
          width={dimensions.size}
          height={dimensions.size}
          viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
          className="transform -rotate-90"
        >
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            strokeWidth={dimensions.strokeWidth}
            stroke="currentColor"
            fill="transparent"
            className="text-accent/30"
          />
          
          {/* Progress circle */}
          <circle
            cx={dimensions.size / 2}
            cy={dimensions.size / 2}
            r={radius}
            strokeWidth={dimensions.strokeWidth}
            stroke="currentColor"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              "transition-all duration-300",
              progressPercentage > 75 ? "text-primary" : 
              progressPercentage > 50 ? "text-purple-500" :
              progressPercentage > 25 ? "text-yellow-500" : "text-red-500"
            )}
          />
        </svg>
        
        {/* Timer text */}
        <div className="absolute flex flex-col items-center">
          <div className={cn("font-semibold", dimensions.fontSize)}>
            {formatTime(remainingTime)}
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            remaining
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full w-12 h-12" 
          onClick={resetTimer}
        >
          <RefreshCcw className="h-5 w-5" />
          <span className="sr-only">Reset Timer</span>
        </Button>
        
        <Button
          size="icon"
          variant={isPaused ? "default" : "secondary"}
          className="rounded-full w-14 h-14" 
          onClick={togglePlayPause}
        >
          {isPaused ? (
            <Play className="h-6 w-6 ml-1" />
          ) : (
            <Pause className="h-6 w-6" />
          )}
          <span className="sr-only">
            {isPaused ? "Start" : "Pause"}
          </span>
        </Button>
        
        {onSkip && (
          <Button
            size="icon"
            variant="outline"
            className="rounded-full w-12 h-12"
            onClick={handleSkip}
          >
            <SkipForward className="h-5 w-5" />
            <span className="sr-only">Skip</span>
          </Button>
        )}
      </div>
    </div>
  );
} 