import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TaskDetailsPanelCollapsedProps {
  onExpand: () => void
  className?: string
}

export function TaskDetailsPanelCollapsed({ onExpand, className }: TaskDetailsPanelCollapsedProps) {
  return (
    <motion.div
      initial={{ width: 400 }}
      animate={{ width: 50 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`flex flex-col border-l border-border bg-card ${className}`}
    >
      <div className="p-2 flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExpand}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}

export default TaskDetailsPanelCollapsed