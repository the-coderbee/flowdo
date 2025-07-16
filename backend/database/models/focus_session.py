from typing import Optional
import uuid
from enum import Enum
from datetime import datetime
from sqlalchemy import (
    JSON,
    DateTime,
    Float,
    String,
    Integer,
    ForeignKey,
    Boolean,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship, Mapped

from .base import BaseModel
from .user import User
from .task import Task


class FocusSessionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"


class FocusMode(str, Enum):
    DEEP_WORK = "deep_work"
    SHALLOW_WORK = "shallow_work"
    CREATIVE = "creative"
    LEARNING = "learning"
    PLANNING = "planning"
    REVIEW = "review"


class DistractionLevel(str, Enum):
    MINIMAL = "minimal"
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    OVERWHELMING = "overwhelming"


class FocusSession(BaseModel):
    __tablename__ = "focus_sessions"

    uuid: Mapped[str] = mapped_column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"), nullable=True)

    focus_mode: Mapped[FocusMode] = mapped_column(
        SQLEnum(
            FocusMode,
            name="focus_mode",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
        default=FocusMode.DEEP_WORK,
    )
    status: Mapped[FocusSessionStatus] = mapped_column(
        SQLEnum(
            FocusSessionStatus,
            name="focus_session_status",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=FocusSessionStatus.PENDING,
    )

    # timing (flexible, unlike pomodoro)
    planned_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    minimum_duration: Mapped[int] = mapped_column(
        Integer, default=1800
    )  # 30 minutes minimum
    maximum_duration: Mapped[int] = mapped_column(
        Integer, default=10800
    )  # 3 hours in seconds
    actual_duration: Mapped[int] = mapped_column(Integer, nullable=True)

    # timing information
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    paused_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    pause_duration: Mapped[int] = mapped_column(Integer, default=0)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # focus quality metrics
    flow_state_achieved: Mapped[bool] = mapped_column(Boolean, default=False)
    flow_state_duration: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    deep_work_percentage: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    focus_intensity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # distraction and interruption tracking
    distraction_level: Mapped[DistractionLevel] = mapped_column(
        SQLEnum(
            DistractionLevel,
            name="distraction_level",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=True,
    )
    interruption_count: Mapped[int] = mapped_column(Integer, default=0)
    self_interruption_count: Mapped[int] = mapped_column(Integer, default=0)
    external_interruption_count: Mapped[int] = mapped_column(Integer, default=0)

    # session outcomes and notes
    objectives_set: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    objectives_achieved: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    session_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    insights_gained: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # productivity metrics
    tasks_completed: Mapped[int] = mapped_column(Integer, default=0)
    words_written: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    code_commits: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pages_read: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # environment and setup data
    environment_settings: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    apps_blocked: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    websites_blocked: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # energy and mood tracking
    energy_before: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    energy_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mood_before: Mapped[Optional[str]] = mapped_column(Integer, nullable=True)
    mood_after: Mapped[Optional[str]] = mapped_column(Integer, nullable=True)

    # break management
    break_intervals: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    break_activities: Mapped[Optional[str]] = mapped_column(JSON, nullable=True)
    break_effectiveness: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # session scoring
    overall_satisfaction: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    would_repeat_setup: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    # context and categorization
    project_category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    complexity_level: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    collaboration_involved: Mapped[bool] = mapped_column(Boolean, nullable=True)

    # relationships
    user: Mapped[User] = relationship("User", back_populates="focus_sessions")
    task: Mapped[Optional[Task]] = relationship("Task", back_populates="focus_sessions")

    @property
    def is_active(self) -> bool:
        return self.status in [
            FocusSessionStatus.IN_PROGRESS,
            FocusSessionStatus.PAUSED,
        ]

    @property
    def duration_hours(self) -> float:
        if self.actual_duration:
            return self.actual_duration / 3600.0
        return 0.0

    @property
    def duration_minutes(self) -> float:
        if self.actual_duration:
            return self.actual_duration / 60.0
        return 0.0

    @property
    def productivity_score(self) -> Optional[float]:
        if not any(
            [self.focus_intensity, self.overall_satisfaction, self.flow_state_achieved]
        ):
            return None

        score = 0
        weight_sum = 0

        if self.focus_intensity:
            score += self.focus_intensity * 0.3
            weight_sum += 0.3

        if self.overall_satisfaction:
            score += self.overall_satisfaction * 0.3
            weight_sum += 0.3

        if self.flow_state_achieved:
            score += 5 * 0.2
            weight_sum += 0.2

        if self.distraction_level:
            distraction_scores = {
                DistractionLevel.MINIMAL: 5,
                DistractionLevel.LOW: 4,
                DistractionLevel.MODERATE: 3,
                DistractionLevel.HIGH: 2,
                DistractionLevel.OVERWHELMING: 1,
            }
            score += distraction_scores[self.distraction_level] * 0.2
            weight_sum += 0.2

        return score / weight_sum if weight_sum > 0 else None

    @property
    def efficiency_ratio(self) -> Optional[float]:
        if self.planned_duration and self.actual_duration > 0:
            productive_time = self.actual_duration - self.pause_duration
            return productive_time / self.actual_duration
        return None

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "uuid": self.uuid,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "focus_mode": self.focus_mode.value,
            "status": self.status.value,
            "planned_duration": self.planned_duration,
            "actual_duration": self.actual_duration,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "flow_state_achieved": self.flow_state_achieved,
            "flow_state_duration": self.flow_state_duration,
            "deep_work_percentage": self.deep_work_percentage,
            "focus_intensity": self.focus_intensity,
            "distraction_level": (
                self.distraction_level if self.distraction_level else None
            ),
            "interruption_count": self.interruption_count,
            "objectives_set": self.objectives_set,
            "objectives_achieved": self.objectives_achieved,
            "session_notes": self.session_notes,
            "tasks_completed": self.tasks_completed,
            "energy_before": self.energy_before,
            "energy_after": self.energy_after,
            "mood_before": self.mood_before,
            "mood_after": self.mood_after,
            "overall_satisfaction": self.overall_satisfaction,
            "productivity_score": self.productivity_score,
            "efficiency_ratio": self.efficiency_ratio,
            "duration_hours": self.duration_hours,
            "duration_minutes": self.duration_minutes,
            "location": self.location,
            "project_category": self.project_category,
            "complexity_level": self.complexity_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
