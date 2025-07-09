import { motion, AnimatePresence } from "framer-motion"
import { ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { cn } from "@/lib/utils"
import { textVariants } from "./sidebar-config"

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

export function SidebarHeader({ isCollapsed, onToggleCollapse, className }: SidebarHeaderProps) {
  return (
    <div className={cn(
      "p-4 border-b border-border flex items-center justify-between flex-shrink-0 h-16", 
      isCollapsed && "justify-center",
      className
    )}>
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
        onClick={onToggleCollapse}
        className="h-8 w-8 p-0 hover:bg-accent flex-shrink-0"
      >
        {isCollapsed ? (
          <ChevronsRight className="h-4 w-4" />
        ) : (
          <ChevronsLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

export default SidebarHeader