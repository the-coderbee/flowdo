"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useGroup } from "@/lib/providers/group-provider"
import { useAuth } from "@/lib/providers/auth-provider"
import { cn } from "@/lib/utils"
import { SidebarHeader } from "./sidebar/sidebar-header"
import { SidebarNavigation } from "./sidebar/sidebar-navigation"
import { SidebarGroups } from "./sidebar/sidebar-groups"
import { SidebarProfile } from "./sidebar/sidebar-profile"
import { sidebarVariants } from "./sidebar/sidebar-config"
import { CreateGroupDialog } from "@/components/features/groups/create-group-dialog"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isGroupsExpanded, setIsGroupsExpanded] = useState(true)
  const [isProfileExpanded, setIsProfileExpanded] = useState(false)
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false)
  const { groups } = useGroup()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleAddGroup = () => {
    setIsCreateGroupDialogOpen(true)
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
      {/* Header */}
      <SidebarHeader
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-2 overflow-hidden">
        {/* Navigation */}
        <SidebarNavigation isCollapsed={isCollapsed} />
        
        {/* Groups */}
        <SidebarGroups
          groups={groups}
          isCollapsed={isCollapsed}
          isExpanded={isGroupsExpanded}
          onToggleExpanded={() => setIsGroupsExpanded(!isGroupsExpanded)}
          onAddGroup={handleAddGroup}
        />
      </div>

      {/* Profile */}
      <SidebarProfile
        user={user}
        isCollapsed={isCollapsed}
        isExpanded={isProfileExpanded}
        onToggleExpanded={() => setIsProfileExpanded(!isProfileExpanded)}
        onLogout={handleLogout}
      />

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={isCreateGroupDialogOpen}
        onOpenChange={setIsCreateGroupDialogOpen}
      />
    </motion.div>
  )
}

export default Sidebar