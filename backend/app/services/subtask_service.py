from typing import List, Dict, Optional, Tuple, Any
from sqlalchemy.orm import Session

from app.services.task_service import TaskService
from database.repositories.subtask_repository import SubtaskRepository
from database.models.subtask import Subtask
from database.repositories.task_repository import TaskRepository


class SubtaskService:
    def __init__(self, session: Session):
        self.subtask_repo = SubtaskRepository(session)
        self.task_repo = TaskRepository(session)

    def get_subtask_by_id(self, subtask_id: int) -> Subtask:
        return self.subtask_repo.get(subtask_id)

    def get_subtasks_by_task_id(
        self, task_id: int, user_id: int
    ) -> Tuple[bool, str, List[Subtask]]:
        task = self.task_repo.get_task_by_id(task_id)
        if not task:
            return False, "Task not found", []
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", []
        return (
            True,
            "Fetched subtasks successfully",
            self.subtask_repo.get_subtasks_by_task_id(task_id),
        )

    def create_subtask(
        self, subtask: Subtask, user_id: int
    ) -> Tuple[bool, str, Optional[Subtask]]:
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        return (
            True,
            "Subtask created successfully",
            self.subtask_repo.create_subtask(subtask),
        )

    def update_subtask(
        self, subtask: Subtask, user_id: int
    ) -> Tuple[bool, str, Optional[Subtask]]:
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None

        # Store original completion status to check if it changed
        original_subtask = self.subtask_repo.get(subtask.id)
        original_completion_status = (
            original_subtask.is_completed if original_subtask else None
        )

        updated_subtask = self.subtask_repo.update_subtask(subtask)

        # If completion status changed, update parent task status
        if (
            original_completion_status is not None
            and original_completion_status != subtask.is_completed
        ):
            from app.services.task_service import TaskService

            task_service = TaskService(self.subtask_repo.session)
            task_service.update_task_status_based_on_subtasks(subtask.task_id)

        return (
            True,
            "Subtask updated successfully",
            updated_subtask,
        )

    def delete_subtask(self, subtask: Subtask, user_id: int) -> Tuple[bool, str]:
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task:
            return False, "Task not found"
        if task.user_id != user_id:
            return False, "You are not authorized to access this task"

        task_id = subtask.task_id
        result = self.subtask_repo.delete_subtask(subtask)

        task_service = TaskService(self.subtask_repo.session)
        task_service.update_task_status_based_on_subtasks(task_id)

        return (True, "Subtask deleted successfully")

    def reorder_subtasks(
        self, user_id: int, task_id: int, subtask_positions: Dict[int, int]
    ) -> Tuple[bool, int]:
        task = self.task_repo.get_task_by_id(task_id)
        if not task:
            return False, 0
        if task.user_id != user_id:
            return False, 0
        return self.subtask_repo.reorder_subtasks(subtask_positions)

    def bulk_toggle_completed(
        self, subtask_ids: List[int], task_id: int, completed: bool, user_id: int
    ) -> Tuple[bool, int]:
        subtask = self.subtask_repo.get(subtask_ids[0])
        if not subtask:
            return False, 0
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, 0

        if subtask.task_id != task_id:
            return False, 0

        result = self.subtask_repo.bulk_toggle_completed(subtask_ids, completed)

        # Update parent task status after bulk toggle
        from app.services.task_service import TaskService

        task_service = TaskService(self.subtask_repo.session)
        task_service.update_task_status_based_on_subtasks(task_id)

        return result

    def delete_subtasks_by_ids(
        self, subtask_ids: List[int], task_id: int, user_id: int
    ) -> Tuple[bool, int]:
        subtask = self.subtask_repo.get(subtask_ids[0])
        if not subtask:
            return False, 0
        if subtask.task_id != task_id:
            return False, 0
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, 0
        return self.subtask_repo.delete_subtasks_by_ids(subtask_ids)

    def get_completion_count(
        self, task_id: int, user_id: int
    ) -> Tuple[bool, int, int, float]:
        task = self.task_repo.get_task_by_id(task_id)
        if not task:
            return False, 0, 0, 0
        if task.user_id != user_id:
            return False, 0, 0, 0

        completed, total, completion_percentage = (
            self.subtask_repo.get_completion_count(task_id)
        )
        return (
            True,
            completed,
            total,
            completion_percentage,
        )

    def toggle_subtask_completed(
        self, subtask_id: int, user_id: int
    ) -> Tuple[bool, str, Optional[Subtask]]:
        subtask = self.subtask_repo.get(subtask_id)
        if not subtask:
            return False, "Subtask not found", None
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, "You are not authorized to update this subtask", None

        subtask.is_completed = not subtask.is_completed
        updated_subtask = self.subtask_repo.update_subtask(subtask)

        # Update parent task status after toggle
        from app.services.task_service import TaskService

        task_service = TaskService(self.subtask_repo.session)
        task_service.update_task_status_based_on_subtasks(subtask.task_id)

        return True, "Subtask completion toggled successfully", updated_subtask
