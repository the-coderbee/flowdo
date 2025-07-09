from typing import Optional, List
from enum import Enum
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, Enum as SqlEnum, Boolean
from sqlalchemy.orm import mapped_column, relationship, Mapped
from .base import BaseModel
from .user import User
from .group import Group


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
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
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    priority: Mapped[TaskPriority] = mapped_column(SqlEnum(
        TaskPriority, name="task_priority", values_callable=lambda enum: [e.value for e in enum]), 
        nullable=False, default=TaskPriority.LOW)
    status: Mapped[TaskStatus] = mapped_column(SqlEnum(
        TaskStatus, name="task_status", values_callable=lambda enum: [e.value for e in enum]), 
        nullable=False, default=TaskStatus.PENDING)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    estimated_pomodoros: Mapped[int] = mapped_column(Integer, nullable=True, default=0)
    completed_pomodoros: Mapped[int] = mapped_column(Integer, nullable=True, default=0)

    is_in_my_day: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    starred: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("groups.id"), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="tasks")
    group: Mapped["Group"] = relationship("Group", back_populates="tasks")
    tags: Mapped[List["TaskTag"]] = relationship("TaskTag", back_populates="task")
    pomodoro_sessions: Mapped[List["PomodoroSession"]] = relationship("PomodoroSession", back_populates="task")
    subtasks: Mapped[List["Subtask"]] = relationship("Subtask", back_populates="task")

    def __repr__(self) -> str:
        return f"<Task {self.title}>"
    
    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority.value if self.priority else None,
            'status': self.status.value if self.status else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'estimated_pomodoros': self.estimated_pomodoros,
            'completed_pomodoros': self.completed_pomodoros,
            'is_in_my_day': self.is_in_my_day,
            'starred': self.starred,
            'user_id': self.user_id,
            'group_id': self.group_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
