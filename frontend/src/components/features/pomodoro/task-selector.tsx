"use client"

import { useState } from 'react'
import { Search, CheckCircle, Clock, Plus, X } from 'lucide-react'

interface Task {
  id: number
  title: string
  description?: string
  estimated_pomodoros?: number
  completed_pomodoros?: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface TaskSelectorProps {
  selectedTask?: Task | null
  onTaskSelect: (task: Task | null) => void
  onClose: () => void
  className?: string
}

export function TaskSelector({
  selectedTask,
  onTaskSelect,
  onClose,
  className
}: TaskSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock tasks - in real implementation, this would come from API
  const mockTasks: Task[] = [
    {
      id: 1,
      title: "Complete project design mockups",
      description: "Create wireframes and high-fidelity mockups for the new feature",
      estimated_pomodoros: 6,
      completed_pomodoros: 2,
      priority: 'high'
    },
    {
      id: 2,
      title: "Review pull requests",
      description: "Review and provide feedback on team's pull requests",
      estimated_pomodoros: 3,
      completed_pomodoros: 0,
      priority: 'medium'
    },
    {
      id: 3,
      title: "Write documentation",
      description: "Update API documentation for new endpoints",
      estimated_pomodoros: 4,
      completed_pomodoros: 1,
      priority: 'medium'
    },
    {
      id: 4,
      title: "Bug fixes",
      description: "Fix reported issues in the authentication flow",
      estimated_pomodoros: 2,
      completed_pomodoros: 0,
      priority: 'urgent'
    },
    {
      id: 5,
      title: "Team meeting preparation",
      description: "Prepare agenda and materials for weekly team meeting",
      estimated_pomodoros: 1,
      completed_pomodoros: 0,
      priority: 'low'
    }
  ]

  const filteredTasks = mockTasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
      case 'medium':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'low':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPriorityBadge = (priority: Task['priority']) => {
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(priority)}`}>
        {priority}
      </span>
    )
  }

  return (
    <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>Select a Task</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close task selector"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Current Selection */}
        {selectedTask && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white/80">Currently Selected:</span>
              <button
                onClick={() => onTaskSelect(null)}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear Selection
              </button>
            </div>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">{selectedTask.title}</h4>
                  {selectedTask.description && (
                    <p className="text-sm text-white/60 mb-2">{selectedTask.description}</p>
                  )}
                  <div className="flex items-center space-x-3">
                    {getPriorityBadge(selectedTask.priority)}
                    {selectedTask.estimated_pomodoros && (
                      <span className="text-xs text-white/50">
                        {selectedTask.completed_pomodoros || 0}/{selectedTask.estimated_pomodoros} pomodoros
                      </span>
                    )}
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-blue-400 mt-1" />
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60">No tasks found matching your search.</p>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => onTaskSelect(task)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    selectedTask?.id === task.id
                      ? 'bg-blue-500/20 border-blue-500/40 shadow-lg shadow-blue-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-white/60 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center space-x-3">
                        {getPriorityBadge(task.priority)}
                        {task.estimated_pomodoros && (
                          <span className="text-xs text-white/50 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.completed_pomodoros || 0}/{task.estimated_pomodoros} pomodoros</span>
                          </span>
                        )}
                      </div>
                    </div>
                    {selectedTask?.id === task.id && (
                      <CheckCircle className="w-5 h-5 text-blue-400 mt-1 ml-3" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            onClick={() => onTaskSelect(null)}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Work without a task</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            {selectedTask && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Start Timer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskSelector