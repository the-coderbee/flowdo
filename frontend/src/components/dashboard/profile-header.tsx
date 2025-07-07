"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Search, 
  Bell, 
  Calendar,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export function ProfileHeader() {
  const { user } = useAuth()
  const [notificationCount] = useState(3) // Mock notification count
  
  // Get today's date formatted
  const today = format(new Date(), "MMM dd, yyyy")

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
        <div className="flex items-center justify-between p-6">
          {/* Left Side - Greeting */}
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
            >
              Welcome back, <span className="text-primary underline">{user?.display_name}</span> 👋
            </motion.h1>
          </div>

          {/* Right Side - Action Toolbar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center space-x-4"
          >
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-accent"
              title="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* Notification Icon with Badge */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-accent"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Calendar with Date */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-accent/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {today}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Mobile Date Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:hidden mt-4 flex items-center space-x-2 text-muted-foreground"
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            {today}
          </span>
        </motion.div>
    </motion.div>
  )
}