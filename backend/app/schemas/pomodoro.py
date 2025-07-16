from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, field_validator

from database.models.focus_session import (
    DistractionLevel,
    FocusMode,
    FocusSessionStatus,
)
from database.models.pomodoro_session import (
    InterruptionType,
    PomodoroSessionStatus,
    PomodoroSessionType,
)


class PomodoroSessionCreateRequest(BaseModel):
    session_type: PomodoroSessionType
    task_id: Optional[int] = None
    planned_duration: Optional[int] = None
    location: Optional[str] = None
    ambient_sound_used: Optional[str] = None
    energy_before: Optional[int] = None

    @field_validator("energy_before")
    @classmethod
    def validate_energy_before(cls, value):
        if value is not None and (value < 1 or value > 5):
            raise ValueError("Energy before must be between 1 and 5.")
        return value


class PomodoroSessionUpdateRequest(BaseModel):
    focus_quality_rating: Optional[int] = None
    productivity_rating: Optional[int] = None
    energy_after: Optional[int] = None
    session_notes: Optional[str] = None
    accomplishments: Optional[str] = None

    @field_validator("focus_quality_rating", "productivity_rating", "energy_after")
    @classmethod
    def validate_ratings(cls, value):
        if value is not None and (value < 1 or value > 5):
            raise ValueError("Rating must be between 1 and 5.")
        return value


class InterruptionLogRequest(BaseModel):
    interruption_type: InterruptionType
    interruption_duration: int
    description: Optional[str] = None


class PomodoroSessionResponse(BaseModel):
    id: int
    session_id: str
    user_id: int
    task_id: Optional[int]
    session_type: PomodoroSessionType
    status: PomodoroSessionStatus
    planned_duration: Optional[int]
    actual_duration: Optional[int]
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    completed_at: Optional[datetime]

    focus_quality_rating: Optional[int]
    productivity_rating: Optional[int]
    energy_before: Optional[int]
    energy_after: Optional[int]

    interruption_count: int
    interruption_total_time: int

    session_notes: Optional[str]
    accomplishments: Optional[str]
    ambient_sound_used: Optional[str]
    location: Optional[str]
    session_sequence: Optional[int]

    effeciveness_score: Optional[float]
    completion_percentage: Optional[float]
    duration_minutes: float

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class FocusSessionCreateRequest(BaseModel):
    focus_mode: FocusMode
    task_id: Optional[int] = None
    planned_duration: Optional[int] = None
    minimum_duration: int = 1800
    maximum_duration: Optional[int] = None
    objectives: Optional[str] = None
    location: Optional[str] = None
    energy_before: Optional[int] = None
    environment_settings: Optional[Dict[str, Any]] = None

    @field_validator("minimum_duration")
    def validate_minimum_duration(cls, value):
        if value < 900:
            raise ValueError(
                "Minimum duration must be at least 15 minutes (900 seconds)."
            )
        return value


class FocusSessionUpdateRequest(BaseModel):
    objectives_achieved: Optional[str] = None
    session_notes: Optional[str] = None
    focus_intensity: Optional[int] = None
    overall_satisfaction: Optional[int] = None
    flow_state_achieved: bool = False
    flow_state_duration: Optional[int] = None
    distraction_level: Optional[DistractionLevel] = None
    tasks_completed: int = 0
    insights_gained: Optional[str] = None

    @field_validator("focus_intensity", "overall_satisfaction")
    @classmethod
    def validate_ratings(cls, value):
        if value is not None and (value < 1 or value > 5):
            raise ValueError("Rating must be between 1 and 5.")
        return value


class FocusInterruptionRequest(BaseModel):
    is_self_interruption: bool = True
    interruption_note: Optional[str] = None


class FocusSessionResponse(BaseModel):
    id: int
    session_id: str
    user_id: int
    task_id: Optional[int]
    focus_mode: FocusMode
    status: FocusSessionStatus
    planned_duration: Optional[int]
    actual_duration: Optional[int]
    minimum_duration: int
    maximum_duration: Optional[int]

    start_time: Optional[datetime]
    end_time: Optional[datetime]
    completed_at: Optional[datetime]
    pause_duration: int

    flow_state_achieved: bool
    flow_state_duration: Optional[int]
    deep_work_percentage: Optional[float]
    focus_intensity: Optional[int]
    distraction_level: Optional[DistractionLevel]

    interruption_count: int
    self_interruption_count: int
    external_interruption_count: int

    objectives_set: Optional[str]
    objectives_achieved: Optional[str]
    session_notes: Optional[str]
    insights_gained: Optional[str]
    tasks_completed: int

    energy_before: Optional[int]
    energy_after: Optional[int]
    mood_before: Optional[int]
    mood_after: Optional[int]

    overall_satisfaction: Optional[int]
    productivity_rating: Optional[int]
    efficiency_ratio: Optional[float]

    location: Optional[str]
    project_category: Optional[str]
    complexity_level: Optional[str]

    duration_hours: float
    duration_minutes: float

    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class PomodoroStatsResponse(BaseModel):
    """Schema for Pomodoro statistics response."""

    id: int
    user_id: int
    timeframe: str
    start_date: date
    end_date: date

    # Session metrics
    total_sessions_planned: int
    total_sessions_completed: int
    work_sessions_completed: int
    completion_rate: Optional[float]

    # Time metrics
    total_focus_hours: float
    total_focus_minutes: float
    average_session_minutes: Optional[float]
    total_break_time: int

    # Quality metrics
    average_focus_quality: Optional[float]
    average_productivity_rating: Optional[float]
    efficiency_score: Optional[float]
    productivity_index: Optional[float]

    # Energy and improvement
    average_energy_before: Optional[float]
    average_energy_after: Optional[float]
    energy_improvement: Optional[float]

    # Streaks and patterns
    current_streak_days: int
    longest_streak_days: int
    streak_active: bool
    most_productive_hour: Optional[int]
    peak_focus_day: Optional[int]

    # Interruptions
    total_interruptions: int
    average_interruptions_per_session: Optional[float]

    # Tasks
    tasks_completed_during_sessions: int
    average_task_completion_rate: Optional[float]

    # Goals
    daily_session_goal: Optional[int]
    goal_achievement_rate: Optional[float]

    # Advanced metrics
    focus_consistency_score: Optional[float]
    improvement_trend: Optional[float]
    burnout_risk_score: Optional[float]

    # Metadata
    last_calculated: datetime
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class DailySummaryResponse(BaseModel):
    """Schema for daily summary response."""

    date: date
    total_sessions: int
    completed_work_sessions: int
    completed_break_sessions: int
    total_focus_time_minutes: float
    total_break_time_minutes: float
    average_focus_quality: Optional[float]
    average_productivity: Optional[float]
    sessions: List[PomodoroSessionResponse]


