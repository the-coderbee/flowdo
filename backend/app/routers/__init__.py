"""
API routes package initialization.

This module exposes the blueprints for API routes.
"""

from .auth import auth_bp

__all__ = [
    "auth_bp"
]
