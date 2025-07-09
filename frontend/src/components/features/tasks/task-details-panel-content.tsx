import { Task } from "@/types/task"
import { TaskDescription } from "./task-description"
import { TaskDueDateDisplay } from "./task-due-date-display"
import { TaskSubtasksManager } from "./task-subtasks-manager"
import { TaskTagsManager } from "./task-tags-manager"
import { TaskTimeline } from "./task-timeline"

interface TaskDetailsPanelContentProps {
  task: Task
  className?: string
}

export function TaskDetailsPanelContent({ task, className }: TaskDetailsPanelContentProps) {
  return (
    <div className={`flex-1 overflow-y-auto p-4 space-y-6 ${className}`}>
      {/* Description */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Description
        </h4>
        <TaskDescription description={task.description} />
      </div>

      {/* Due Date */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Due Date
        </h4>
        <TaskDueDateDisplay dueDate={task.due_date} />
      </div>

      {/* Subtasks */}
      <TaskSubtasksManager
        subtasks={task.subtasks}
        isEditing={false}
        newSubtask=""
        onNewSubtaskChange={() => {}}
        onAddSubtask={() => {}}
      />

      {/* Tags */}
      <TaskTagsManager
        tags={task.tags}
        isEditing={false}
        newTag=""
        onNewTagChange={() => {}}
        onAddTag={() => {}}
      />

      {/* Timeline */}
      <TaskTimeline task={task} />
    </div>
  )
}

export default TaskDetailsPanelContent