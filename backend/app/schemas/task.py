from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from database.models.task import TaskPriority, TaskStatus

class TaskCreateRequest(BaseModel):
    """Schema for task creation request."""
    title: str
    description: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.LOW
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    estimated_pomodoros: Optional[int] = None
    completed_pomodoros: Optional[int] = None
    user_id: int
    group_id: Optional[int] = None

    model_config = {
        "use_enum_values": True, # for getting the lowercase value of the enum
        "from_attributes": True,
        "populate_by_name": True,
    }
    
    # Custom validator to ensure priority is lowercase
    def validate_lowercase(self):
        if self.priority and isinstance(self.priority, str):
            self.priority = self.priority.lower()
        return self


class TaskResponse(BaseModel):
    """Schema for task response."""
    id: int
    title: str
    description: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.LOW
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[datetime] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    estimated_pomodoros: Optional[int] = None
    completed_pomodoros: Optional[int] = None
    user_id: int
    group_id: Optional[int] = None
    tags: Optional[List[str]] = None

    model_config = {
        "from_attributes": True
    }

class TaskUpdateRequest(BaseModel):
    id: int
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None
    estimated_pomodoros: Optional[int] = None
    completed_pomodoros: Optional[int] = None
    group_id: Optional[int] = None
    tags: Optional[List[int]] = None

    model_config = {
        "from_attributes": True
    }