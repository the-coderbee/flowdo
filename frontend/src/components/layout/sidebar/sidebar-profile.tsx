import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { textVariants } from "./sidebar-config"

interface UserProfile {
  id: number
  email: string
  display_name: string
}

interface SidebarProfileProps {
  user: UserProfile | null
  isCollapsed: boolean
  isExpanded: boolean
  onToggleExpanded: () => void
  onLogout: () => void
  className?: string
}

function getUserInitials(displayName: string): string {
  return displayName
    .split(" ")
    .map(part => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function SidebarProfile({ 
  user, 
  isCollapsed, 
  isExpanded, 
  onToggleExpanded, 
  onLogout,
  className 
}: SidebarProfileProps) {
  if (!user) return null

  const handleProfileClick = () => {
    if (!isCollapsed) {
      onToggleExpanded()
    }
  }

  return (
    <div className={`border-t border-border ${className}`}>
      {/* Profile Header */}
      <div
        className={cn(
          "flex items-center h-16 p-4 transition-colors cursor-pointer overflow-hidden",
          "hover:bg-accent/20"
        )}
        onClick={handleProfileClick}
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium">
            {getUserInitials(user.display_name)}
          </span>
        </div>
        
        {/* User Info */}
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
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap truncate">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap truncate">
                    {user.email}
                  </p>
                </div>
                <ChevronUp 
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform flex-shrink-0",
                    isExpanded && "rotate-180"
                  )} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Menu */}
      <AnimatePresence>
        {isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-2 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 text-sm"
                onClick={() => {
                  // TODO: Navigate to profile page
                  console.log("Navigate to profile")
                }}
              >
                <User className="h-4 w-4 mr-3" />
                Profile
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-10 text-sm text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={onLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SidebarProfile