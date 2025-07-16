from datetime import datetime, UTC
from typing import List, Any, Optional, Dict, Tuple
from sqlalchemy.orm import Session

from database.models.subtask import Subtask
from database.repositories.base_repository import BaseRepository

from logger import get_logger

logger = get_logger(__name__)


class SubtaskRepository(BaseRepository[Subtask]):
    def __init__(self, session: Session):
        super().__init__(Subtask, session)

    def create_subtask(self, subtask: Subtask) -> Subtask:
        self.session.add(subtask)
        self.session.flush()
        self.session.refresh(subtask)
        return subtask

    def update_subtask(self, subtask: Subtask) -> Subtask:
        subtask.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(subtask)
        return subtask

    def get_subtasks_by_task_id(self, task_id: int) -> List[Subtask]:
        return self.session.query(Subtask).filter(Subtask.task_id == task_id).all()

    def get_completion_count(self, task_id: int) -> Tuple[int, int, float]:
        total_count = (
            self.session.query(Subtask).filter(Subtask.task_id == task_id).count()
        )
        completed_count = (
            self.session.query(Subtask)
            .filter(Subtask.task_id == task_id, Subtask.is_completed == True)
            .count()
        )
        percentage = (completed_count / total_count) * 100 if total_count > 0 else 0
        return completed_count, total_count, percentage

    def reorder_subtasks(self, subtask_positions: Dict[int, int]) -> Tuple[bool, int]:
        for subtask_id, position in subtask_positions.items():
            result = (
                self.session.query(Subtask)
                .filter(Subtask.id == subtask_id)
                .update({"position": position})
            )
        self.session.flush()
        return True, result

    def bulk_toggle_completed(
        self, subtask_ids: List[int], completed: bool
    ) -> Tuple[bool, int]:
        result = (
            self.session.query(Subtask)
            .filter(Subtask.id.in_(subtask_ids))
            .update({"is_completed": completed}, synchronize_session=False)
        )
        self.session.flush()
        return True, result

    def delete_subtask(self, subtask: Subtask) -> None:
        self.session.delete(subtask)

    def delete_subtasks_by_ids(self, subtask_ids: List[int]) -> Tuple[bool, int]:
        result = (
            self.session.query(Subtask)
            .filter(Subtask.id.in_(subtask_ids))
            .delete(synchronize_session=False)
        )
        self.session.flush()
        return True, result
