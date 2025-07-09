import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TasksPageHeaderProps {
  pageTitle: string
  pendingTasksCount: number
  onMobileSidebarToggle?: () => void
  className?: string
}

export function TasksPageHeader({ 
  pageTitle, 
  pendingTasksCount, 
  onMobileSidebarToggle, 
  className 
}: TasksPageHeaderProps) {
  return (
    <div className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={onMobileSidebarToggle}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div>
            <motion.h1 
              key={pageTitle}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-bold text-foreground"
            >
              {pageTitle}
            </motion.h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pendingTasksCount} pending tasks
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksPageHeader