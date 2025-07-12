from typing import List, Any, Optional, Dict, Tuple
from sqlalchemy.orm import Session

from database.models.subtask import Subtask
from database.repositories.base_repository import BaseRepository

from logger import get_logger

logger = get_logger(__name__)


class SubtaskRepository(BaseRepository[Subtask]):
    def __init__(self, db_session: Session):
        super().__init__(Subtask)
        self.db = db_session

    def get_subtask_by_id(self, subtask_id: int) -> Optional[Subtask]:
        return self.db.query(Subtask).filter(Subtask.id == subtask_id).first()

    def get_subtasks_by_task_id(self, task_id: int) -> List[Subtask]:
        return self.db.query(Subtask).filter(Subtask.task_id == task_id).all()

    def create_subtask(self, subtask: Subtask) -> Subtask:
        try:
            self.db.add(subtask)
            self.db.commit()
            self.db.refresh(subtask)
            return subtask
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating subtask: {e}")
            raise e

    def update_subtask(self, subtask: Subtask) -> Subtask:
        try:
            self.db.commit()
            self.db.refresh(subtask)
            return subtask
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating subtask: {e}")
            raise e

    def delete_subtask(self, subtask: Subtask) -> None:
        try:
            self.db.delete(subtask)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting subtask: {e}")
            raise e

    def reorder_subtasks(self, subtask_positions: Dict[int, int]) -> Tuple[bool, int]:
        try:
            for subtask_id, position in subtask_positions.items():
                result = (
                    self.db.query(Subtask)
                    .filter(Subtask.id == subtask_id)
                    .update({"position": position})
                )
            self.db.commit()
            return True, result
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error reordering subtasks: {e}")
            return False, 0

    def bulk_toggle_completed(
        self, subtask_ids: List[int], completed: bool
    ) -> Tuple[bool, int]:
        try:
            result = (
                self.db.query(Subtask)
                .filter(Subtask.id.in_(subtask_ids))
                .update({"is_completed": completed}, synchronize_session=False)
            )
            self.db.commit()
            return True, result
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error bulk toggling subtasks: {e}")
            return False, 0

    def delete_subtasks_by_ids(self, subtask_ids: List[int]) -> Tuple[bool, int]:
        try:
            result = (
                self.db.query(Subtask)
                .filter(Subtask.id.in_(subtask_ids))
                .delete(synchronize_session=False)
            )
            self.db.commit()
            return True, result
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting subtasks by task id: {e}")
            return False, 0

    def get_completion_count(self, task_id: int) -> Tuple[int, int, float]:
        try:
            total_count = (
                self.db.query(Subtask).filter(Subtask.task_id == task_id).count()
            )
            completed_count = (
                self.db.query(Subtask)
                .filter(Subtask.task_id == task_id, Subtask.is_completed == True)
                .count()
            )
            percentage = (completed_count / total_count) * 100 if total_count > 0 else 0
            return completed_count, total_count, percentage
        except Exception as e:
            logger.error(f"Error getting completion count: {e}")
            return 0, 0, 0.0
