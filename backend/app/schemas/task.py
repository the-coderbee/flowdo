from datetime import datetime
from typing import Optional, List, Union
from pydantic import BaseModel, field_validator
from database.models.task import TaskPriority, TaskStatus

class TaskCreateRequest(BaseModel):
    """Schema for task creation request."""
    title: str
    description: Optional[str] = None
    priority: Optional[TaskPriority] = TaskPriority.LOW
    status: TaskStatus = TaskStatus.PENDING
    due_date: Optional[Union[datetime, str]] = None
    estimated_pomodoros: Optional[int] = None
    completed_pomodoros: Optional[int] = None
    user_id: int
    group_id: Optional[int] = None

    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            # Handle various date formats
            from dateutil import parser
            try:
                return parser.parse(value)
            except Exception:
                # If all else fails, try to parse as ISO format
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value

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
        "from_attributes": True,
        "use_enum_values": True,
    }

class TaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    due_date: Optional[Union[datetime, str]] = None
    estimated_pomodoros: Optional[int] = None
    completed_pomodoros: Optional[int] = None
    group_id: Optional[int] = None
    tags: Optional[List[int]] = None

    @field_validator('due_date', mode='before')
    @classmethod
    def parse_due_date(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            # Handle various date formats
            from dateutil import parser
            try:
                return parser.parse(value)
            except Exception:
                # If all else fails, try to parse as ISO format
                return datetime.fromisoformat(value.replace('Z', '+00:00'))
        return value

    model_config = {
        "from_attributes": True,
        "use_enum_values": True,
    }