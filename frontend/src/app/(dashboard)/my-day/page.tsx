import { TasksContent } from "@/components/tasks/tasks-content"

// Force dynamic rendering for authentication
export const dynamic = 'force-dynamic'

export default function MyDayPage() {
  return <TasksContent />
}