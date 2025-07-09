from datetime import datetime, UTC
import logging
from typing import Any, Dict, List, Tuple

from app.schemas.task import TaskCreateRequest, TaskUpdateRequest
from database.models.task import Task, TaskPriority, TaskStatus
from database.repositories.task_repository import TaskRepository
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class TaskService:
    """Service for task management."""

    def __init__(self, db_session: Session):
        """Initialize the service with the Task model."""
        self.task_repo = TaskRepository(db_session)

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
            if isinstance(task_data.get("priority"), str):
                task_data["priority"] = TaskPriority(task_data["priority"])
            if isinstance(task_data.get("status"), str):
                task_data["status"] = TaskStatus(task_data["status"])

            task = Task(**task_data)

            logger.info(f"Task: {task}")

            task = self.task_repo.create_task(task)
            return True, "Task created successfully", task
        except Exception as e:
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

            updated_task = self.task_repo.update_task(task)
            return True, "Task updated successfully", updated_task

        except Exception as e:
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
            return True, "Task deleted successfully"

        except Exception as e:
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
            if task.status == TaskStatus.COMPLETED:
                task.status = TaskStatus.PENDING
                task.completed_at = None
            else:
                task.status = TaskStatus.COMPLETED
                task.completed_at = datetime.now(UTC)

            updated_task = self.task_repo.update_task(task)
            return True, "Task completion toggled successfully", updated_task

        except Exception as e:
            return False, f"Error toggling task completion: {e}", None
