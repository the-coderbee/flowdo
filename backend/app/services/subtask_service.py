from typing import List, Dict, Tuple, Any
from sqlalchemy.orm import Session

from database.repositories.subtask_repository import SubtaskRepository
from database.models.subtask import Subtask
from database.repositories.task_repository import TaskRepository


class SubtaskService:
    def __init__(self, db_session: Session):
        self.subtask_repo = SubtaskRepository(db_session)
        self.task_repo = TaskRepository(db_session)

    def get_subtask_by_id(self, subtask_id: int, user_id: int = None) -> Subtask:
        return self.subtask_repo.get_subtask_by_id(subtask_id)

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
    ) -> Tuple[bool, str, Subtask]:
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
    ) -> Tuple[bool, str, Subtask]:
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        
        # Store original completion status to check if it changed
        original_subtask = self.subtask_repo.get_subtask_by_id(subtask.id)
        original_completion_status = original_subtask.is_completed if original_subtask else None
        
        updated_subtask = self.subtask_repo.update_subtask(subtask)
        
        # If completion status changed, update parent task status
        if original_completion_status is not None and original_completion_status != subtask.is_completed:
            from app.services.task_service import TaskService
            task_service = TaskService(self.subtask_repo.db_session)
            task_service.update_task_status_based_on_subtasks(subtask.task_id)
        
        return (
            True,
            "Subtask updated successfully",
            updated_subtask,
        )

    def delete_subtask(
        self, subtask: Subtask, user_id: int
    ) -> Tuple[bool, str, Subtask]:
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        
        task_id = subtask.task_id
        result = self.subtask_repo.delete_subtask(subtask)
        
        # Update parent task status after deletion
        from app.services.task_service import TaskService
        task_service = TaskService(self.subtask_repo.db_session)
        task_service.update_task_status_based_on_subtasks(task_id)
        
        return (
            True,
            "Subtask deleted successfully",
            result,
        )

    def reorder_subtasks(
        self, user_id: int, task_id: int, subtask_positions: Dict[int, int]
    ) -> Tuple[bool, int]:
        task = self.task_repo.get_task_by_id(task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        return (
            True,
            "Subtasks reordered successfully",
            self.subtask_repo.reorder_subtasks(subtask_positions),
        )

    def bulk_toggle_completed(
        self, subtask_ids: List[int], task_id: int, completed: bool, user_id: int
    ) -> Tuple[bool, str, int]:
        subtask = self.subtask_repo.get_subtask_by_id(subtask_ids[0])
        if not subtask:
            return False, "Subtask not found", None
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, "You are not authorized to access this task", None

        if subtask.task_id != task_id:
            return False, "Subtask does not belong to this task", None

        result = self.subtask_repo.bulk_toggle_completed(subtask_ids, completed)
        
        # Update parent task status after bulk toggle
        from app.services.task_service import TaskService
        task_service = TaskService(self.subtask_repo.db_session)
        task_service.update_task_status_based_on_subtasks(task_id)
        
        return (
            True,
            "Subtasks bulk toggled completed successfully",
            result,
        )

    def delete_subtasks_by_ids(
        self, subtask_ids: List[int], task_id: int, user_id: int
    ) -> Tuple[bool, str, int]:
        subtask = self.subtask_repo.get_subtask_by_id(subtask_ids[0])
        if not subtask:
            return False, "Task not found", None
        if subtask.task_id != task_id:
            return False, "Subtask does not belong to this task", None
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        return (
            True,
            "Subtasks deleted successfully",
            self.subtask_repo.delete_subtasks_by_ids(subtask_ids),
        )

    def get_completion_count(
        self, task_id: int, user_id: int
    ) -> Tuple[bool, str, Dict[str, Any]]:
        task = self.task_repo.get_task_by_id(task_id)
        if not task:
            return False, "Task not found", None
        if task.user_id != user_id:
            return False, "You are not authorized to access this task", None
        
        completed, total, percentage = self.subtask_repo.get_completion_count(task_id)
        return (
            True,
            "Completion count fetched successfully",
            {"completed": completed, "total": total, "completion_percentage": percentage},
        )

    def toggle_subtask_completed(
        self, subtask_id: int, user_id: int
    ) -> Tuple[bool, str, Subtask]:
        subtask = self.subtask_repo.get_subtask_by_id(subtask_id)
        if not subtask:
            return False, "Subtask not found", None
        task = self.task_repo.get_task_by_id(subtask.task_id)
        if not task or task.user_id != user_id:
            return False, "You are not authorized to update this subtask", None
        
        subtask.is_completed = not subtask.is_completed
        updated_subtask = self.subtask_repo.update_subtask(subtask)
        
        # Update parent task status after toggle
        from app.services.task_service import TaskService
        task_service = TaskService(self.subtask_repo.db_session)
        task_service.update_task_status_based_on_subtasks(subtask.task_id)
        
        return True, "Subtask completion toggled successfully", updated_subtask
