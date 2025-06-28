'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar/sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration issues by mounting only on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSidebarCollapsedChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (!mounted) {
    return (
      <div className="pt-16">
        <main className="min-h-[calc(100vh-4rem)] pt-6 px-6">{children}</main>
      </div>
    );
  }

  return (
    <div className="pt-16"> {/* Add padding top to account for fixed navbar */}
      <Sidebar onCollapsedChange={handleSidebarCollapsedChange} />
      <main 
        className={cn(
          "min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out pt-6 px-6",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        {children}
      </main>
    </div>
  );
} 