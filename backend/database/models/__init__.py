"""
Database models package.

This package contains SQLAlchemy models representing database tables.
"""

# Import all models here to ensure they are registered with SQLAlchemy
from .base import BaseModel
from .user import User
from .task import Task
from .group import Group
from .pomodoro_session import (
    PomodoroSession,
    PomodoroSessionType,
    PomodoroSessionStatus,
    InterruptionType,
)
from .focus_session import FocusSession, FocusMode, FocusSessionStatus, DistractionLevel
from .pomodoro_stats import PomodoroStats, StatsTimeframe
from .subtask import Subtask
from .tag import Tag
from .tasktag import TaskTag
from .user_token import UserToken

__all__ = [
    "BaseModel",
    "User",
    "Task",
    "Group",
    "PomodoroSession",
    "PomodoroSessionType",
    "PomodoroSessionStatus",
    "InterruptionType",
    "PomodoroStats",
    "FocusSession",
    "FocusMode",
    "FocusSessionStatus",
    "DistractionLevel",
    "StatsTimeframe",
    "Subtask",
    "Tag",
    "TaskTag",
    "UserToken",
]
