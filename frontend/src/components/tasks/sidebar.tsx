"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useGroup } from "@/contexts/group-context"
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
  Users,
  Tag,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const menuItems = [
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
  },
  {
    title: "Configurations",
    icon: Settings,
    href: "/settings",
    color: "text-gray-600 dark:text-gray-400"
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
  const pathname = usePathname()
  const { groups } = useGroup()

  const sidebarVariants = {
    expanded: { 
      width: 280
    },
    collapsed: { 
      width: 80
    }
  }

  const contentVariants = {
    expanded: { 
      opacity: 1, 
      x: 0
    },
    collapsed: { 
      opacity: 0, 
      x: -10
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
        "will-change-[width] backface-visibility-hidden",
        className
      )}
      style={{ contain: "layout" }}
    >
      {/* Header with Toggle Button */}
      <div className="p-4 border-b border-border flex items-center justify-end flex-shrink-0">
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
      <div className="flex-1 p-2 overflow-hidden">
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
                    isCollapsed && "justify-center mx-1 w-12 h-12"
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
                        className="text-sm font-medium text-foreground whitespace-nowrap"
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
              isCollapsed && "justify-center mx-1 w-12 h-12"
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
                    className="text-sm font-medium text-foreground flex-1 whitespace-nowrap"
                  >
                    Groups
                  </motion.span>
                  
                  <motion.div
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    variants={contentVariants}
                    className="flex items-center gap-1"
                  >
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
                {groups.map((group, index) => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground">
                      <FolderOpen className={cn("h-4 w-4 flex-shrink-0", groupColors[index % groupColors.length])} />
                      <span className="text-sm text-foreground flex-1">
                        {group.name}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {group.task_count || 0}
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
              {groups.map((group, index) => (
                <Link key={group.id} href={`/groups/${group.id}`}>
                  <div className="flex items-center justify-center px-3 py-2 rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground mx-1 w-12 h-12">
                    <FolderOpen className={cn("h-4 w-4", groupColors[index % groupColors.length])} />
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