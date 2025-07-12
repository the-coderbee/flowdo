import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SubtaskService } from '@/lib/api/subtask-service'
import { queryKeys } from '@/lib/react-query'
import { 
  Subtask, 
  Task, 
  CreateSubtaskRequest, 
  UpdateSubtaskRequest, 
  SubtaskStats 
} from '@/types/task'

// Hook for fetching subtasks by task ID (on-demand loading)
export function useSubtasks(taskId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.subtasks.byTask(taskId.toString()),
    queryFn: () => SubtaskService.getSubtasks(taskId),
    enabled: enabled && taskId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - subtasks change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  })
}

// Hook for fetching a specific subtask
export function useSubtask(subtaskId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.subtasks.detail('0', subtaskId.toString()), // taskId not needed for single subtask
    queryFn: () => SubtaskService.getSubtask(subtaskId),
    enabled: enabled && subtaskId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for calculating subtask statistics
export function useSubtaskStats(taskId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.subtasks.stats(taskId.toString()),
    queryFn: async () => {
      const subtasks = await SubtaskService.getSubtasks(taskId)
      return SubtaskService.calculateSubtaskStats(subtasks)
    },
    enabled: enabled && taskId > 0,
    staleTime: 1 * 60 * 1000, // 1 minute - stats change frequently
    gcTime: 3 * 60 * 1000, // 3 minutes
  })
}

// MUTATION HOOKS WITH OPTIMISTIC UPDATES

// Hook for creating a new subtask
export function useCreateSubtask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (subtaskData: CreateSubtaskRequest) =>
      SubtaskService.createSubtask(subtaskData),
    onMutate: async (subtaskData) => {
      const taskId = subtaskData.task_id
      
      // Cancel any outgoing refetches for subtasks
      await queryClient.cancelQueries({ queryKey: queryKeys.subtasks.byTask(taskId.toString()) })
      
      // Snapshot the previous subtasks
      const previousSubtasks = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString())
      )
      
      // Create optimistic subtask with stable temporary ID
      const tempId = Date.now() // Store the temporary ID
      const optimisticSubtask: Subtask = {
        id: tempId,
        title: subtaskData.title,
        description: subtaskData.description || "",
        position: subtaskData.position,
        task_id: subtaskData.task_id,
        is_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      // Optimistically update subtasks
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? [...old, optimisticSubtask] : [optimisticSubtask]
      )
      
      // Update parent task's subtasks if it exists in cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => [...subtasks, optimisticSubtask])
      
      // Update task metadata
      updateTaskMetadataInCache(queryClient, taskId, 1, 0)
      
      return { previousSubtasks, optimisticSubtask, taskId, tempId }
    },
    onError: (error, subtaskData, context) => {
      console.error('Create subtask error:', error)
      // Revert optimistic updates
      if (context?.previousSubtasks && context?.taskId) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId.toString()),
          context.previousSubtasks
        )
      }
      // Revert parent task cache
      if (context?.optimisticSubtask && context?.taskId) {
        updateTaskSubtasksInCache(queryClient, context.taskId, (subtasks) => 
          subtasks.filter(s => s.id !== context.optimisticSubtask.id)
        )
      }
    },
    onSuccess: (newSubtask, subtaskData, context) => {
      const taskId = subtaskData.task_id
      
      // Update with real data using the stored temporary ID
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? old.map(s => s.id === context?.tempId ? newSubtask : s) : [newSubtask]
      )
      
      // Update parent task cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => {
        const filtered = subtasks.filter(s => s.id !== context?.tempId) // Remove optimistic
        return [...filtered, newSubtask]
      })
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.stats(taskId.toString()) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all }) // Refresh tasks with subtask counts
    },
  })
}

