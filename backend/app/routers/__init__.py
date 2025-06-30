"""
API routes package initialization.

This module exposes the blueprints for API routes.
"""

from .auth import auth_bp
from .task import task_bp
from .health import health_bp

__all__ = [
    "auth_bp",
    "task_bp",
    "health_bp"
]
