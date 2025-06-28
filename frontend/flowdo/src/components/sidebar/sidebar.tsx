'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, ListTodo, Timer, Calendar, Settings, Star, FolderClosed } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from "@/components/ui/button";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  className?: string;
  onCollapsedChange?: (collapsed: boolean) => void;
  defaultCollapsed?: boolean;
}

export function Sidebar({ className, onCollapsedChange, defaultCollapsed = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const pathname = usePathname();
  
  // Update parent component when collapsed state changes
  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
  }, [collapsed, onCollapsedChange]);
  
  // Get collapsed state from localStorage on mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      const isCollapsed = JSON.parse(savedCollapsed);
      setCollapsed(isCollapsed);
      if (onCollapsedChange) {
        onCollapsedChange(isCollapsed);
      }
    }
  }, [onCollapsedChange]);
  
  const toggleSidebar = () => {
    const newCollapsedState = !collapsed;
    setCollapsed(newCollapsedState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newCollapsedState));
  };

  const menuItems: SidebarItem[] = [
    { icon: <Home size={22} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <ListTodo size={22} />, label: 'Tasks', href: '/tasks' },
    { icon: <Timer size={22} />, label: 'Pomodoro', href: '/pomodoro' },
    { icon: <Calendar size={22} />, label: 'Calendar', href: '/calendar' },
    { icon: <Star size={22} />, label: 'Favorites', href: '/favorites' },
    { icon: <FolderClosed size={22} />, label: 'Projects', href: '/projects' },
  ];

  return (
    <aside 
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-border transition-all duration-300 ease-in-out z-40',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-end p-2 border-b border-border">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              
              return (
                <li key={item.href} className="group">
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-md p-2.5 text-foreground transition-colors relative',
                      collapsed ? 'justify-center' : 'px-3',
                      isActive 
                        ? 'bg-primary/10 text-primary font-medium' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {isActive && (
                      <span 
                        className={cn(
                          "absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full transition-all",
                          collapsed ? "opacity-100" : "opacity-100"
                        )}
                      />
                    )}
                    <span className={cn(
                      "flex-shrink-0 transition-transform",
                      isActive ? "scale-110" : "group-hover:scale-105"
                    )}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className={cn(
                        "ml-3 text-base font-medium transition-all", 
                        isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100",
                      )}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto px-2 pt-4 border-t border-border mt-4">
            <Link
              href="/settings"
              className={cn(
                'flex items-center rounded-md p-2.5 text-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
                collapsed ? 'justify-center' : 'px-3'
              )}
            >
              <span className="flex-shrink-0"><Settings size={22} /></span>
              {!collapsed && (
                <span className="ml-3 text-base font-medium">
                  Settings
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
} 