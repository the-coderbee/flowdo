import { DashboardContent } from "@/components/features/dashboard/dashboard-content"
import { DashboardDebug } from "@/components/debug/dashboard-debug"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-2 md:p-8">
      {process.env.NODE_ENV === 'development' && <DashboardDebug />}
      <DashboardContent />
    </div>
  )
}