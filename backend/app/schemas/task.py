from datetime import datetime
from .tag import TagResponse
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
    is_in_my_day: Optional[bool] = False
    starred: Optional[bool] = False
    tag_ids: Optional[List[int]] = None
    user_id: int
    group_id: Optional[int] = None

    @field_validator("due_date", mode="before")
    @classmethod
    def parse_due_date(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            # Handle ISO date format (YYYY-MM-DD) from HTML date inputs
            if len(value) == 10 and value.count("-") == 2:
                try:
                    return datetime.fromisoformat(value)
                except ValueError:
                    pass

            # Handle ISO datetime format with Z suffix
            if value.endswith("Z"):
                try:
                    return datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError:
                    pass

            # Handle other ISO datetime formats
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                pass

            # Only use dateutil parser as last resort with explicit timezone handling
            from dateutil import parser

            try:
                return parser.parse(
                    value, tzinfos={"GM": None}
                )  # Ignore unknown timezones
            except Exception:
                raise ValueError(f"Unable to parse date: {value}")
        return value

    model_config = {
        "use_enum_values": True,  # for getting the lowercase value of the enum
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
    is_in_my_day: Optional[bool] = False
    starred: Optional[bool] = False
    user_id: int
    group_id: Optional[int] = None
    tags: Optional[List[TagResponse]] = None

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
    is_in_my_day: Optional[bool] = None
    starred: Optional[bool] = None
    group_id: Optional[int] = None
    tag_ids: Optional[List[int]] = None

    @field_validator("due_date", mode="before")
    @classmethod
    def parse_due_date(cls, value):
        if value is None or value == "":
            return None
        if isinstance(value, str):
            # Handle ISO date format (YYYY-MM-DD) from HTML date inputs
            if len(value) == 10 and value.count("-") == 2:
                try:
                    return datetime.fromisoformat(value)
                except ValueError:
                    pass

            # Handle ISO datetime format with Z suffix
            if value.endswith("Z"):
                try:
                    return datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError:
                    pass

            # Handle other ISO datetime formats
            try:
                return datetime.fromisoformat(value)
            except ValueError:
                pass

            # Only use dateutil parser as last resort with explicit timezone handling
            from dateutil import parser

            try:
                return parser.parse(
                    value, tzinfos={"GM": None}
                )  # Ignore unknown timezones
            except Exception:
                raise ValueError(f"Unable to parse date: {value}")
        return value

    model_config = {
        "from_attributes": True,
        "use_enum_values": True,
    }
