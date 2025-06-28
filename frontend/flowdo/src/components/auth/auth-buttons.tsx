'use client';

import React from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AuthButtons() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <Button variant="ghost" className="ml-2" disabled>
        <span className="animate-pulse">...</span>
      </Button>
    );
  }

  // User is authenticated
  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full ml-2">
            <Avatar>
              <AvatarFallback>
                {user.display_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href="/dashboard">
            <DropdownMenuItem>Dashboard</DropdownMenuItem>
          </Link>
          <Link href="/profile">
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // User is not authenticated
  return (
    <div className="flex space-x-2 ml-2">
      <Link href="/login">
        <Button variant="secondary">Login</Button>
      </Link>
      <Link href="/register">
        <Button>Sign Up</Button>
      </Link>
    </div>
  );
} 