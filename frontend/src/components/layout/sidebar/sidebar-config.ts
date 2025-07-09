import {
  Sun,
  Star,
  CheckSquare,
  Timer,
  Settings,
  Tag,
  BarChart3,
  HelpCircle,
} from "lucide-react"

export const topMenuItems = [
  {
    title: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
    color: "text-blue-600 dark:text-blue-400"
  },
  {
    title: "My Day",
    icon: Sun,
    href: "/my-day",
    color: "text-yellow-600 dark:text-yellow-400"
  },
  {
    title: "Starred",
    icon: Star,
    href: "/starred",
    color: "text-amber-600 dark:text-amber-400"
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-teal-600 dark:text-teal-400"
  },
  {
    title: "Tags",
    icon: Tag,
    href: "/tags",
    color: "text-indigo-600 dark:text-indigo-400"
  },
  {
    title: "Pomodoro",
    icon: Timer,
    href: "/pomodoro",
    color: "text-red-600 dark:text-red-400"
  }
]

export const bottomMenuItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-600 dark:text-gray-400"
  },
  {
    title: "FAQ",
    icon: HelpCircle,
    href: "/faq",
    color: "text-violet-600 dark:text-violet-400"
  }
]

export const groupColors = [
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-purple-600 dark:text-purple-400",
  "text-pink-600 dark:text-pink-400",
  "text-orange-600 dark:text-orange-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-lime-600 dark:text-lime-400",
]

export interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
}

export const sidebarVariants = {
  expanded: { 
    width: 280
  },
  collapsed: { 
    width: 66
  }
}

export const textVariants = {
  expanded: { 
    opacity: 1, 
    x: 0,
    width: "auto"
  },
  collapsed: { 
    opacity: 0, 
    x: -10,
    width: 0
  }
}