class SessionRecommendationResponse(BaseModel):
    """Schema for session recommendation response."""

    session_type: PomodoroSessionType
    duration_minutes: int
    reason: str


class ProductivityPatternsResponse(BaseModel):
    """Schema for productivity patterns analysis."""

    hourly_productivity: Dict[int, Dict[str, Any]]
    daily_productivity: Dict[int, Dict[str, Any]]


class FocusStatsResponse(BaseModel):
    """Schema for focus session statistics."""

    total_sessions: int
    completed_sessions: int
    completion_rate: float
    total_focus_time_hours: float
    total_focus_time_minutes: float
    average_session_minutes: Optional[float]
    longest_session_minutes: Optional[float]
    flow_sessions: int
    flow_rate: float
    average_focus_intensity: Optional[float]
    average_satisfaction: Optional[float]
    days_analyzed: int
    period_start: str
    period_end: str


class FocusModeAnalysisResponse(BaseModel):
    """Schema for focus mode analysis."""

    mode_stats: Dict[str, Dict[str, Any]]


class ProductivityInsightsResponse(BaseModel):
    """Schema for productivity insights."""

    insights: List[str]
    recommendations: List[str]
    best_focus_mode: Optional[FocusMode]
    productivity_trend: str


class FlowStateAnalysisResponse(BaseModel):
    """Schema for flow state analysis."""

    flow_sessions_count: int
    total_flow_time_hours: float
    average_flow_duration_minutes: float
    flow_triggers: Dict[str, Any]
    mode_breakdown: Dict[str, int]
    location_breakdown: Dict[str, int]
    duration_breakdown: Dict[str, int]


class FocusRecommendationResponse(BaseModel):
    """Schema for focus session recommendation."""

    focus_mode: FocusMode
    suggested_duration_minutes: int
    reasons: List[str]
    tips: List[str]


class SessionFilterRequest(BaseModel):
    """Schema for filtering sessions."""

    start_date: Optional[date] = None
    end_date: Optional[date] = None
    session_type: Optional[PomodoroSessionType] = None
    status: Optional[PomodoroSessionStatus] = None
    task_id: Optional[int] = None
    limit: int = 50

    @field_validator("limit")
    @classmethod
    def validate_limit(cls, v):
        if v < 1 or v > 200:
            raise ValueError("Limit must be between 1 and 200")
        return v

    @field_validator("task_id")
    @classmethod
    def validate_task_id(cls, v):
        if isinstance(v, str):
            return int(v) if v else None
        return v

    @field_validator("start_date", "end_date")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD")
        return v

    @field_validator("session_type")
    @classmethod
    def parse_session_type(cls, v):
        if isinstance(v, str):
            try:
                return PomodoroSessionType(v)
            except ValueError:
                raise ValueError("Invalid session_type")
        return v

    @field_validator("status")
    @classmethod
    def parse_status(cls, v):
        if isinstance(v, str):
            try:
                return PomodoroSessionStatus(v)
            except ValueError:
                raise ValueError("Invalid status")
        return v


class FocusFilterRequest(BaseModel):
    """Schema for filtering focus sessions."""

    user_id: int
    start_date: Optional[date]
    end_date: Optional[date]
    focus_mode: Optional[FocusMode]
    limit: int = 50

    @field_validator("limit")
    @classmethod
    def validate_limit(cls, v):
        if v < 1 or v > 200:
            raise ValueError("Limit must be between 1 and 200")
        return v

    @field_validator("start_date", "end_date")
    @classmethod
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("Invalid date format. Use YYYY-MM-DD")
        return v

    @field_validator("focus_mode")
    @classmethod
    def parse_focus_mode(cls, v):
        if isinstance(v, str):
            try:
                return FocusMode(v)
            except ValueError:
                raise ValueError("Invalid focus_mode")
        return v
