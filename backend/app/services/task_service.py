import logging
from typing import List, Tuple

from app.schemas.task import TaskCreateRequest
from database.models.task import Task, TaskPriority, TaskStatus
from database.repositories.task_repository import TaskRepository
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class TaskService:
    """Service for task management."""

    def __init__(self, db_session: Session):
        """Initialize the service with the Task model."""
        self.db = db_session
        self.task_repo = TaskRepository(self.db)

    def get_all_tasks_for_user(self, user_id: int) -> Tuple[bool, str, List[Task]]:
        """Get all tasks for a user."""
        try:
            tasks = self.task_repo.get_all_tasks_for_user(user_id)
            return True, "Tasks fetched successfully", tasks
        except Exception as e:
            return False, f"Error fetching tasks: {e}", []
        
    def create_task(self, task_create_request: TaskCreateRequest) -> Tuple[bool, str, Task]:
        """Create a new task."""
        try:
            task_data = task_create_request.model_dump(exclude_unset=True)
            task_data["user_id"] = task_create_request.user_id
            
            logger.info(f"Task data: {task_data}")

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
