from datetime import UTC, date, datetime
from enum import Enum
from typing import Optional
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    String,
    Float,
    ForeignKey,
    Integer,
    Enum as SQLEnum,
    Date,
    values,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import BaseModel


class StatsTimeframe(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class PomodoroStats(BaseModel):
    __tablename__ = "pomodoro_stats"

    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    timeframe: Mapped[StatsTimeframe] = mapped_column(
        SQLEnum(
            StatsTimeframe,
            name="stats_timeframe_enum",
            values_callable=lambda enum: [e.value for e in enum],
        ),
    )

    # date range for the stats record
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)

    # session counts
    total_sessions_planned: Mapped[int] = mapped_column(Integer, default=0)
    total_sessions_completed: Mapped[int] = mapped_column(Integer, default=0)
    total_sessions_abandoned: Mapped[int] = mapped_column(Integer, default=0)

    # work session specifics
    work_sessions_completed: Mapped[int] = mapped_column(Integer, default=0)
    work_sessions_abandoned: Mapped[int] = mapped_column(Integer, default=0)

    # break session specifics
    short_breaks_completed: Mapped[int] = mapped_column(Integer, default=0)
    long_breaks_completed: Mapped[int] = mapped_column(Integer, default=0)
    breaks_skipped: Mapped[int] = mapped_column(Integer, default=0)

    # time tracking (in seconds)
    total_focus_time: Mapped[int] = mapped_column(Integer, default=0)
    total_planned_time: Mapped[int] = mapped_column(Integer, default=0)
    total_break_time: Mapped[int] = mapped_column(Integer, default=0)
    total_pause_time: Mapped[int] = mapped_column(Integer, default=0)

    # quality metrics (avgs)
    avg_focus_quality: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, default=None
    )
    avg_productivity_rating: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True, default=None
    )
    avg_energy_before: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avg_energy_after: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # interruption stats
    total_interruptions: Mapped[int] = mapped_column(Integer, default=0)
    avg_interruptions_per_session: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    total_interruption_time: Mapped[int] = mapped_column(Integer, default=0)

    # complerion and efficiency stats
    completion_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    avg_session_length: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    efficiency_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # streak information
    current_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    streak_active: Mapped[bool] = mapped_column(Boolean, default=False)

    # peak productiivity patterns
    most_productive_hour: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    least_productive_hour: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    peak_focus_day: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # task completion correlation
    tasks_completed_during_session: Mapped[int] = mapped_column(Integer, default=0)
    tasks_worked_on: Mapped[int] = mapped_column(Integer, default=0)
    avg_task_completion_rate: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )

    # goal tracking
    daily_session_goal: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    daily_time_goal: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )  # In seconds
    goal_achievement_rate: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )  # % of days goals met

    # Advanced analytics
    focus_consistency_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )  # How consistent is focus
    improvement_trend: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )  # Positive = improving
    burnout_risk_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )  # 0-1, higher = more risk

    # Environmental correlations (JSON data)
    location_stats: Mapped[Optional[str]] = mapped_column(
        JSON, nullable=True
    )  # Best/worst locations
    ambient_sound_stats: Mapped[Optional[str]] = mapped_column(
        JSON, nullable=True
    )  # Most effective sounds
    time_of_day_stats: Mapped[Optional[str]] = mapped_column(
        JSON, nullable=True
    )  # Hourly breakdown

    # Recommendations generated
    recommendations: Mapped[Optional[str]] = mapped_column(
        JSON, nullable=True
    )  # AI-generated recommendations
    insights: Mapped[Optional[str]] = mapped_column(
        JSON, nullable=True
    )  # Key insights discovered

    # Metadata
    last_calculated: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC)
    )
    calculation_version: Mapped[str] = mapped_column(
        String(10), default="1.0"
    )  # For analytics versioning

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="pomodoro_stats")  # type: ignore

    def __repr__(self) -> str:
        return f"<PomodoroStats {self.user_id} - {self.timeframe} - {self.start_date}>"

    @property
    def total_focus_hours(self) -> float:
        """Get total focus time in hours."""
        return self.total_focus_time / 3600 if self.total_focus_time else 0.0

    @property
    def total_focus_minutes(self) -> float:
        """Get total focus time in minutes."""
        return self.total_focus_time / 60 if self.total_focus_time else 0.0

    @property
    def average_session_minutes(self) -> Optional[float]:
        """Get average session length in minutes."""
        if self.average_session_length:
            return self.average_session_length / 60
        return None

    @property
    def productivity_index(self) -> Optional[float]:
        """Calculate overall productivity index (0-100)."""
        if not all(
            [self.completion_rate, self.avg_focus_quality, self.efficiency_score]
        ):
            return None

        # Weighted combination of key metrics
        index = (
            (self.completion_rate or 0) * 0.4  # 40% completion rate
            + (self.average_focus_quality / 5 * 100) * 0.3  # 30% focus quality
            + (self.efficiency_score or 0) * 0.3  # 30% efficiency
        )
        return min(100, max(0, index))

    @property
    def energy_improvement(self) -> Optional[float]:
        """Calculate energy improvement (after - before)."""
        if self.avg_energy_after and self.avg_energy_before:
            return self.avg_energy_after - self.avg_energy_before
        return None

    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "timeframe": self.timeframe.value,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            # Session metrics
            "total_sessions_planned": self.total_sessions_planned,
            "total_sessions_completed": self.total_sessions_completed,
            "work_sessions_completed": self.work_sessions_completed,
            "completion_rate": self.completion_rate,
            # Time metrics
            "total_focus_hours": self.total_focus_hours,
            "total_focus_minutes": self.total_focus_minutes,
            "average_session_minutes": self.average_session_minutes,
            "total_break_time": self.total_break_time,
            # Quality metrics
            "average_focus_quality": self.avg_focus_quality,
            "average_productivity_rating": self.avg_productivity_rating,
            "efficiency_score": self.efficiency_score,
            "productivity_index": self.productivity_index,
            # Energy and improvement
            "average_energy_before": self.avg_energy_before,
            "average_energy_after": self.avg_energy_after,
            "energy_improvement": self.energy_improvement,
            # Streaks and patterns
            "current_streak_days": self.current_streak_days,
            "longest_streak_days": self.longest_streak_days,
            "streak_active": self.streak_active,
            "most_productive_hour": self.most_productive_hour,
            "peak_focus_day": self.peak_focus_day,
            # Interruptions
            "total_interruptions": self.total_interruptions,
            "average_interruptions_per_session": self.avg_interruptions_per_session,
            # Tasks
            "tasks_completed_during_session": self.tasks_completed_during_session,
            "average_task_completion_rate": self.avg_task_completion_rate,
            # Goals
            "daily_session_goal": self.daily_session_goal,
            "goal_achievement_rate": self.goal_achievement_rate,
            # Advanced metrics
            "focus_consistency_score": self.focus_consistency_score,
            "improvement_trend": self.improvement_trend,
            "burnout_risk_score": self.burnout_risk_score,
            # Metadata
            "last_calculated": self.last_calculated.isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
