import { Task, TaskFilters } from "@/types/task"

// Task action types
export type TaskAction = 
  | { type: "SET_LOADING", payload: boolean }
  | { type: "SET_TASKS", payload: { tasks: Task[], pagination: TaskPagination } }
  | { type: "SET_ERROR", payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_FILTERS", payload: TaskFilters }
  | { type: "CLEAR_FILTERS" }
  | { type: "ADD_TASK", payload: Task }
  | { type: "UPDATE_TASK", payload: { id: number, updates: Partial<Task> } }
  | { type: "REMOVE_TASK", payload: number }

// Task state interface
export interface TaskPagination {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  filters: TaskFilters
  pagination: TaskPagination
}

// Initial state
export const initialTaskState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {},
  pagination: {
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 0
  }
}

// Task reducer
export function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    
    case "SET_TASKS":
      return { 
        ...state, 
        tasks: action.payload.tasks,
        pagination: action.payload.pagination,
        loading: false,
        error: null
      }
    
    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload, 
        loading: false 
      }
    
    case "CLEAR_ERROR":
      return { ...state, error: null }
    
    case "SET_FILTERS":
      return { ...state, filters: action.payload }
    
    case "CLEAR_FILTERS":
      return { ...state, filters: {} }
    
    case "ADD_TASK":
      return { 
        ...state, 
        tasks: [action.payload, ...state.tasks],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      }
    
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id 
            ? { ...task, ...action.payload.updates }
            : task
        )
      }
    
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      }
    
    default:
      return state
  }
}