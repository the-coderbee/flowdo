"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useGroup } from "@/contexts/group-context"
import { useAuth } from "@/contexts/auth-context"
import {
  Sun,
  Star,
  CheckSquare,
  Timer,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FolderOpen,
  Users,
  Tag,
  Plus,
  BarChart3,
  HelpCircle,
  User,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"

const topMenuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    title: "My Day",
    icon: Sun,
    href: "/my-day",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    title: "Starred",
    icon: Star,
    href: "/starred",
    color: "text-amber-600 dark:text-amber-400"
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-teal-600 dark:text-teal-400"
  },
  {
    title: "Tags",
    icon: Tag,
    href: "/tags",
    color: "text-indigo-600 dark:text-indigo-400"
  },
  {
    title: "Pomodoro",
    icon: Timer,
    href: "/pomodoro",
    color: "text-red-600 dark:text-red-400"
  }
]

const bottomMenuItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-600 dark:text-gray-400"
  },
  {
    title: "FAQ",
    icon: HelpCircle,
    href: "/faq",
    color: "text-violet-600 dark:text-violet-400"
  }
]

const groupColors = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-purple-600 dark:text-purple-400",
  "text-pink-600 dark:text-pink-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-lime-600 dark:text-lime-400",
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true)
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  const pathname = usePathname()
  const { groups } = useGroup()
  const { user, logout } = useAuth()

  // Helper function to get user initials
  const getUserInitials = (displayName: string) => {
    return displayName
      .split(" ")
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const sidebarVariants = {
    expanded: { 
      width: 280
    },
    collapsed: { 
      width: 66
    }
  }

  const textVariants = {
    expanded: { 
      opacity: 1, 
      x: 0,
      width: "auto"
    },
    collapsed: { 
      opacity: 0, 
      x: -10,
      width: 0
    }
  }

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "h-full bg-card border-r border-border flex flex-col relative overflow-hidden",
        className
      )}
    >
      {/* Header with Logo and Toggle Button */}
      <div className={cn("p-4 border-b border-border flex items-center justify-between flex-shrink-0 h-16", isCollapsed && "justify-center")}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={textVariants}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex-1 overflow-hidden"
            >
              <Logo size="sm" className="text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-accent flex-shrink-0"
        >
          {isCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-2 overflow-hidden">
        {/* Top Menu Items */}
        <nav className="flex flex-col space-y-2">
          {topMenuItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center h-12 rounded-lg transition-colors overflow-hidden",
                    "hover:bg-accent/20 hover:text-accent-foreground",
                    isActive && "bg-accent/20 text-accent-foreground"
                  )}
                >
                  {/* Fixed icon container - always 48px wide */}
                  <div className={cn("w-12 h-12 flex items-center justify-center flex-shrink-0")}>
                    <item.icon className={cn("h-5 w-5", item.color)} />
                  </div>
                  
                  {/* Animated text container */}
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={textVariants}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex-1 px-3 overflow-hidden"
                      >
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                          {item.title}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* Groups Section */}
        <div className="flex-1 space-y-1">
          <div
            className={cn(
              "flex items-center h-12 rounded-lg transition-colors cursor-pointer overflow-hidden",
              "hover:bg-accent/20 hover:text-accent-foreground"
            )}
            onClick={() => !isCollapsed && setIsGroupsExpanded(!isGroupsExpanded)}
          >
            {/* Fixed icon container */}
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            
            {/* Animated content container */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  variants={textVariants}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="flex-1 px-3 flex items-center justify-between overflow-hidden"
                >
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    Groups
                  </span>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Open add group dialog
                        console.log("Add group clicked")
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    {isGroupsExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Groups List */}
          <AnimatePresence>
            {isGroupsExpanded && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-1 overflow-hidden"
              >
                {groups.map((group, index) => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="flex items-center h-10 rounded-lg transition-colors hover:bg-accent/20 hover:text-accent-foreground overflow-hidden">
                      {/* Fixed icon container with left padding for nesting */}
                      <div className="w-12 h-10 flex items-center justify-center flex-shrink-0 ml-3">
                        <FolderOpen className={cn("h-4 w-4", groupColors[index % groupColors.length])} />
                      </div>
                      
                      {/* Group text content */}
                      <div className="flex-1 px-3 flex items-center justify-between overflow-hidden">
                        <span className="text-sm text-foreground truncate">
                          {group.name}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full flex-shrink-0 ml-2">
                          {group.task_count || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Groups Icons */}
          <AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="space-y-1"
              >
                {groups.map((group, index) => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg transition-colors hover:bg-accent/20 hover:text-accent-foreground">
                      <FolderOpen className={cn("h-4 w-4", groupColors[index % groupColors.length])} />
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Bottom Menu Items */}
        <div className="mt-auto pt-2">
          <nav className="flex flex-col space-y-2">
            {bottomMenuItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center h-12 rounded-lg transition-colors overflow-hidden",
                      "hover:bg-accent/20 hover:text-accent-foreground",
                      isActive && "bg-accent/20 text-accent-foreground"
                    )}
                  >
                    {/* Fixed icon container - always 48px wide */}
                    <div className={cn("w-12 h-12 flex items-center justify-center flex-shrink-0")}>
                      <item.icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    
                    {/* Animated text container */}
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.div
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={textVariants}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="flex-1 px-3 overflow-hidden"
                        >
                          <span className="text-sm font-medium text-foreground whitespace-nowrap">
                            {item.title}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Profile Tab */}
        {user && (
          <div className="border rounded-xl p-2 border-border mt-4 hover:shadow-md shadow-black/60 transition-shadow duration-300">
            <div className="relative">
              {/* Profile Dropdown - appears above the tab */}
              <AnimatePresence>
                {isProfileExpanded && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 10, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="absolute bottom-full -left-2 -right-2 mb-4 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-2 space-y-1">
                      <Link href="/profile">
                        <div className="flex items-center h-10 px-3 rounded-lg transition-colors hover:bg-accent/20 hover:text-accent-foreground">
                          <User className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="text-sm font-medium">Profile</span>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center h-10 px-3 rounded-lg transition-colors hover:bg-accent/20 hover:text-accent-foreground text-left"
                      >
                        <LogOut className="h-4 w-4 mr-3 text-muted-foreground" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Tab */}
              <div
                className={cn(
                  "flex items-center h-14 rounded-lg transition-colors cursor-pointer overflow-hidden",
                  "hover:text-accent-foreground",
                  isProfileExpanded && "text-accent-foreground"
                )}
                onClick={() => !isCollapsed && setIsProfileExpanded(!isProfileExpanded)}
              >
                {/* Avatar */}
                <div className="w-12 h-14 flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getUserInitials(user.display_name)}
                  </div>
                </div>

                {/* User Info and Arrow */}
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      variants={textVariants}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex-1 px-3 flex items-center justify-between overflow-hidden"
                    >
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      
                      <motion.div
                        animate={{ rotate: isProfileExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex-shrink-0 ml-2"
                      >
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </motion.div>
  )
}