// Hook for updating a subtask
export function useUpdateSubtask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ subtaskId, updates }: { 
      subtaskId: number; 
      updates: UpdateSubtaskRequest 
    }) => SubtaskService.updateSubtask(subtaskId, updates),
    onMutate: async ({ subtaskId, updates }) => {
      // Find the task ID from existing cache data
      let taskId: number | null = null
      const cacheKeys = queryClient.getQueryCache().getAll()
      
      for (const query of cacheKeys) {
        if (query.queryKey[0] === 'subtasks' && query.queryKey[2] === 'by-task') {
          const subtasks = query.state.data as Subtask[]
          if (subtasks?.some(s => s.id === subtaskId)) {
            taskId = parseInt(query.queryKey[3] as string)
            break
          }
        }
      }
      
      if (!taskId) return { previousSubtasks: null }
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.subtasks.byTask(taskId.toString()) })
      
      // Snapshot previous state
      const previousSubtasks = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString())
      )
      
      // Optimistically update
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? old.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
        ) : []
      )
      
      // Update parent task cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => 
        subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
        )
      )
      
      return { previousSubtasks, taskId }
    },
    onError: (error, { subtaskId }, context) => {
      console.error('Update subtask error:', error)
      // Revert optimistic updates
      if (context?.previousSubtasks && context?.taskId) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId.toString()),
          context.previousSubtasks
        )
      }
    },
    onSuccess: (updatedSubtask) => {
      const taskId = updatedSubtask.task_id
      
      // Update with real data
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? old.map(s => s.id === updatedSubtask.id ? updatedSubtask : s) : [updatedSubtask]
      )
      
      // Update parent task cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => 
        subtasks.map(s => s.id === updatedSubtask.id ? updatedSubtask : s)
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.stats(taskId.toString()) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

// Hook for deleting a subtask
export function useDeleteSubtask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (subtaskId: number) =>
      SubtaskService.deleteSubtask(subtaskId),
    onMutate: async (subtaskId) => {
      // Find the task ID from existing cache data for metadata update
      let taskId: number | null = null
      let wasCompleted = false
      const cacheKeys = queryClient.getQueryCache().getAll()
      
      for (const query of cacheKeys) {
        if (query.queryKey[0] === 'subtasks' && query.queryKey[2] === 'by-task') {
          const subtasks = query.state.data as Subtask[]
          const subtask = subtasks?.find(s => s.id === subtaskId)
          if (subtask) {
            taskId = parseInt(query.queryKey[3] as string)
            wasCompleted = subtask.is_completed
            break
          }
        }
      }
      
      return { taskId, wasCompleted }
    },
    onSuccess: (_, subtaskId, context) => {
      // Update task metadata if we know which task it belonged to
      if (context?.taskId) {
        const completedDelta = context.wasCompleted ? -1 : 0
        updateTaskMetadataInCache(queryClient, context.taskId, -1, completedDelta)
      }
      
      // Invalidate all subtask queries and task queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
    onError: (error) => {
      console.error('Delete subtask error:', error)
    },
  })
}

// Hook for toggling subtask completion
export function useToggleSubtask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ subtaskId, currentStatus }: { subtaskId: number, currentStatus: boolean }) =>
      SubtaskService.toggleSubtaskCompletion(subtaskId, currentStatus),
    onMutate: async ({ subtaskId, currentStatus }) => {
      // Find the task ID from existing cache data
      let taskId: number | null = null
      const cacheKeys = queryClient.getQueryCache().getAll()
      
      for (const query of cacheKeys) {
        if (query.queryKey[0] === 'subtasks' && query.queryKey[2] === 'by-task') {
          const subtasks = query.state.data as Subtask[]
          if (subtasks?.some(s => s.id === subtaskId)) {
            taskId = parseInt(query.queryKey[3] as string)
            break
          }
        }
      }
      
      if (!taskId) return { previousSubtasks: null }
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.subtasks.byTask(taskId.toString()) })
      
      // Snapshot previous state
      const previousSubtasks = queryClient.getQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString())
      )
      
      // Optimistically update
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? old.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, is_completed: !currentStatus } : subtask
        ) : []
      )
      
      // Update parent task cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => 
        subtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, is_completed: !currentStatus } : subtask
        )
      )
      
      return { previousSubtasks, taskId }
    },
    onError: (error, { subtaskId }, context) => {
      console.error('Toggle subtask error:', error)
      // Revert optimistic updates
      if (context?.previousSubtasks && context?.taskId) {
        queryClient.setQueryData(
          queryKeys.subtasks.byTask(context.taskId.toString()),
          context.previousSubtasks
        )
      }
    },
    onSuccess: (updatedSubtask) => {
      const taskId = updatedSubtask.task_id
      
      // Update with real data
      queryClient.setQueryData<Subtask[]>(
        queryKeys.subtasks.byTask(taskId.toString()),
        (old) => old ? old.map(s => s.id === updatedSubtask.id ? updatedSubtask : s) : [updatedSubtask]
      )
      
      // Update parent task cache
      updateTaskSubtasksInCache(queryClient, taskId, (subtasks) => 
        subtasks.map(s => s.id === updatedSubtask.id ? updatedSubtask : s)
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.subtasks.stats(taskId.toString()) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })
}

