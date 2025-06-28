import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from enum import Enum
from .base import BaseModel
from .user import User
from .tasks import Task, TaskStatus


class PomodoroSessionType(str, Enum):
    WORK = "work"
    SHORT_BREAK = "short_break"
    LONG_BREAK = "long_break"


class PomodoroSession(BaseModel):
    __tablename__ = "pomodoro_sessions"

    session_id: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"))

    session_type: Mapped[str] = mapped_column(SQLEnum("work", "short_break", "long_break", name="pomodoro_session_type"))
    status: Mapped[str] = mapped_column(SQLEnum("in_progress", "completed", "pending", "archived", "cancelled", name="task_status"))
    duration: Mapped[int] = mapped_column(Integer)

    start_time: Mapped[datetime] = mapped_column(DateTime)
    paused_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="pomodoro_sessions")
    task: Mapped["Task"] = relationship("Task", back_populates="pomodoro_sessions")
