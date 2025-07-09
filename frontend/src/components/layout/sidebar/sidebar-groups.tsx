import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronRight, Users, Plus, FolderOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { textVariants, groupColors } from "./sidebar-config"

interface Group {
  id: number
  name: string
  description?: string
  color?: string
  user_id: number
  created_at: string
  updated_at: string
}

interface SidebarGroupsProps {
  groups: Group[]
  isCollapsed: boolean
  isExpanded: boolean
  onToggleExpanded: () => void
  onAddGroup?: () => void
  className?: string
}

export function SidebarGroups({ 
  groups, 
  isCollapsed, 
  isExpanded, 
  onToggleExpanded, 
  onAddGroup,
  className 
}: SidebarGroupsProps) {
  const pathname = usePathname()

  const handleAddGroup = (e: React.MouseEvent) => {
    e.stopPropagation()
    onAddGroup?.()
  }

  return (
    <div className={`flex-1 space-y-1 ${className}`}>
      <div
        className={cn(
          "flex items-center h-12 rounded-lg transition-colors cursor-pointer overflow-hidden",
          "hover:bg-accent/20 hover:text-accent-foreground"
        )}
        onClick={() => !isCollapsed && onToggleExpanded()}
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
                  onClick={handleAddGroup}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                {isExpanded ? (
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
        {isExpanded && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 py-2">
              {groups.length > 0 ? (
                groups.map((group, index) => {
                  const isActive = pathname === `/groups/${group.id}`
                  const colorClass = groupColors[index % groupColors.length]
                  
                  return (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <div
                        className={cn(
                          "flex items-center h-10 rounded-lg transition-colors overflow-hidden ml-6",
                          "hover:bg-accent/20 hover:text-accent-foreground",
                          isActive && "bg-accent/20 text-accent-foreground"
                        )}
                      >
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className={cn("h-4 w-4", colorClass)} />
                        </div>
                        <div className="flex-1 px-2 overflow-hidden">
                          <span className="text-sm text-foreground whitespace-nowrap block truncate">
                            {group.name}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="px-6 py-2">
                  <p className="text-xs text-muted-foreground">No groups yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SidebarGroups