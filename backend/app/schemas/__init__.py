"""
Schema package for request/response validation.
"""

from .auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    AuthResponse,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    RefreshTokenRequest,
)

from .task import TaskCreateRequest, TaskUpdateRequest, TaskResponse

from .tag import TagCreateRequest, TagUpdateRequest, TagResponse

from .group import GroupCreateRequest, GroupUpdateRequest, GroupResponse

from .subtask import SubtaskCreateRequest, SubtaskUpdateRequest, SubtaskResponse


__all__ = [
    "UserRegisterRequest",
    "UserLoginRequest",
    "TokenResponse",
    "UserResponse",
    "AuthResponse",
    "PasswordResetRequest",
    "PasswordResetConfirmRequest",
    "RefreshTokenRequest",
    "TaskCreateRequest",
    "TaskUpdateRequest",
    "TaskResponse",
    "TagCreateRequest",
    "TagUpdateRequest",
    "TagResponse",
    "GroupCreateRequest",
    "GroupUpdateRequest",
    "GroupResponse",
    "SubtaskCreateRequest",
    "SubtaskUpdateRequest",
    "SubtaskResponse",
]
