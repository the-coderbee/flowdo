import { Button } from "@/components/ui/button"
import { TaskStatus } from "@/types/task"

const statusOptions = [
  { value: 'pending' as const, label: "Pending", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800", icon: "⏳" },
  { value: 'in_progress' as const, label: "In Progress", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800", icon: "🔄" },
  { value: 'completed' as const, label: "Completed", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800", icon: "✅" },
  { value: 'archived' as const, label: "Archived", color: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400 border-slate-200 dark:border-slate-800", icon: "📁" },
  { value: 'cancelled' as const, label: "Cancelled", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: "❌" }
]

interface StatusSelectorProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  readonly?: boolean
  className?: string
}

export function StatusSelector({ value, onChange, readonly = false, className }: StatusSelectorProps) {
  const currentStatus = statusOptions.find(s => s.value === value)

  if (readonly) {
    return (
      <div className={`${currentStatus?.color} w-fit px-3 py-2 rounded-lg border text-sm font-medium ${className}`}>
        {currentStatus?.icon} {currentStatus?.label}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {statusOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          className={`justify-start w-full h-10 text-sm ${
            value === option.value 
              ? `${option.color} border-2` 
              : 'border-border'
          }`}
          onClick={() => onChange(option.value)}
        >
          <span className="mr-2">{option.icon}</span>
          {option.label}
        </Button>
      ))}
    </div>
  )
}

export { statusOptions }
export default StatusSelector