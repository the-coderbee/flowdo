import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { TaskService } from '@/lib/api/task-service'
import { queryKeys } from '@/lib/react-query'
import { Task, TaskFilters, CreateTaskRequest, UpdateTaskRequest } from '@/types/task'
import { TaskPagination } from '@/lib/store/task-reducer'

// Hook for fetching all tasks with filters and pagination
export function useTasks(
  filters: TaskFilters = {},
  page: number = 1,
  pageSize: number = 20,
  sortBy: string = "created_at",
  sortOrder: string = "desc"
) {
  return useQuery({
    queryKey: queryKeys.tasks.list({ filters, page, pageSize, sortBy, sortOrder }),
    queryFn: () => TaskService.fetchTasks(filters, page, pageSize, sortBy, sortOrder),
    enabled: true,
  })
}

// Hook for route-based task fetching
export function useTasksByRoute() {
  const pathname = usePathname()
  
  // Determine filters based on route
  const getFiltersForRoute = (): TaskFilters => {
    switch (pathname) {
      case '/my-day':
        return TaskService.getMyDayFilters()
      case '/starred':
        return TaskService.getStarredFilters()
      case '/completed':
        return { completed: true }
      case '/today':
        return TaskService.getTodayFilters()
      case '/overdue':
        return TaskService.getOverdueFilters()
      default:
        return {} // All tasks for /tasks route
    }
  }

  const filters = getFiltersForRoute()
  
  return useQuery({
    queryKey: queryKeys.tasks.list({ filters, route: pathname }),
    queryFn: () => TaskService.fetchTasks(filters),
    enabled: true,
  })
}

// Specialized hooks for specific task types
export function useMyDayTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.myDay(),
    queryFn: () => TaskService.fetchTasks(TaskService.getMyDayFilters()),
    enabled: true,
  })
}

export function useStarredTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.starred(),
    queryFn: () => TaskService.getStarredTasks(),
    enabled: true,
  })
}

export function useTodayTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.today(),
    queryFn: () => TaskService.getTodaysTasks(),
    enabled: true,
  })
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.overdue(),
    queryFn: () => TaskService.getOverdueTasks(),
    enabled: true,
  })
}

export function useCompletedTasks() {
  return useQuery({
    queryKey: queryKeys.tasks.completed(),
    queryFn: () => TaskService.fetchTasks({ completed: true }),
    enabled: true,
  })
}

// Search hook
export function useSearchTasks(query: string) {
  return useQuery({
    queryKey: queryKeys.tasks.list({ search: query }),
    queryFn: () => TaskService.searchTasks(query),
    enabled: !!query && query.length > 0,
  })
}

// Mutation hooks
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (task: CreateTaskRequest) => TaskService.createTask(task),
    onSuccess: (newTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      
      // Optionally add optimistic update
      queryClient.setQueryData(
        queryKeys.tasks.allTasks(),
        (oldData: { tasks: Task[], pagination: TaskPagination } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: [newTask, ...oldData.tasks],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1
            }
          }
        }
      )
    },
    onError: (error) => {
      console.error('Create task error:', error)
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateTaskRequest }) => 
      TaskService.updateTask(id, updates),
    onSuccess: (updatedTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      
      // Update the specific task in all relevant queries
      queryClient.setQueryData(
        queryKeys.tasks.allTasks(),
        (oldData: { tasks: Task[], pagination: TaskPagination } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          }
        }
      )
    },
    onError: (error) => {
      console.error('Update task error:', error)
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => TaskService.deleteTask(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      
      // Remove the task from all relevant queries
      queryClient.setQueryData(
        queryKeys.tasks.allTasks(),
        (oldData: { tasks: Task[], pagination: TaskPagination } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.filter(task => task.id !== deletedId),
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total - 1
            }
          }
        }
      )
    },
    onError: (error) => {
      console.error('Delete task error:', error)
    }
  })
}

export function useToggleTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => TaskService.toggleTaskCompletion(id),
    onSuccess: (updatedTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      
      // IMPORTANT: Invalidate subtask queries for this task since task completion affects all subtasks
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.byTask(updatedTask.id.toString()) })
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.stats(updatedTask.id.toString()) })
      
      // Update the specific task in all relevant queries
      queryClient.setQueryData(
        queryKeys.tasks.allTasks(),
        (oldData: { tasks: Task[], pagination: TaskPagination } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          }
        }
      )
    },
    onError: (error) => {
      console.error('Toggle task error:', error)
    }
  })
}

export function useStarTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => TaskService.toggleTaskStar(id),
    onSuccess: (updatedTask) => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
      
      // Update the specific task in all relevant queries
      queryClient.setQueryData(
        queryKeys.tasks.allTasks(),
        (oldData: { tasks: Task[], pagination: TaskPagination } | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            tasks: oldData.tasks.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          }
        }
      )
    },
    onError: (error) => {
      console.error('Star task error:', error)
    }
  })
}