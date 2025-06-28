from typing import Optional, List
from enum import Enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import mapped_column, relationship, Mapped
from .base import BaseModel
from .user import User
from .groups import Group


class TaskStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PENDING = "pending"
    ARCHIVED = "archived"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Task(BaseModel):
    __tablename__ = "tasks"

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(String(255))

    priority: Mapped[str] = mapped_column(SQLEnum("low", "medium", "high", "urgent", name="task_priority"))
    status: Mapped[str] = mapped_column(SQLEnum("in_progress", "completed", "pending", "archived", "cancelled", name="task_status"))
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    estimated_pomodoros: Mapped[int] = mapped_column(Integer)
    completed_pomodoros: Mapped[int] = mapped_column(Integer)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    group_id: Mapped[int] = mapped_column(Integer, ForeignKey("groups.id"))

    user: Mapped["User"] = relationship("User", back_populates="tasks")
    group: Mapped["Group"] = relationship("Group", back_populates="tasks")
    tags: Mapped[List["TaskTag"]] = relationship("TaskTag", back_populates="task")
    pomodoro_sessions: Mapped[List["PomodoroSession"]] = relationship("PomodoroSession", back_populates="task")
    subtasks: Mapped[List["Subtask"]] = relationship("Subtask", back_populates="task")

    def __repr__(self) -> str:
        return f"<Task {self.title}>"
