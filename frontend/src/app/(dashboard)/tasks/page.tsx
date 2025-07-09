import { TasksContent } from "@/components/features/tasks/tasks-content"

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export default function TasksPage() {
  return <TasksContent />
}