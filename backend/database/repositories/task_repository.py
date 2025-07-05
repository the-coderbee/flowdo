from datetime import datetime, UTC
from typing import List

from database.repositories.base_repository import BaseRepository
from database.models.task import Task

from sqlalchemy.orm import Session

import logging

logger = logging.getLogger(__name__)


class TaskRepository(BaseRepository[Task]):
    """Repository for Task model operations."""

    def __init__(self, db_session: Session):
        """Initialize the repository with the Task model."""
        super().__init__(Task)
        self.db = db_session
    
    def get_task_by_id(self, task_id: int) -> Task:
        """Get a task by its ID."""
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_all_tasks_for_user(self, user_id: int) -> List[Task]:
        """Get all tasks for a user."""
        return self.db.query(Task).filter(Task.user_id == user_id).all()
    
    def create_task(self, task: Task) -> Task:
        """Create a new task."""
        try:
            self.db.add(task)
            self.db.commit()
            self.db.refresh(task)
            return task
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating task: {e}")
            raise e
    
    def update_task(self, task: Task) -> Task:
        """Update a task."""
        try:
            task.updated_at = datetime.now(UTC)
            self.db.commit()
            self.db.refresh(task)
            return task
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating task: {e}")
            raise e
    
    def delete_task(self, task: Task) -> None:
        """Delete a task."""
        try:
            self.db.delete(task)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting task: {e}")
            raise e