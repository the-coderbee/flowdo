import { Button } from "@/components/ui/button"
import { TaskPriority } from "@/types/task"

const priorityOptions = [
  { value: 'low' as const, label: "Low", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800", icon: "🔹" },
  { value: 'medium' as const, label: "Medium", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800", icon: "🔸" },
  { value: 'high' as const, label: "High", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800", icon: "🔥" },
  { value: 'urgent' as const, label: "Urgent", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800", icon: "🚨" }
]

interface PrioritySelectorProps {
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
  readonly?: boolean
  className?: string
}

export function PrioritySelector({ value, onChange, readonly = false, className }: PrioritySelectorProps) {
  const currentPriority = priorityOptions.find(p => p.value === value)

  if (readonly) {
    return (
      <div className={`${currentPriority?.color} w-fit px-3 py-2 rounded-lg border text-sm font-medium ${className}`}>
        {currentPriority?.icon} {currentPriority?.label}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 gap-2 ${className}`}>
      {priorityOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          className={`justify-start h-10 text-sm ${
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

export { priorityOptions }
export default PrioritySelector