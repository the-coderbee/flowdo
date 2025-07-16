from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta, date, UTC

from sqlalchemy.orm import Session
from database.repositories.pomodoro_session_repository import (
    PomodoroSessionRepository,
)
from database.repositories.task_repository import TaskRepository
from database.repositories.user_repository import UserRepository
from database.models.pomodoro_session import (
    InterruptionType,
    PomodoroSession,
    PomodoroSessionStatus,
    PomodoroSessionType,
)
from logger import get_logger

logger = get_logger(__name__)


class PomodoroService:
    def __init__(self, session: Session):
        self.pomodoro_repo = PomodoroSessionRepository(session)
        self.task_repo = TaskRepository(session)
        self.user_repo = UserRepository(session)

    def start_session(
        self,
        user_id: int,
        session_type: PomodoroSessionType,
        task_id: Optional[int] = None,
        planned_duration: Optional[int] = None,
        location: Optional[str] = None,
        ambient_sound_used: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[PomodoroSession]]:
        """Start a new Pomodoro session."""
        # Check if user has an active session
        active_session = self.pomodoro_repo.get_active_session(user_id)
        if active_session:
            return (
                False,
                "You already have an active session. Please complete or abandon it first.",
                None,
            )

        # Get user to determine default durations
        user = self.user_repo.get(user_id)
        if not user:
            return False, "User not found", None

        # Determine planned duration based on session type and user preferences
        if planned_duration is None:
            if session_type == PomodoroSessionType.WORK:
                planned_duration = user.work_duration * 60  # Convert to seconds
            elif session_type == PomodoroSessionType.SHORT_BREAK:
                planned_duration = user.short_break_duration * 60
            elif session_type == PomodoroSessionType.LONG_BREAK:
                planned_duration = user.long_break_duration * 60
            else:
                planned_duration = 25 * 60  # Default 25 minutes

        # Validate task if provided
        if task_id:
            task = self.task_repo.get_task_by_id(task_id)
            if not task or task.user_id != user_id:
                return False, "Task not found or doesn't belong to user", None

        # Calculate session sequence for the day
        today_sessions = self.pomodoro_repo.get_daily_sessions(user_id, date.today())
        work_sessions_today = len(
            [s for s in today_sessions if s.session_type == PomodoroSessionType.WORK]
        )
        session_sequence = (
            work_sessions_today + 1
            if session_type == PomodoroSessionType.WORK
            else None
        )

        # Create new session
        session = PomodoroSession(
            user_id=user_id,
            task_id=task_id,
            session_type=session_type,
            status=PomodoroSessionStatus.IN_PROGRESS,
            planned_duration=planned_duration,
            start_time=datetime.now(UTC),
            location=location,
            ambient_sound_used=ambient_sound_used,
            session_sequence=session_sequence,
            sessions_until_long_break=user.sessions_until_long_break
            - (work_sessions_today % user.sessions_until_long_break),
        )

        created_session = self.pomodoro_repo.create_session(session)

        logger.info(f"Started {session_type.value} session for user {user_id}")
        return True, "Session started successfully", created_session

    def pause_session(
        self, user_id: int, session_id: str
    ) -> Tuple[bool, str, Optional[PomodoroSession]]:
        """Pause an active session."""
        session = self.pomodoro_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Session not found", None

        if session.status != PomodoroSessionStatus.IN_PROGRESS:
            return False, "Session is not in progress", None

        session.status = PomodoroSessionStatus.PAUSED
        session.paused_at = datetime.now(UTC)

        updated_session = self.pomodoro_repo.update_session(session)

        logger.info(f"Paused session {session_id} for user {user_id}")
        return True, "Session paused", updated_session

    def resume_session(
        self, user_id: int, session_id: str
    ) -> Tuple[bool, str, Optional[PomodoroSession]]:
        """Resume a paused session."""
        session = self.pomodoro_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Session not found", None

        if session.status != PomodoroSessionStatus.PAUSED:
            return False, "Session is not paused", None

        session.status = PomodoroSessionStatus.IN_PROGRESS
        session.resumed_at = datetime.now(UTC)

        updated_session = self.pomodoro_repo.update_session(session)

        logger.info(f"Resumed session {session_id} for user {user_id}")
        return True, "Session resumed", updated_session

    def complete_session(
        self,
        user_id: int,
        session_id: str,
        focus_quality_rating: Optional[int] = None,
        productivity_rating: Optional[int] = None,
        energy_after: Optional[int] = None,
        session_notes: Optional[str] = None,
        accomplishments: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[PomodoroSession]]:
        """Complete a session with optional feedback."""
        session = self.pomodoro_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Session not found", None

        if session.status not in [
            PomodoroSessionStatus.IN_PROGRESS,
            PomodoroSessionStatus.PAUSED,
        ]:
            return False, "Session cannot be completed in current state", None

        # Complete the session
        completed_session = self.pomodoro_repo.complete_session(
            session,
            focus_quality_rating=focus_quality_rating,
            productivity_rating=productivity_rating,
            session_notes=session_notes,
            accomplishments=accomplishments,
        )

        if energy_after is not None:
            completed_session.energy_after = energy_after
            completed_session = self.pomodoro_repo.update_session(completed_session)

        # Update task progress if this was a work session
        if session.session_type == PomodoroSessionType.WORK and session.task_id:
            self._update_task_progress(session.task_id)

        logger.info(f"Completed session {session_id} for user {user_id}")
        return True, "Session completed successfully", completed_session

    def abandon_session(
        self, user_id: int, session_id: str, reason: Optional[str] = None
    ) -> Tuple[bool, str, Optional[PomodoroSession]]:
        """Abandon an active session."""
        session = self.pomodoro_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Session not found", None

        if session.status not in [
            PomodoroSessionStatus.IN_PROGRESS,
            PomodoroSessionStatus.PAUSED,
        ]:
            return False, "Session cannot be abandoned in current state", None

        abandoned_session = self.pomodoro_repo.abandon_session(session, reason)

        logger.info(f"Abandoned session {session_id} for user {user_id}")
        return True, "Session abandoned", abandoned_session

    def log_interruption(
        self,
        user_id: int,
        session_id: str,
        interruption_type: InterruptionType,
        interruption_duration: int,
        description: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """Log an interruption during a session."""
        session = self.pomodoro_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Session not found"

        if session.status != PomodoroSessionStatus.IN_PROGRESS:
            return False, "Session is not in progress"

        # Update interruption data
        session.interruption_count += 1
        session.interruption_total_time += interruption_duration
        session.interruption_type = interruption_type

        # Add to distractions log (JSON format)
        if description:
            interruption_entry = {
                "timestamp": datetime.now(UTC).isoformat(),
                "type": interruption_type.value,
                "duration": interruption_duration,
                "description": description,
            }

            # Update distractions log (would need proper JSON handling)
            if session.distractions_log:
                # Parse existing log and append
                pass
            else:
                session.distractions_log = str([interruption_entry])

        self.pomodoro_repo.update_session(session)

        logger.info(f"Logged interruption for session {session_id}")
        return True, "Interruption logged"

    # Session Retrieval
    def get_active_session(self, user_id: int) -> Optional[PomodoroSession]:
        """Get the user's currently active session."""
        return self.pomodoro_repo.get_active_session(user_id)

    def get_user_sessions(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 50,
    ) -> List[PomodoroSession]:
        """Get user's sessions with optional date filtering."""
        return self.pomodoro_repo.get_user_sessions(
            user_id=user_id, start_date=start_date, end_date=end_date, limit=limit
        )

    def get_daily_summary(self, user_id: int, target_date: date) -> Dict[str, Any]:
        """Get daily Pomodoro summary."""
        sessions = self.pomodoro_repo.get_daily_sessions(user_id, target_date)

        completed_work_sessions = [
            s
            for s in sessions
            if s.session_type == PomodoroSessionType.WORK
            and s.status == PomodoroSessionStatus.COMPLETED
        ]

        completed_break_sessions = [
            s
            for s in sessions
            if s.session_type
            in [PomodoroSessionType.SHORT_BREAK, PomodoroSessionType.LONG_BREAK]
            and s.status == PomodoroSessionStatus.COMPLETED
        ]

        total_focus_time = sum(s.actual_duration or 0 for s in completed_work_sessions)
        total_break_time = sum(s.actual_duration or 0 for s in completed_break_sessions)

        # Calculate average ratings
        avg_focus_quality = None
        avg_productivity = None

        rated_sessions = [
            s for s in completed_work_sessions if s.focus_quality_rating is not None
        ]
        if rated_sessions:
            avg_focus_quality = sum(
                s.focus_quality_rating or 0 for s in rated_sessions
            ) / len(rated_sessions)

        productivity_rated = [
            s for s in completed_work_sessions if s.productivity_rating is not None
        ]
        if productivity_rated:
            avg_productivity = sum(
                s.productivity_rating or 0 for s in productivity_rated
            ) / len(productivity_rated)

        return {
            "date": target_date.isoformat(),
            "total_sessions": len(sessions),
            "completed_work_sessions": len(completed_work_sessions),
            "completed_break_sessions": len(completed_break_sessions),
            "total_focus_time_minutes": total_focus_time / 60,
            "total_break_time_minutes": total_break_time / 60,
            "average_focus_quality": (
                round(avg_focus_quality, 2) if avg_focus_quality else None
            ),
            "average_productivity": (
                round(avg_productivity, 2) if avg_productivity else None
            ),
            "sessions": [session.to_dict() for session in sessions],
        }

    # Smart Recommendations
    def get_next_session_recommendation(self, user_id: int) -> Dict[str, Any]:
        """Recommend the next session type and duration."""
        # Get today's sessions
        today_sessions = self.pomodoro_repo.get_daily_sessions(user_id, date.today())
        completed_work_sessions = [
            s
            for s in today_sessions
            if s.session_type == PomodoroSessionType.WORK
            and s.status == PomodoroSessionStatus.COMPLETED
        ]

        user = self.user_repo.get(user_id)
        if not user:
            return {"error": "User not found"}

        # Determine next session type based on completed work sessions
        work_session_count = len(completed_work_sessions)

        if work_session_count == 0:
            # First session of the day
            recommendation = {
                "session_type": PomodoroSessionType.WORK.value,
                "duration_minutes": user.work_duration,
                "reason": "Start your day with a focused work session",
            }
        elif work_session_count % user.sessions_until_long_break == 0:
            # Time for long break
            recommendation = {
                "session_type": PomodoroSessionType.LONG_BREAK.value,
                "duration_minutes": user.long_break_duration,
                "reason": f"Take a long break after {work_session_count} work sessions",
            }
        else:
            # Check if last session was work or break
            last_session = today_sessions[-1] if today_sessions else None
            if last_session and last_session.session_type == PomodoroSessionType.WORK:
                # Recommend break after work
                recommendation = {
                    "session_type": PomodoroSessionType.SHORT_BREAK.value,
                    "duration_minutes": user.short_break_duration,
                    "reason": "Take a short break after your work session",
                }
            else:
                # Recommend work after break
                recommendation = {
                    "session_type": PomodoroSessionType.WORK.value,
                    "duration_minutes": user.work_duration,
                    "reason": "Continue with another focused work session",
                }

        return recommendation

    def get_statistics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive Pomodoro statistics."""
        return self.pomodoro_repo.get_session_statistics(user_id, days)

    def get_productivity_patterns(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get productivity patterns analysis."""
        return self.pomodoro_repo.get_productivity_patterns(user_id, days)

    # Helper Methods
    def _update_task_progress(self, task_id: int) -> None:
        """Update task's completed pomodoro count."""
        task = self.task_repo.get_task_by_id(task_id)
        if task:
            task.completed_pomodoros += 1
            self.task_repo.update_task(task)

    def _calculate_break_recommendation(self, user_id: int) -> Dict[str, str]:
        """Calculate personalized break activity recommendation."""
        # This could be enhanced with ML-based recommendations
        # For now, return simple recommendations
        activities = [
            "Take a short walk",
            "Do some stretching exercises",
            "Practice deep breathing",
            "Get some fresh air",
            "Drink water and hydrate",
            "Look away from your screen (20-20-20 rule)",
        ]
        import random

        random.seed(user_id + datetime.now().hour)

        return {
            "activity": random.choice(activities),
            "duration": "5 minutes",
            "benefit": "Helps refresh your mind and body",
        }
