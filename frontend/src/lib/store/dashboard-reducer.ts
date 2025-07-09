import { Task } from "@/types/task"

export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completedToday: number
  completedPomodoros: number
  totalPomodoros: number
}

// Dashboard action types
export type DashboardAction = 
  | { type: "SET_PRIORITY_TASKS_LOADING", payload: boolean }
  | { type: "SET_PRIORITY_TASKS", payload: Task[] }
  | { type: "SET_PRIORITY_TASKS_ERROR", payload: string }
  | { type: "SET_TODAYS_TASKS_LOADING", payload: boolean }
  | { type: "SET_TODAYS_TASKS", payload: Task[] }
  | { type: "SET_TODAYS_TASKS_ERROR", payload: string }
  | { type: "SET_STATS_LOADING", payload: boolean }
  | { type: "SET_STATS", payload: DashboardStats }
  | { type: "SET_STATS_ERROR", payload: string }
  | { type: "CLEAR_ERRORS" }

// Dashboard state interface
export interface DashboardState {
  priorityTasks: Task[]
  priorityTasksLoading: boolean
  priorityTasksError: string | null
  
  todaysTasks: Task[]
  todaysTasksLoading: boolean
  todaysTasksError: string | null
  
  stats: DashboardStats
  statsLoading: boolean
  statsError: string | null
}

// Initial state
export const initialDashboardState: DashboardState = {
  priorityTasks: [],
  priorityTasksLoading: false,
  priorityTasksError: null,
  
  todaysTasks: [],
  todaysTasksLoading: false,
  todaysTasksError: null,
  
  stats: {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completedToday: 0,
    completedPomodoros: 0,
    totalPomodoros: 0
  },
  statsLoading: false,
  statsError: null
}

// Dashboard reducer
export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case "SET_PRIORITY_TASKS_LOADING":
      return { ...state, priorityTasksLoading: action.payload }
    
    case "SET_PRIORITY_TASKS":
      return { 
        ...state, 
        priorityTasks: action.payload,
        priorityTasksLoading: false,
        priorityTasksError: null
      }
    
    case "SET_PRIORITY_TASKS_ERROR":
      return { 
        ...state, 
        priorityTasksError: action.payload, 
        priorityTasksLoading: false 
      }
    
    case "SET_TODAYS_TASKS_LOADING":
      return { ...state, todaysTasksLoading: action.payload }
    
    case "SET_TODAYS_TASKS":
      return { 
        ...state, 
        todaysTasks: action.payload,
        todaysTasksLoading: false,
        todaysTasksError: null
      }
    
    case "SET_TODAYS_TASKS_ERROR":
      return { 
        ...state, 
        todaysTasksError: action.payload, 
        todaysTasksLoading: false 
      }
    
    case "SET_STATS_LOADING":
      return { ...state, statsLoading: action.payload }
    
    case "SET_STATS":
      return { 
        ...state, 
        stats: action.payload,
        statsLoading: false,
        statsError: null
      }
    
    case "SET_STATS_ERROR":
      return { 
        ...state, 
        statsError: action.payload, 
        statsLoading: false 
      }
    
    case "CLEAR_ERRORS":
      return { 
        ...state, 
        priorityTasksError: null,
        todaysTasksError: null,
        statsError: null
      }
    
    default:
      return state
  }
}