import { TaskPriority, TaskStatus } from "@/types/task"

export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
    case 'low':
    default:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
  }
}

export function getStatusColor(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
    case 'archived':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400 border-slate-200 dark:border-slate-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800'
  }
}

export function getPriorityIcon(priority: TaskPriority): string {
  switch (priority) {
    case 'urgent':
      return '🚨'
    case 'high':
      return '🔥'
    case 'medium':
      return '🔸'
    case 'low':
    default:
      return '🔹'
  }
}

export function getStatusIcon(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return '✅'
    case 'in_progress':
      return '🔄'
    case 'archived':
      return '📁'
    case 'cancelled':
      return '❌'
    case 'pending':
    default:
      return '⏳'
  }
}

export function formatPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function formatStatusLabel(status: TaskStatus): string {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default {
  getPriorityColor,
  getStatusColor,
  getPriorityIcon,
  getStatusIcon,
  formatPriorityLabel,
  formatStatusLabel,
}