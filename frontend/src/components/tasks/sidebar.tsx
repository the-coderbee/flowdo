"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun,
  Star,
  CheckSquare,
  Timer,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "My Day",
    icon: Sun,
    href: "/tasks/my-day",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    title: "Starred",
    icon: Star,
    href: "/tasks/starred",
    color: "text-amber-600 dark:text-amber-400"
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-teal-600 dark:text-teal-400"
  },
  {
    title: "Pomodoro",
    icon: Timer,
    href: "/tasks/pomodoro",
    color: "text-red-600 dark:text-red-400"
  },
  {
    title: "Configurations",
    icon: Settings,
    href: "/tasks/settings",
    color: "text-gray-600 dark:text-gray-400"
  }
]

const groups = [
  {
    id: "personal",
    title: "Personal",
    color: "text-blue-600 dark:text-blue-400",
    tasks: 5
  },
  {
    id: "work",
    title: "Work",
    color: "text-green-600 dark:text-green-400",
    tasks: 12
  },
  {
    id: "shopping",
    title: "Shopping",
    color: "text-purple-600 dark:text-purple-400",
    tasks: 3
  },
  {
    id: "health",
    title: "Health & Fitness",
    color: "text-pink-600 dark:text-pink-400",
    tasks: 7
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true)
  const pathname = usePathname()

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -10 }
  }

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "h-full bg-card border-r border-border flex flex-col relative",
        className
      )}
    >
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-border flex items-center justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-accent"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Menu Items */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", item.color)} />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        variants={contentVariants}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="text-sm font-medium text-foreground"
                      >
                        {item.title}
                      </motion.span>
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
        <div className="space-y-1">
          <div
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center"
            )}
            onClick={() => !isCollapsed && setIsGroupsExpanded(!isGroupsExpanded)}
          >
            <Users className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <>
                  <motion.span
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={contentVariants}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="text-sm font-medium text-foreground flex-1"
                  >
                    Groups
                  </motion.span>
                  
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={contentVariants}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    {isGroupsExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </motion.div>
                </>
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
                className="space-y-1 pl-3 overflow-hidden"
              >
                {groups.map((group) => (
                  <Link key={group.id} href={`/tasks/groups/${group.id}`}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground">
                      <FolderOpen className={cn("h-4 w-4 flex-shrink-0", group.color)} />
                      <span className="text-sm text-foreground flex-1">
                        {group.title}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {group.tasks}
                      </span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed Groups */}
          {isCollapsed && (
            <div className="space-y-1">
              {groups.map((group) => (
                <Link key={group.id} href={`/tasks/groups/${group.id}`}>
                  <div className="flex items-center justify-center px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground">
                    <FolderOpen className={cn("h-4 w-4", group.color)} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}