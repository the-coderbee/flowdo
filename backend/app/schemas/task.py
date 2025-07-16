from datetime import datetime, date
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

    @field_validator("priority")
    @classmethod
    def normalize_priority(cls, v):
        if isinstance(v, str):
            if "," in v:
                return [p.strip().lower() for p in v.split(",") if p.strip()]
            return v.strip().lower()
        elif isinstance(v, list):
            return [p.lower() if isinstance(p, str) else p for p in v]
        return v


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


class TaskFilterRequest(BaseModel):
    """Schema for filtering tasks."""

    # Pagination
    page: int = 1
    page_size: int = 25

    # Sorting
    sort_by: str = "created_at"
    sort_order: str = "desc"

    # Filters
    status: Optional[Union[str, List[str]]] = None
    priority: Optional[Union[str, List[str]]] = None
    starred: Optional[bool] = None
    completed: Optional[bool] = None
    overdue: Optional[bool] = None
    search: Optional[str] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None

    @field_validator("page")
    @classmethod
    def validate_page(cls, v):
        if isinstance(v, str):
            v = int(v)
        if v < 1:
            raise ValueError("Page must be greater than 0")
        return v

    @field_validator("page_size")
    @classmethod
    def validate_page_size(cls, v):
        if isinstance(v, str):
            v = int(v)
        if v < 1 or v > 100:
            raise ValueError("Page size must be between 1 and 100")
        return v

    @field_validator("sort_by")
    @classmethod
    def validate_sort_by(cls, v):
        allowed_fields = ["created_at", "updated_at", "due_date", "priority", "title"]
        if v not in allowed_fields:
            raise ValueError(f"Sort by must be one of: {', '.join(allowed_fields)}")
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v):
        if v.lower() not in ["asc", "desc"]:
            raise ValueError("Sort order must be 'asc' or 'desc'")
        return v.lower()

    @field_validator("status")
    @classmethod
    def parse_status(cls, v):
        if isinstance(v, str):
            # Handle comma-separated values
            if "," in v:
                return [s.strip() for s in v.split(",") if s.strip()]
            return v.strip()
        return v

    @field_validator("priority")
    @classmethod
    def parse_priority(cls, v):
        if isinstance(v, str):
            # Handle comma-separated values
            if "," in v:
                return [p.strip() for p in v.split(",") if p.strip()]
            return v.strip()
        return v

    @field_validator("starred", "completed", "overdue")
    @classmethod
    def parse_boolean(cls, v):
        if isinstance(v, str):
            return v.lower() in ["true", "1", "yes"]
        return v

    @field_validator("search")
    @classmethod
    def parse_search(cls, v):
        if isinstance(v, str):
            return v.strip() if v.strip() else None
        return v

    @field_validator("due_date_from", "due_date_to")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v.strip(), "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD")
        return v

    def to_service_filters(self) -> dict:
        """Convert to format expected by service layer."""
        filters = {}

        # Add non-None filters
        if self.status is not None:
            filters["status"] = self.status
        if self.priority is not None:
            filters["priority"] = self.priority
        if self.starred is not None:
            filters["starred"] = self.starred
        if self.completed is not None:
            filters["completed"] = self.completed
        if self.overdue is not None:
            filters["overdue"] = self.overdue
        if self.search is not None:
            filters["search"] = self.search

        # Handle date range
        if self.due_date_from is not None or self.due_date_to is not None:
            due_date_filter = {}
            if self.due_date_from:
                due_date_filter["from"] = self.due_date_from
            if self.due_date_to:
                due_date_filter["to"] = self.due_date_to
            filters["due_date"] = due_date_filter

        return filters