// UTILITY FUNCTIONS

// Helper function to update task subtasks in all task caches
function updateTaskSubtasksInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: number,
  updateFn: (subtasks: Subtask[]) => Subtask[]
) {
  // Update all task list caches
  const taskQueryKeys = [
    queryKeys.tasks.allTasks(),
    queryKeys.tasks.myDay(),
    queryKeys.tasks.starred(),
    queryKeys.tasks.today(),
    queryKeys.tasks.overdue(),
    queryKeys.tasks.completed(),
  ]
  
  taskQueryKeys.forEach(queryKey => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData
      
      const updateTasks = (tasks: Task[]) => 
        tasks.map(task => 
          task.id === taskId && task.subtasks
            ? { ...task, subtasks: updateFn(task.subtasks) }
            : task
        )
      
      if (Array.isArray(oldData)) {
        return updateTasks(oldData)
      } else if (oldData.tasks) {
        return { ...oldData, tasks: updateTasks(oldData.tasks) }
      }
      return oldData
    })
  })
}

// Hook for prefetching subtasks (useful for hover states)
export function usePrefetchSubtasks() {
  const queryClient = useQueryClient()
  
  return (taskId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.subtasks.byTask(taskId.toString()),
      queryFn: () => SubtaskService.getSubtasks(taskId),
      staleTime: 2 * 60 * 1000,
    })
  }
}

// Helper function to update task metadata in all task caches
function updateTaskMetadataInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: number,
  countDelta: number = 0,
  completedDelta: number = 0
) {
  // Update all task list caches
  const taskQueryKeys = [
    queryKeys.tasks.allTasks(),
    queryKeys.tasks.myDay(),
    queryKeys.tasks.starred(),
    queryKeys.tasks.today(),
    queryKeys.tasks.overdue(),
    queryKeys.tasks.completed(),
  ]
  
  taskQueryKeys.forEach(queryKey => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData
      
      const updateTasks = (tasks: Task[]) => 
        tasks.map(task => {
          if (task.id === taskId) {
            const newSubtaskCount = Math.max(0, task.subtask_count + countDelta)
            const newCompletedCount = Math.max(0, task.completed_subtask_count + completedDelta)
            const newPercentage = newSubtaskCount > 0 ? Math.round((newCompletedCount / newSubtaskCount) * 100) : 0
            
            return {
              ...task,
              has_subtasks: newSubtaskCount > 0,
              subtask_count: newSubtaskCount,
              completed_subtask_count: newCompletedCount,
              subtask_completion_percentage: newPercentage
            }
          }
          return task
        })
      
      if (Array.isArray(oldData)) {
        return updateTasks(oldData)
      } else if (oldData.tasks) {
        return { ...oldData, tasks: updateTasks(oldData.tasks) }
      }
      return oldData
    })
  })
}

// Combined hook for task with subtasks (convenience hook)
export function useTaskWithSubtasks(taskId: number, enableSubtasks: boolean = false) {
  const subtasksQuery = useSubtasks(taskId, enableSubtasks)
  const subtaskStats = useSubtaskStats(taskId, enableSubtasks)
  
  return {
    subtasks: subtasksQuery.data ?? [],
    subtasksLoading: subtasksQuery.isLoading,
    subtasksError: subtasksQuery.error,
    subtaskStats: subtaskStats.data ?? {
      total: 0,
      completed: 0,
      pending: 0,
      completion_percentage: 0
    },
    refetchSubtasks: subtasksQuery.refetch,
    isSubtasksStale: subtasksQuery.isStale,
  }
}