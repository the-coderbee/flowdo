"""
Subtask schemas.
"""

from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime


class SubtaskCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    position: int
    task_id: int

    model_config = {
        "from_attributes": True,
    }


class SubtaskUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    is_completed: Optional[bool] = None

    model_config = {
        "from_attributes": True,
    }


class SubtaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    position: int
    task_id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class SubtaskReorderRequest(BaseModel):
    subtask_positions: Dict[int, int]

    model_config = {
        "from_attributes": True,
    }


class SubtaskBulkToggleRequest(BaseModel):
    subtask_ids: List[int]
    task_id: int
    completed: bool

    model_config = {
        "from_attributes": True,
    }


class SubtaskDeleteRequest(BaseModel):
    subtask_ids: List[int]

    model_config = {
        "from_attributes": True,
    }


class SubtaskCompletionStatsResponse(BaseModel):
    total: int
    completed: int
    completion_percentage: float
    task_id: int

    model_config = {
        "from_attributes": True,
    }


class SubtaskBulkOperationResponse(BaseModel):
    affected_count: int
    message: str

    model_config = {
        "from_attributes": True,
    }
