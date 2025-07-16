from datetime import UTC, date, datetime, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, desc
from typing import Any, Dict, List, Optional
from database.models.focus_session import FocusMode, FocusSession, FocusSessionStatus
from database.repositories.base_repository import BaseRepository

from logger import get_logger

logger = get_logger(__name__)


class FocusSessionRepository(BaseRepository[FocusSession]):
    """Repository for managing focus sessions in the database."""

    def __init__(self, session: Session):
        super().__init__(FocusSession, session)

    def create_session(self, session: FocusSession) -> FocusSession:
        self.session.add(session)
        self.session.flush()
        self.session.refresh(session)
        return session

    def update_session(self, session: FocusSession) -> FocusSession:
        """Update an existing focus session."""
        session.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(session)
        return session

    def get_session_by_session_uuid(self, session_uuid: str) -> Optional[FocusSession]:
        """Get a focus session by its session UUID."""
        return (
            self.session.query(FocusSession)
            .options(joinedload(FocusSession.task), joinedload(FocusSession.user))
            .filter(FocusSession.uuid == session_uuid)
            .first()
        )

    def get_active_session(self, user_id: int) -> Optional[FocusSession]:
        """Get the active focus session for a user."""
        return (
            self.session.query(FocusSession)
            .filter(FocusSession.user_id == user_id, FocusSession.status == "ACTIVE")
            .first()
        )

    def get_user_sessions(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        focus_mode: Optional[FocusMode] = None,
        status: Optional[FocusSessionStatus] = None,
        task_id: Optional[int] = None,
        minimum_duration: Optional[int] = None,
        limit: int = 50,
    ) -> List[FocusSession]:
        """Get focus sessions for a user with optional filters."""
        query = (
            self.session.query(FocusSession)
            .options(joinedload(FocusSession.task), joinedload(FocusSession.user))
            .filter(FocusSession.user_id == user_id)
        )

        if start_date:
            query = query.filter(FocusSession.start_time >= start_date)

        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.filter(FocusSession.start_time <= end_datetime)

        if focus_mode:
            query = query.filter(FocusSession.focus_mode == focus_mode)

        if status:
            query = query.filter(FocusSession.status == status)

        if task_id:
            query = query.filter(FocusSession.task_id == task_id)

        if minimum_duration:
            query = query.filter(FocusSession.actual_duration >= minimum_duration)

        return query.order_by(desc(FocusSession.start_time)).limit(limit).all()

    def get_daily_sessions(self, user_id: int, target_date: date) -> List[FocusSession]:
        """Get all focus sessions for a specific day."""
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        return (
            self.session.query(FocusSession)
            .options(joinedload(FocusSession.task))
            .filter(
                and_(
                    FocusSession.user_id == user_id,
                    FocusSession.start_time >= start_datetime,
                    FocusSession.start_time <= end_datetime,
                )
            )
            .order_by(FocusSession.start_time)
            .all()
        )

    def get_longest_sessions(self, user_id: int, limit: int = 10) -> List[FocusSession]:
        """Get the longest focus sessions for a user."""
        return (
            self.session.query(FocusSession)
            .options(joinedload(FocusSession.task))
            .filter(
                and_(
                    FocusSession.user_id == user_id,
                    FocusSession.status == FocusSessionStatus.COMPLETED,
                    FocusSession.actual_duration.isnot(None),
                )
            )
            .order_by(desc(FocusSession.actual_duration))
            .limit(limit)
            .all()
        )

    def get_flow_state_sessions(
        self, user_id: int, days: int = 30
    ) -> List[FocusSession]:
        """Get sessions where flow state was achieved."""
        start_date = date.today() - timedelta(days=days)
        return (
            self.session.query(FocusSession)
            .options(joinedload(FocusSession.task))
            .filter(
                and_(
                    FocusSession.user_id == user_id,
                    FocusSession.flow_state_achieved == True,
                    FocusSession.start_time >= start_date,
                )
            )
            .order_by(desc(FocusSession.start_time))
            .all()
        )

    def complete_session(
        self,
        session: FocusSession,
        objectives_achieved: Optional[str] = None,
        session_notes: Optional[str] = None,
        focus_intensity: Optional[int] = None,
        overall_satisfaction: Optional[int] = None,
        flow_state_achieved: bool = False,
        flow_state_duration: Optional[int] = None,
    ) -> FocusSession:
        """Mark a focus session as completed with optional data."""
        session.status = FocusSessionStatus.COMPLETED
        session.completed_at = datetime.now(UTC)
        session.end_time = datetime.now(UTC)

        # Calculate actual duration
        if session.start_time:
            total_time = (session.end_time - session.start_time).total_seconds()  # type: ignore
            session.actual_duration = int(total_time - session.pause_duration)

        # Add optional completion data
        if objectives_achieved:
            session.objectives_achieved = objectives_achieved
        if session_notes:
            session.session_notes = session_notes
        if focus_intensity is not None:
            session.focus_intensity = focus_intensity
        if overall_satisfaction is not None:
            session.overall_satisfaction = overall_satisfaction
        if flow_state_achieved:
            session.flow_state_achieved = True
            if flow_state_duration:
                session.flow_state_duration = flow_state_duration

        return self.update_session(session)

    def abandon_session(
        self, session: FocusSession, reason: Optional[str] = None
    ) -> FocusSession:
        """Mark a focus session as abandoned."""
        session.status = FocusSessionStatus.ABANDONED
        session.end_time = datetime.now(UTC)

        if reason:
            session.session_notes = f"Abandoned: {reason}"

        return self.update_session(session)

    def get_focus_statistics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get focus session statistics for a user over the last N days."""
        start_date = date.today() - timedelta(days=days)
        sessions = self.get_user_sessions(user_id, start_date=start_date)

        if not sessions:
            return self._empty_focus_stats()

        completed_sessions = [
            s for s in sessions if s.status == FocusSessionStatus.COMPLETED
        ]
        total_sessions = len(sessions)

        # Basic metrics
        total_focus_time = sum(s.actual_duration or 0 for s in completed_sessions)
        flow_sessions = len([s for s in completed_sessions if s.flow_state_achieved])

        # Average metrics
        avg_session_length = None
        avg_focus_intensity = None
        avg_satisfaction = None

        if completed_sessions:
            avg_session_length = sum(
                s.actual_duration or 0 for s in completed_sessions
            ) / len(completed_sessions)

            rated_intensity = [
                s for s in completed_sessions if s.focus_intensity is not None
            ]
            if rated_intensity:
                avg_focus_intensity = sum(
                    s.focus_intensity or 0 for s in rated_intensity
                ) / len(rated_intensity)

            rated_satisfaction = [
                s for s in completed_sessions if s.overall_satisfaction is not None
            ]
            if rated_satisfaction:
                avg_satisfaction = sum(
                    s.overall_satisfaction or 0 for s in rated_satisfaction
                ) / len(rated_satisfaction)

        # Longest session
        longest_session = max(
            completed_sessions, key=lambda s: s.actual_duration or 0, default=None
        )

        return {
            "total_sessions": total_sessions,
            "completed_sessions": len(completed_sessions),
            "completion_rate": (
                (len(completed_sessions) / total_sessions) * 100
                if total_sessions > 0
                else 0
            ),
            "total_focus_time_hours": total_focus_time / 3600,
            "total_focus_time_minutes": total_focus_time / 60,
            "average_session_minutes": (
                avg_session_length / 60 if avg_session_length else None
            ),
            "longest_session_minutes": (
                longest_session.actual_duration / 60
                if longest_session and longest_session.actual_duration
                else None
            ),
            "flow_sessions": flow_sessions,
            "flow_rate": (
                (flow_sessions / len(completed_sessions)) * 100
                if completed_sessions
                else 0
            ),
            "average_focus_intensity": (
                round(avg_focus_intensity, 2) if avg_focus_intensity else None
            ),
            "average_satisfaction": (
                round(avg_satisfaction, 2) if avg_satisfaction else None
            ),
            "days_analyzed": days,
            "period_start": start_date.isoformat(),
            "period_end": date.today().isoformat(),
        }

    def get_focus_mode_analysis(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Analyze productivity by focus mode."""
        start_date = date.today() - timedelta(days=days)
        sessions = self.get_user_sessions(user_id, start_date=start_date)

        completed_sessions = [
            s for s in sessions if s.status == FocusSessionStatus.COMPLETED
        ]

        mode_stats = {}
        for mode in FocusMode:
            mode_sessions = [s for s in completed_sessions if s.focus_mode == mode]
            if mode_sessions:
                avg_duration = sum(s.actual_duration or 0 for s in mode_sessions) / len(
                    mode_sessions
                )
                flow_count = len([s for s in mode_sessions if s.flow_state_achieved])

                rated_sessions = [
                    s for s in mode_sessions if s.overall_satisfaction is not None
                ]
                avg_satisfaction = None
                if rated_sessions:
                    avg_satisfaction = sum(
                        s.overall_satisfaction or 0 for s in rated_sessions
                    ) / len(rated_sessions)

                mode_stats[mode.value] = {
                    "session_count": len(mode_sessions),
                    "total_time_minutes": sum(
                        s.actual_duration or 0 for s in mode_sessions
                    )
                    / 60,
                    "average_duration_minutes": avg_duration / 60,
                    "flow_sessions": flow_count,
                    "flow_rate": (flow_count / len(mode_sessions)) * 100,
                    "average_satisfaction": (
                        round(avg_satisfaction, 2) if avg_satisfaction else None
                    ),
                }

        return mode_stats

    def get_productivity_insights(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get productivity insights and recommendations."""
        stats = self.get_focus_statistics(user_id, days)
        mode_analysis = self.get_focus_mode_analysis(user_id, days)

        insights = []
        recommendations = []

        # Flow state insights
        if stats["flow_rate"] > 50:
            insights.append("You achieve flow state frequently - excellent!")
        elif stats["flow_rate"] > 20:
            insights.append(
                "You achieve flow state regularly. Consider optimizing your environment for even better results."
            )
        else:
            insights.append("Focus on creating conditions for flow state.")
            recommendations.append(
                "Try longer sessions (90+ minutes) for deep work tasks"
            )

        # Session length insights
        if stats["average_session_minutes"] and stats["average_session_minutes"] > 120:
            insights.append("You're great at sustained focus periods!")
        elif stats["average_session_minutes"] and stats["average_session_minutes"] < 45:
            recommendations.append("Consider longer sessions for better deep work")

        # Mode effectiveness
        if mode_analysis:
            best_mode = max(
                mode_analysis.items(), key=lambda x: x[1].get("flow_rate", 0)
            )
            if best_mode[1]["flow_rate"] > 30:
                insights.append(f"You're most effective in {best_mode[0]} mode")
                recommendations.append(f"Schedule more {best_mode[0]} sessions")

        return {
            "insights": insights,
            "recommendations": recommendations,
            "best_focus_mode": best_mode[0] if mode_analysis else None,
            "productivity_trend": (
                "improving" if stats["completion_rate"] > 75 else "stable"
            ),
        }

    def _empty_focus_stats(self) -> Dict[str, Any]:
        """Return empty focus statistics structure."""
        return {
            "total_sessions": 0,
            "completed_sessions": 0,
            "completion_rate": 0,
            "total_focus_time_hours": 0,
            "total_focus_time_minutes": 0,
            "average_session_minutes": None,
            "longest_session_minutes": None,
            "flow_sessions": 0,
            "flow_rate": 0,
            "average_focus_intensity": None,
            "average_satisfaction": None,
            "days_analyzed": 0,
            "period_start": None,
            "period_end": None,
        }
