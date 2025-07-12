from datetime import datetime, UTC
from logger import get_logger
from typing import Any, Dict, List, Tuple

from app.schemas.task import TaskCreateRequest, TaskUpdateRequest
from database.models.task import Task, TaskPriority, TaskStatus
from database.models.tasktag import TaskTag
from database.repositories.task_repository import TaskRepository
from database.repositories.subtask_repository import SubtaskRepository
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class TaskService:
    """Service for task management."""

    def __init__(self, db_session: Session):
        """Initialize the service with the Task model."""
        self.task_repo = TaskRepository(db_session)
        self.subtask_repo = SubtaskRepository(db_session)

    def get_all_tasks_for_user(self, user_id: int, **kwargs) -> Dict[str, Any]:
        """Get all tasks for a user."""
        return self.task_repo.get_all_tasks_for_user(user_id, **kwargs)

    def get_today_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user."""
        return self.task_repo.get_today_tasks(user_id)

    def get_overdue_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user."""
        return self.task_repo.get_overdue_tasks(user_id)

    def get_starred_tasks(self, user_id: int) -> List[Task]:
        """Get all tasks for a user."""
        return self.task_repo.get_starred_tasks(user_id)

    def search_tasks(self, user_id: int, query: str) -> List[Task]:
        """Search for tasks."""
        return self.task_repo.search_tasks(user_id, query)

    def get_tasks_by_priorities(
        self, user_id: int, priority_list: List[str]
    ) -> List[Task]:
        """Get all tasks for a user by priority."""
        return self.task_repo.get_tasks_by_priorities(user_id, priority_list)

    def get_tasks_by_statuses(self, user_id: int, status_list: List[str]) -> List[Task]:
        """Get all tasks for a user by status."""
        return self.task_repo.get_tasks_by_statuses(user_id, status_list)

    def get_tasks_by_tags(self, user_id: int, tags_list: List[str]) -> List[Task]:
        """Get all tasks for a user by tag."""
        return self.task_repo.get_tasks_by_tags(user_id, tags_list)

    def get_tasks_by_group(self, user_id: int, group_id: int) -> List[Task]:
        """Get all tasks for a user by group."""
        return self.task_repo.get_tasks_by_group(user_id, group_id)

    def create_task(
        self, task_create_request: TaskCreateRequest
    ) -> Tuple[bool, str, Task]:
        """Create a new task."""
        try:
            task_data = task_create_request.model_dump(exclude_unset=True)
            task_data["user_id"] = task_create_request.user_id

            # Extract tag_ids before creating the task
            tag_ids = task_data.pop("tag_ids", None)

            if isinstance(task_data.get("priority"), str):
                task_data["priority"] = TaskPriority(task_data["priority"])
            if isinstance(task_data.get("status"), str):
                task_data["status"] = TaskStatus(task_data["status"])

            task = Task(**task_data)

            logger.info(f"Task: {task}")

            # Create the task first
            task = self.task_repo.create_task(task)

            # Create TaskTag relationships if tag_ids were provided
            if tag_ids:
                for tag_id in tag_ids:
                    task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                    self.task_repo.db.add(task_tag)

            # Explicitly commit the transaction
            self.task_repo.db.commit()
            return True, "Task created successfully", task
        except Exception as e:
            # Ensure rollback on error
            self.task_repo.db.rollback()
            return False, f"Error creating task: {e}", None

    def update_task(
        self, task_id: int, user_id: int, task_update_request: TaskUpdateRequest
    ) -> Tuple[bool, str, Task]:
        """Update a task."""
        try:
            task = self.task_repo.get_task_by_id(task_id)
            if not task:
                return False, "Task not found", None

            if task.user_id != user_id:
                return False, "You are not authorized to update this task", None

            task_data = task_update_request.model_dump(exclude_unset=True)

            # Extract tag_ids before updating the task
            tag_ids = task_data.pop("tag_ids", None)

            # Convert string enums to proper enum types
            if isinstance(task_data.get("priority"), str):
                task_data["priority"] = TaskPriority(task_data["priority"])
            if isinstance(task_data.get("status"), str):
                task_data["status"] = TaskStatus(task_data["status"])

            for field, value in task_data.items():
                if hasattr(task, field):
                    if field == "status" and value == TaskStatus.COMPLETED:
                        task.completed_at = datetime.now(UTC)
                    elif field == "status" and value != TaskStatus.COMPLETED:
                        task.completed_at = None

                    setattr(task, field, value)

            # Handle tag updates if tag_ids were provided
            if tag_ids is not None:
                # Remove existing TaskTag relationships
                self.task_repo.db.query(TaskTag).filter(
                    TaskTag.task_id == task_id
                ).delete()

                # Create new TaskTag relationships
                for tag_id in tag_ids:
                    task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
                    self.task_repo.db.add(task_tag)

            updated_task = self.task_repo.update_task(task)
            # Explicitly commit the transaction
            self.task_repo.db.commit()
            return True, "Task updated successfully", updated_task

        except Exception as e:
            # Ensure rollback on error
            self.task_repo.db.rollback()
            return False, f"Error updating task: {e}", None

    def delete_task(self, task_id: int, user_id: int) -> Tuple[bool, str]:
        """Delete a task."""
        try:
            task = self.task_repo.get_task_by_id(task_id)
            if not task:
                return False, "Task not found"
            if task.user_id != user_id:
                return False, "You are not authorized to delete this task"

            self.task_repo.delete_task(task)
            # Explicitly commit the transaction
            self.task_repo.db.commit()
            return True, "Task deleted successfully"

        except Exception as e:
            # Ensure rollback on error
            self.task_repo.db.rollback()
            return False, f"Error deleting task: {e}"

    def toggle_task_completion(
        self, task_id: int, user_id: int
    ) -> Tuple[bool, str, Task]:
        """Toggle task completion status."""
        try:
            task = self.task_repo.get_task_by_id(task_id)
            if not task:
                return False, "Task not found", None

            if task.user_id != user_id:
                return False, "You are not authorized to update this task", None

            # Toggle completion status
            was_completed = task.status == TaskStatus.COMPLETED
            if was_completed:
                task.status = TaskStatus.PENDING
                task.completed_at = None
            else:
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now(UTC)

            updated_task = self.task_repo.update_task(task)

            # Toggle all subtasks to match parent task completion status
            self.toggle_all_subtasks_completion(task_id, not was_completed)

            # Explicitly commit the transaction
            self.task_repo.db.commit()
            return True, "Task completion toggled successfully", updated_task

        except Exception as e:
            # Ensure rollback on error
            self.task_repo.db.rollback()
            return False, f"Error toggling task completion: {e}", None

    def toggle_task_star(self, task_id: int, user_id: int) -> Tuple[bool, str, Task]:
        """Toggle task star status."""
        try:
            task = self.task_repo.get_task_by_id(task_id)
            if not task:
                return False, "Task not found", None

            if task.user_id != user_id:
                return False, "You are not authorized to update this task", None

            task.starred = not task.starred
            updated_task = self.task_repo.update_task(task)
            # Explicitly commit the transaction
            self.task_repo.db.commit()
            return True, "Task star toggled successfully", updated_task

        except Exception as e:
            # Ensure rollback on error
            self.task_repo.db.rollback()
            return False, f"Error toggling task star: {e}", None

    def update_task_status_based_on_subtasks(self, task_id: int) -> None:
        """Update task status based on subtask completion."""
        try:
            task = self.task_repo.get_task_by_id(task_id)
            if not task:
                return

            # Get all subtasks for this task
            subtasks = self.subtask_repo.get_subtasks_by_task_id(task_id)

            if not subtasks:
                # No subtasks, leave task status as is
                return

            # Count completed subtasks
            completed_subtasks = [s for s in subtasks if s.is_completed]
            total_subtasks = len(subtasks)
            completed_count = len(completed_subtasks)

            # Determine new status based on subtask completion
            if completed_count == 0:
                # No subtasks completed, keep as pending if not already completed
                if task.status not in [TaskStatus.COMPLETED]:
                    task.status = TaskStatus.PENDING
                    task.completed_at = None
            elif completed_count == total_subtasks:
                # All subtasks completed, mark task as completed
                if task.status != TaskStatus.COMPLETED:
                    task.status = TaskStatus.COMPLETED
                    task.completed_at = datetime.now(UTC)
            else:
                # Some subtasks completed, mark as in-progress
                if task.status not in [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS]:
                    task.status = TaskStatus.IN_PROGRESS
                    task.completed_at = None

            # Save the updated task
            self.task_repo.update_task(task)

        except Exception as e:
            logger.error(f"Error updating task status based on subtasks: {e}")

    def toggle_all_subtasks_completion(self, task_id: int, completed: bool) -> None:
        """Toggle all subtasks completion status when parent task is toggled."""
        try:
            # Get all subtasks for this task
            subtasks = self.subtask_repo.get_subtasks_by_task_id(task_id)

            # Update all subtasks to match parent task completion status
            for subtask in subtasks:
                if subtask.is_completed != completed:
                    subtask.is_completed = completed
                    self.subtask_repo.update_subtask(subtask)

        except Exception as e:
            logger.error(f"Error toggling all subtasks completion: {e}")
