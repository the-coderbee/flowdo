"""
API routes package initialization.

This module exposes the blueprints for API routes.
"""

from .auth import auth_bp
from .dashboard import dashboard_bp
from .focus import focus_bp
from .group import group_bp
from .health import health_bp
from .pomodoro import pomodoro_bp
from .subtask import subtask_bp
from .tag import tag_bp
from .task import task_bp

__all__ = [
    "auth_bp",
    "dashboard_bp",
    "focus_bp",
    "group_bp",
    "health_bp",
    "pomodoro_bp",
    "subtask_bp",
    "tag_bp",
    "task_bp",
]
