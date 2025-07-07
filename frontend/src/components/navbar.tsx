"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  
  const { user, logout } = useAuth()
  
  // Debug logging
  console.log('[Navbar] Auth state:', { user: !!user, userEmail: user?.email })

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
            >
              Home
            </Link>
            {user && (
              <Link 
                href="/tasks" 
                className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
              >
                Tasks
              </Link>
            )}
            <Link 
              href="/support" 
              className="text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium"
            >
              Support
            </Link>
            <ThemeToggle />
            
            {/* Authentication UI */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user.display_name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button 
                    size="sm"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground/80 hover:text-foreground"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-md border-b border-border/40",
        isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
      )}>
        <div className="px-4 py-4 space-y-4">
          <Link 
            href="/" 
            className="block text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          {user && (
            <Link 
              href="/tasks" 
              className="block text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium py-2"
              onClick={() => setIsOpen(false)}
            >
              Tasks
            </Link>
          )}
          <Link 
            href="/support" 
            className="block text-foreground/80 hover:text-foreground transition-colors duration-200 font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Support
          </Link>
          
          {/* Mobile Authentication UI */}
          {user ? (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center space-x-2 py-2">
                <User className="h-4 w-4" />
                <span className="font-medium">{user.display_name}</span>
              </div>
              <Link 
                href="/settings" 
                className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors duration-200 py-2"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="flex items-center space-x-2 text-foreground/80 hover:text-foreground transition-colors duration-200 py-2 w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                <Button 
                  size="sm" 
                  className="w-full"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

    </nav>
  )
}