from datetime import UTC, date, datetime, timedelta
from typing import Any, Dict, List, Optional
from sqlalchemy import and_, desc
from sqlalchemy.orm import Session, joinedload
from database.repositories.base_repository import BaseRepository
from database.models.pomodoro_session import (
    PomodoroSession,
    PomodoroSessionStatus,
    PomodoroSessionType,
)
from database.repositories.base_repository import BaseRepository
from logger import get_logger

logger = get_logger(__name__)


class PomodoroSessionRepository(BaseRepository[PomodoroSession]):
    def __init__(self, session: Session):
        super().__init__(PomodoroSession, session)

    def create_session(self, session: PomodoroSession) -> PomodoroSession:
        """Create a new Pomodoro session."""
        self.session.add(session)
        self.session.flush()
        self.session.refresh(session)
        return session

    def update_session(self, session: PomodoroSession) -> PomodoroSession:
        """Update an existing session."""
        session.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(session)
        return session

    def get_session_by_session_uuid(
        self, session_uuid: str
    ) -> Optional[PomodoroSession]:
        """Retrieve a session by its session_id (UUID)."""
        return (
            self.session.query(PomodoroSession)
            .options(joinedload(PomodoroSession.task), joinedload(PomodoroSession.user))
            .filter(PomodoroSession.uuid == session_uuid)
            .first()
        )

    def get_active_session(self, user_id: int) -> Optional[PomodoroSession]:
        """Retrieve the active Pomodoro session for a user."""
        return (
            self.session.query(PomodoroSession)
            .options(joinedload(PomodoroSession.task), joinedload(PomodoroSession.user))
            .filter(
                and_(
                    PomodoroSession.user_id == user_id,
                    PomodoroSession.status.in_(
                        [
                            PomodoroSessionStatus.IN_PROGRESS,
                            PomodoroSessionStatus.PAUSED,
                        ]
                    ),
                )
            )
            .first()
        )

    def get_user_sessions(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        session_type: Optional[PomodoroSessionType] = None,
        status: Optional[PomodoroSessionStatus] = None,
        task_id: Optional[int] = None,
        limit: int = 100,
    ) -> List[PomodoroSession]:
        query = (
            self.session.query(PomodoroSession)
            .options(joinedload(PomodoroSession.task), joinedload(PomodoroSession.user))
            .filter(PomodoroSession.user_id == user_id)
        )

        if start_date:
            query = query.filter(PomodoroSession.start_time >= start_date)

        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(PomodoroSession.start_time <= end_datetime)

        if session_type:
            query = query.filter(PomodoroSession.session_type == session_type)

        if status:
            query = query.filter(PomodoroSession.status == status)

        if task_id:
            query = query.filter(PomodoroSession.task_id == task_id)

        return query.order_by(desc(PomodoroSession.start_time)).limit(limit).all()

    def get_daily_sessions(
        self, user_id: int, target_date: date
    ) -> List[PomodoroSession]:
        """Get all sessions for a specific day."""
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())
        return (
            self.session.query(PomodoroSession)
            .options(joinedload(PomodoroSession.task))
            .filter(
                and_(
                    PomodoroSession.user_id == user_id,
                    PomodoroSession.start_time >= start_datetime,
                    PomodoroSession.start_time <= end_datetime,
                )
            )
            .order_by(PomodoroSession.start_time)
            .all()
        )

    def get_weekly_sessions(
        self, user_id: int, start_of_week: date
    ) -> List[PomodoroSession]:
        """Get all sessions for a week."""
        end_of_week = start_of_week + timedelta(days=6)
        return self.get_user_sessions(user_id, start_of_week, end_of_week)

    def get_completed_work_sessions_today(self, user_id: int) -> List[PomodoroSession]:
        """Get completed work sessions for today."""
        today = date.today()
        return self.get_user_sessions(
            user_id=user_id,
            start_date=today,
            end_date=today,
            session_type=PomodoroSessionType.WORK,
            status=PomodoroSessionStatus.COMPLETED,
        )

    def complete_session(
        self,
        session: PomodoroSession,
        focus_quality_rating: Optional[int] = None,
        productivity_rating: Optional[int] = None,
        session_notes: Optional[str] = None,
        accomplishments: Optional[str] = None,
    ) -> PomodoroSession:
        """Mark a session as completed with optional ratings and notes."""
        session.status = PomodoroSessionStatus.COMPLETED
        session.completed_at = datetime.now(UTC)
        session.end_time = datetime.now(UTC)

        # Calculate actual duration
        if session.start_time:
            total_time = (session.end_time - session.start_time).total_seconds()  # type: ignore
            session.actual_duration = int(total_time - session.interruption_total_time)

        # Add optional data
        if focus_quality_rating is not None:
            session.focus_quality_rating = focus_quality_rating
        if productivity_rating is not None:
            session.productivity_rating = productivity_rating
        if session_notes:
            session.session_notes = session_notes
        if accomplishments:
            session.accomplishments = accomplishments

        return self.update_session(session)

    def abandon_session(
        self, session: PomodoroSession, reason: Optional[str] = None
    ) -> PomodoroSession:
        """Mark a session as abandoned."""
        session.status = PomodoroSessionStatus.ABANDONED
        session.end_time = datetime.now(UTC)

        if reason:
            session.session_notes = f"Abandoned: {reason}"

        return self.update_session(session)

    def get_session_statistics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get basic session statistics for a user over the last N days."""
        start_date = date.today() - timedelta(days=days)
        sessions = self.get_user_sessions(user_id, start_date=start_date)

        if not sessions:
            return self._empty_stats()

        total_sessions = len(sessions)
        completed_sessions = len(
            [s for s in sessions if s.status == PomodoroSessionStatus.COMPLETED]
        )
        work_sessions = len(
            [s for s in sessions if s.session_type == PomodoroSessionType.WORK]
        )

        total_focus_time = sum(
            s.actual_duration or 0
            for s in sessions
            if s.status == PomodoroSessionStatus.COMPLETED
        )

        avg_focus_quality = None
        rated_sessions = [s for s in sessions if s.focus_quality_rating is not None]
        if rated_sessions:
            avg_focus_quality = sum(
                s.focus_quality_rating or 0 for s in rated_sessions
            ) / len(rated_sessions)

        avg_interruptions = None
        if completed_sessions > 0:
            total_interruptions = sum(
                s.interruption_count
                for s in sessions
                if s.status == PomodoroSessionStatus.COMPLETED
            )
            avg_interruptions = total_interruptions / completed_sessions

        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "work_sessions": work_sessions,
            "completion_rate": (
                (completed_sessions / total_sessions) * 100 if total_sessions > 0 else 0
            ),
            "total_focus_time_minutes": total_focus_time / 60,
            "average_focus_quality": (
                round(avg_focus_quality, 2) if avg_focus_quality else None
            ),
            "average_interruptions_per_session": (
                round(avg_interruptions, 2) if avg_interruptions else None
            ),
            "days_analyzed": days,
            "period_start": start_date.isoformat(),
            "period_end": date.today().isoformat(),
        }

    def get_productivity_patterns(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Analyze productivity patterns by hour and day."""
        start_date = date.today() - timedelta(days=days)
        sessions = self.get_user_sessions(user_id, start_date=start_date)

        completed_work_sessions = [
            s
            for s in sessions
            if s.status == PomodoroSessionStatus.COMPLETED
            and s.session_type == PomodoroSessionType.WORK
            and s.start_time
        ]

        if not completed_work_sessions:
            return {"hourly_productivity": {}, "daily_productivity": {}}

        # Hourly productivity analysis
        hourly_stats = {}
        for hour in range(24):
            hour_sessions = [
                s
                for s in completed_work_sessions
                if s.start_time and s.start_time.hour == hour
            ]
            if hour_sessions:
                avg_quality = sum(
                    s.focus_quality_rating or 3 for s in hour_sessions
                ) / len(hour_sessions)
                hourly_stats[hour] = {
                    "session_count": len(hour_sessions),
                    "average_quality": round(avg_quality, 2),
                    "total_time_minutes": sum(
                        s.actual_duration or 0 for s in hour_sessions
                    )
                    / 60,
                }

        # Daily productivity analysis (0=Monday, 6=Sunday)
        daily_stats = {}
        for day in range(7):
            day_sessions = [
                s
                for s in completed_work_sessions
                if s.start_time and s.start_time.weekday() == day
            ]
            if day_sessions:
                avg_quality = sum(
                    s.focus_quality_rating or 3 for s in day_sessions
                ) / len(day_sessions)
                daily_stats[day] = {
                    "session_count": len(day_sessions),
                    "average_quality": round(avg_quality, 2),
                    "total_time_minutes": sum(
                        s.actual_duration or 0 for s in day_sessions
                    )
                    / 60,
                }

        return {
            "hourly_productivity": hourly_stats,
            "daily_productivity": daily_stats,
        }

    def _empty_stats(self) -> Dict[str, Any]:
        """Return empty statistics structure."""
        return {
            "total_sessions": 0,
            "completed_sessions": 0,
            "work_sessions": 0,
            "completion_rate": 0,
            "total_focus_time_minutes": 0,
            "average_focus_quality": None,
            "average_interruptions_per_session": None,
            "days_analyzed": 0,
            "period_start": None,
            "period_end": None,
        }
