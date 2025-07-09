import { motion } from "framer-motion"

interface TasksEmptyStateProps {
  className?: string
}

export function TasksEmptyState({ className }: TasksEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`text-center py-12 ${className}`}
    >
      <div className="text-muted-foreground">
        <p className="text-lg font-medium">No tasks yet</p>
        <p className="text-sm">Create your first task to get started</p>
      </div>
    </motion.div>
  )
}

export default TasksEmptyState