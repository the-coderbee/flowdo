import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { MenuItem, textVariants } from "./sidebar-config"

interface SidebarMenuItemProps {
  item: MenuItem
  isActive: boolean
  isCollapsed: boolean
  className?: string
}

export function SidebarMenuItem({ item, isActive, isCollapsed, className }: SidebarMenuItemProps) {
  return (
    <Link href={item.href}>
      <div
        className={cn(
          "flex items-center h-12 rounded-lg transition-colors overflow-hidden",
          "hover:bg-accent/20 hover:text-accent-foreground",
          isActive && "bg-accent/20 text-accent-foreground",
          className
        )}
      >
        {/* Fixed icon container - always 48px wide */}
        <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
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
}

export default SidebarMenuItem