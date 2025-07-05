"""
API routes package initialization.

This module exposes the blueprints for API routes.
"""

from .auth import auth_bp
from .task import task_bp
from .health import health_bp
from .tag import tag_bp
from .group import group_bp

__all__ = [
    "auth_bp",
    "task_bp",
    "health_bp",
    "tag_bp",
    "group_bp"
]
