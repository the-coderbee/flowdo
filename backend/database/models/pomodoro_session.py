import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum as SQLEnum, Text, Boolean, values
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from enum import Enum
from .base import BaseModel
from .user import User
from .task import Task, TaskStatus


class PomodoroSessionType(str, Enum):
    WORK = "work"
    SHORT_BREAK = "short_break"
    LONG_BREAK = "long_break"


class PomodoroSessionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    ABANDONED = "abandoned"
    INTERRUPTED = "interrupted"


class InterruptionType(str, Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    TECHNICAL = "technical"
    EMERGENCY = "emergency"


class PomodoroSession(BaseModel):
    __tablename__ = "pomodoro_sessions"

    uuid: Mapped[str] = mapped_column(
        String(36), default=lambda: str(uuid.uuid4()), unique=True
    )
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"))

    session_type: Mapped[PomodoroSessionType] = mapped_column(
        SQLEnum(
            PomodoroSessionType,
            name="pomodoro_session_type",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=False,
    )
    status: Mapped[PomodoroSessionStatus] = mapped_column(
        SQLEnum(
            PomodoroSessionStatus,
            name="pomodoro_session_status",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        default=PomodoroSessionStatus.PENDING,
    )
    planned_duration: Mapped[int] = mapped_column(Integer)
    actual_duration: Mapped[int] = mapped_column(Integer, nullable=True)

    # timing informations
    start_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    paused_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resumed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    end_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # session quality and effectiveness
    focus_quality_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    productivity_rating: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    energy_before: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    energy_after: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # interruption tracking
    interruption_count: Mapped[int] = mapped_column(Integer, default=0)
    interruption_total_time: Mapped[int] = mapped_column(Integer, default=0)
    interruption_type: Mapped[Optional[InterruptionType]] = mapped_column(
        SQLEnum(
            InterruptionType,
            name="interruption_type",
            values_callable=lambda enum: [e.value for e in enum],
        ),
        nullable=True,
    )

    # session context and notes
    session_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    accomplishments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    distraction_log: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # environmental context
    ambient_sound_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # home, office, cafe, etc
    device_used: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )  # laptop, phone, tablet, etc

    # break recommendations
    break_activity: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    break_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    # session sequence information
    session_sequence: Mapped[int] = mapped_column(
        Integer, nullable=True
    )  # 1st, 2nd, 3rd, etc
    session_until_long_break: Mapped[int] = mapped_column(
        Integer, nullable=True
    )  # 4, 8, 12, etc
    session_until_short_break: Mapped[int] = mapped_column(
        Integer, nullable=True
    )  # 2, 4, 6, etc

    # relationships
    user: Mapped["User"] = relationship("User", back_populates="pomodoro_sessions")
    task: Mapped["Task"] = relationship("Task", back_populates="pomodoro_sessions")

    @property
    def is_active(self) -> bool:
        """Check if the session is currently active"""
        return self.status in [
            PomodoroSessionStatus.IN_PROGRESS,
            PomodoroSessionStatus.PAUSED,
        ]

    @property
    def duration_minutes(self) -> float:
        """Duration of the session in minutes"""
        if self.actual_duration:
            return self.actual_duration / 60.0
        return 0.0

    @property
    def effeciveness_score(self) -> Optional[float]:
        if self.focus_quality_rating and self.productivity_rating:
            return self.focus_quality_rating * 0.6 + self.productivity_rating * 0.4
        return None

    @property
    def completion_percentage(self) -> float:
        if self.actual_duration and self.planned_duration:
            return min(100.0, (self.actual_duration / self.planned_duration) * 100)
        return 0.0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "uuid": self.uuid,
            "user_id": self.user_id,
            "task_id": self.task_id,
            "session_type": self.session_type.value,
            "status": self.status.value,
            "planned_duration": self.planned_duration,
            "actual_duration": self.actual_duration,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "completed_at": (
                self.completed_at.isoformat() if self.completed_at else None
            ),
            "focus_quality_rating": self.focus_quality_rating,
            "productivity_rating": self.productivity_rating,
            "energy_before": self.energy_before,
            "energy_after": self.energy_after,
            "interruption_count": self.interruption_count,
            "interruption_total_time": self.interruption_total_time,
            "session_notes": self.session_notes,
            "accomplishments": self.accomplishments,
            "ambient_sound_used": self.ambient_sound_used,
            "location": self.location,
            "session_sequence": self.session_sequence,
            "effectiveness_score": self.effectiveness_score,
            "completion_percentage": self.completion_percentage,
            "duration_minutes": self.duration_minutes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
