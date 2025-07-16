# backend/app/services/focus_service.py

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, date, UTC
from sqlalchemy.orm import Session
import json

from database.models.focus_session import (
    FocusSession,
    FocusMode,
    FocusSessionStatus,
    DistractionLevel,
)
from database.repositories.focus_session_repository import FocusSessionRepository
from database.repositories.task_repository import TaskRepository
from database.repositories.user_repository import UserRepository

import logging

logger = logging.getLogger(__name__)


class FocusService:
    """Service for managing Focus sessions and deep work periods."""

    def __init__(self, session: Session):
        """Initialize the service with database session."""
        self.focus_repo = FocusSessionRepository(session)
        self.task_repo = TaskRepository(session)
        self.user_repo = UserRepository(session)

    # Session Management
    def start_focus_session(
        self,
        user_id: int,
        focus_mode: FocusMode,
        task_id: Optional[int] = None,
        planned_duration: Optional[int] = None,
        minimum_duration: int = 1800,  # 30 minutes default
        maximum_duration: Optional[int] = None,
        objectives: Optional[str] = None,
        location: Optional[str] = None,
        environment_settings: Optional[Dict[str, Any]] = None,
    ) -> Tuple[bool, str, Optional[FocusSession]]:
        """Start a new focus session."""
        # Check if user has an active focus session
        active_session = self.focus_repo.get_active_session(user_id)
        if active_session:
            return (
                False,
                "You already have an active focus session. Please complete or abandon it first.",
                None,
            )

        # Get user for preferences
        user = self.user_repo.get(user_id)
        if not user:
            return False, "User not found", None

        # Validate task if provided
        if task_id:
            task = self.task_repo.get_task_by_id(task_id)
            if not task or task.user_id != user_id:
                return False, "Task not found or doesn't belong to user", None

            # Use task's optimal session length if available
            if task.optimal_session_length and planned_duration is None:
                planned_duration = task.optimal_session_length

        # Set default planned duration based on focus mode if not provided
        if planned_duration is None:
            planned_duration = self._get_default_duration_for_mode(focus_mode)

        # Validate duration constraints
        if planned_duration and planned_duration < minimum_duration:
            return (
                False,
                f"Planned duration must be at least {minimum_duration // 60} minutes",
                None,
            )

        if (
            maximum_duration
            and planned_duration
            and planned_duration > maximum_duration
        ):
            planned_duration = maximum_duration

        # Create new focus session
        session = FocusSession(
            user_id=user_id,
            task_id=task_id,
            focus_mode=focus_mode,
            status=FocusSessionStatus.IN_PROGRESS,
            planned_duration=planned_duration,
            minimum_duration=minimum_duration,
            maximum_duration=maximum_duration,
            start_time=datetime.utcnow(),
            objectives_set=objectives,
            location=location,
            environment_settings=(
                json.dumps(environment_settings) if environment_settings else None
            ),
        )

        created_session = self.focus_repo.create_session(session)

        logger.info(f"Started {focus_mode.value} focus session for user {user_id}")
        return True, "Focus session started successfully", created_session

    def pause_focus_session(
        self, user_id: int, session_id: str
    ) -> Tuple[bool, str, Optional[FocusSession]]:
        """Pause an active focus session."""
        session = self.focus_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Focus session not found", None

        if session.status != FocusSessionStatus.IN_PROGRESS:
            return False, "Focus session is not in progress", None

        session.status = FocusSessionStatus.PAUSED
        session.paused_at = datetime.utcnow()

        updated_session = self.focus_repo.update_session(session)

        logger.info(f"Paused focus session {session_id} for user {user_id}")
        return True, "Focus session paused", updated_session

    def resume_focus_session(
        self, user_id: int, session_id: str
    ) -> Tuple[bool, str, Optional[FocusSession]]:
        """Resume a paused focus session."""
        session = self.focus_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Focus session not found", None

        if session.status != FocusSessionStatus.PAUSED:
            return False, "Focus session is not paused", None

        # Calculate pause duration
        if session.paused_at:
            pause_time = (datetime.utcnow() - session.paused_at).total_seconds()
            session.pause_duration += int(pause_time)

        session.status = FocusSessionStatus.IN_PROGRESS
        session.paused_at = None

        updated_session = self.focus_repo.update_session(session)

        logger.info(f"Resumed focus session {session_id} for user {user_id}")
        return True, "Focus session resumed", updated_session

    def complete_focus_session(
        self,
        user_id: int,
        session_id: str,
        objectives_achieved: Optional[str] = None,
        session_notes: Optional[str] = None,
        focus_intensity: Optional[int] = None,
        overall_satisfaction: Optional[int] = None,
        flow_state_achieved: bool = False,
        flow_state_duration: Optional[int] = None,
        distraction_level: Optional[DistractionLevel] = None,
        tasks_completed: int = 0,
        insights_gained: Optional[str] = None,
    ) -> Tuple[bool, str, Optional[FocusSession]]:
        """Complete a focus session with comprehensive feedback."""
        session = self.focus_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Focus session not found", None

        if session.status not in [
            FocusSessionStatus.IN_PROGRESS,
            FocusSessionStatus.PAUSED,
        ]:
            return False, "Focus session cannot be completed in current state", None

        # Check minimum duration requirement
        if session.start_time:
            elapsed_time = (datetime.utcnow() - session.start_time).total_seconds()
            if elapsed_time < session.minimum_duration:
                return (
                    False,
                    f"Session must run for at least {session.minimum_duration // 60} minutes",
                    None,
                )

        # Complete the session
        completed_session = self.focus_repo.complete_session(
            session,
            objectives_achieved=objectives_achieved,
            session_notes=session_notes,
            focus_intensity=focus_intensity,
            overall_satisfaction=overall_satisfaction,
            flow_state_achieved=flow_state_achieved,
            flow_state_duration=flow_state_duration,
        )

        # Add additional completion data
        if distraction_level:
            completed_session.distraction_level = distraction_level
        if tasks_completed > 0:
            completed_session.tasks_completed = tasks_completed
        if insights_gained:
            completed_session.insights_gained = insights_gained

        completed_session = self.focus_repo.update_session(completed_session)

        # Update task progress if applicable
        if session.task_id and session.actual_duration:
            self._update_task_focus_time(session.task_id, session.actual_duration)

        logger.info(f"Completed focus session {session_id} for user {user_id}")
        return True, "Focus session completed successfully", completed_session

    def abandon_focus_session(
        self, user_id: int, session_id: str, reason: Optional[str] = None
    ) -> Tuple[bool, str, Optional[FocusSession]]:
        """Abandon an active focus session."""
        session = self.focus_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Focus session not found", None

        if session.status not in [
            FocusSessionStatus.IN_PROGRESS,
            FocusSessionStatus.PAUSED,
        ]:
            return False, "Focus session cannot be abandoned in current state", None

        abandoned_session = self.focus_repo.abandon_session(session, reason)

        logger.info(f"Abandoned focus session {session_id} for user {user_id}")
        return True, "Focus session abandoned", abandoned_session

    def log_interruption(
        self,
        user_id: int,
        session_id: str,
        is_self_interruption: bool = True,
        interruption_note: Optional[str] = None,
    ) -> Tuple[bool, str]:
        """Log an interruption during a focus session."""
        session = self.focus_repo.get(session_id)
        if not session or session.user_id != user_id:
            return False, "Focus session not found"

        if session.status != FocusSessionStatus.IN_PROGRESS:
            return False, "Focus session is not in progress"

        # Update interruption counts
        session.interruption_count += 1
        if is_self_interruption:
            session.self_interruption_count += 1
        else:
            session.external_interruption_count += 1

        # Log the interruption with timestamp
        if interruption_note:
            interruption_entry = {
                "timestamp": datetime.now(UTC).isoformat(),
                "type": "self" if is_self_interruption else "external",
                "note": interruption_note,
            }

            # Add to session notes
            if session.session_notes:
                session.session_notes += f"\n[Interruption] {interruption_entry}"
            else:
                session.session_notes = f"[Interruption] {interruption_entry}"

        self.focus_repo.update_session(session)

        logger.info(f"Logged interruption for focus session {session_id}")
        return True, "Interruption logged"

    # Session Retrieval
    def get_active_focus_session(self, user_id: int) -> Optional[FocusSession]:
        """Get the user's currently active focus session."""
        return self.focus_repo.get_active_session(user_id)

    def get_user_focus_sessions(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        focus_mode: Optional[FocusMode] = None,
        limit: int = 50,
    ) -> List[FocusSession]:
        """Get user's focus sessions with optional filtering."""
        return self.focus_repo.get_user_sessions(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            focus_mode=focus_mode,
            limit=limit,
        )

    def get_daily_focus_summary(
        self, user_id: int, target_date: date
    ) -> Dict[str, Any]:
        """Get daily focus session summary."""
        sessions = self.focus_repo.get_daily_sessions(user_id, target_date)

        completed_sessions = [
            s for s in sessions if s.status == FocusSessionStatus.COMPLETED
        ]

        if not completed_sessions:
            return {
                "date": target_date.isoformat(),
                "total_sessions": len(sessions),
                "completed_sessions": 0,
                "total_focus_time_hours": 0,
                "flow_sessions": 0,
                "sessions": [],
            }

        total_focus_time = sum(s.actual_duration or 0 for s in completed_sessions)
        flow_sessions = len([s for s in completed_sessions if s.flow_state_achieved])

        # Calculate averages
        avg_intensity = None
        avg_satisfaction = None

        intensity_rated = [
            s for s in completed_sessions if s.focus_intensity is not None
        ]
        if intensity_rated:
            avg_intensity = sum(s.focus_intensity or 0 for s in intensity_rated) / len(
                intensity_rated
            )

        satisfaction_rated = [
            s for s in completed_sessions if s.overall_satisfaction is not None
        ]
        if satisfaction_rated:
            avg_satisfaction = sum(
                s.overall_satisfaction or 0 for s in satisfaction_rated
            ) / len(satisfaction_rated)

        # Get longest session
        longest_session = max(
            completed_sessions, key=lambda s: s.actual_duration or 0, default=None
        )

        return {
            "date": target_date.isoformat(),
            "total_sessions": len(sessions),
            "completed_sessions": len(completed_sessions),
            "total_focus_time_hours": total_focus_time / 3600,
            "total_focus_time_minutes": total_focus_time / 60,
            "average_session_minutes": (total_focus_time / len(completed_sessions))
            / 60,
            "longest_session_minutes": (
                longest_session.actual_duration / 60
                if longest_session and longest_session.actual_duration
                else 0
            ),
            "flow_sessions": flow_sessions,
            "flow_rate": (flow_sessions / len(completed_sessions)) * 100,
            "average_focus_intensity": (
                round(avg_intensity, 2) if avg_intensity else None
            ),
            "average_satisfaction": (
                round(avg_satisfaction, 2) if avg_satisfaction else None
            ),
            "sessions": [session.to_dict() for session in sessions],
        }

    # Analytics and Insights
    def get_focus_statistics(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive focus statistics."""
        return self.focus_repo.get_focus_statistics(user_id, days)

    def get_focus_mode_analysis(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get analysis of productivity by focus mode."""
        return self.focus_repo.get_focus_mode_analysis(user_id, days)

    def get_productivity_insights(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Get personalized productivity insights and recommendations."""
        return self.focus_repo.get_productivity_insights(user_id, days)

    def get_flow_state_analysis(self, user_id: int, days: int = 30) -> Dict[str, Any]:
        """Analyze flow state patterns and triggers."""
        flow_sessions = self.focus_repo.get_flow_state_sessions(user_id, days)

        if not flow_sessions:
            return {
                "flow_sessions_count": 0,
                "average_flow_duration": 0,
                "flow_triggers": [],
                "optimal_conditions": {},
            }

        total_flow_time = sum(s.flow_state_duration or 0 for s in flow_sessions)
        avg_flow_duration = total_flow_time / len(flow_sessions) if flow_sessions else 0

        # Analyze common patterns in flow sessions
        mode_frequency = {}
        location_frequency = {}
        duration_ranges = {"short": 0, "medium": 0, "long": 0}

        for session in flow_sessions:
            # Focus mode analysis
            mode = session.focus_mode.value
            mode_frequency[mode] = mode_frequency.get(mode, 0) + 1

            # Location analysis
            if session.location:
                location_frequency[session.location] = (
                    location_frequency.get(session.location, 0) + 1
                )

            # Duration analysis
            if session.actual_duration:
                if session.actual_duration < 3600:  # < 1 hour
                    duration_ranges["short"] += 1
                elif session.actual_duration < 7200:  # 1-2 hours
                    duration_ranges["medium"] += 1
                else:  # > 2 hours
                    duration_ranges["long"] += 1

        # Identify optimal conditions
        best_mode = (
            max(mode_frequency.items(), key=lambda x: x[1])[0]
            if mode_frequency
            else None
        )
        best_location = (
            max(location_frequency.items(), key=lambda x: x[1])[0]
            if location_frequency
            else None
        )
        best_duration = (
            max(duration_ranges.items(), key=lambda x: x[1])[0]
            if any(duration_ranges.values())
            else None
        )

        return {
            "flow_sessions_count": len(flow_sessions),
            "total_flow_time_hours": total_flow_time / 3600,
            "average_flow_duration_minutes": avg_flow_duration / 60,
            "flow_triggers": {
                "best_focus_mode": best_mode,
                "best_location": best_location,
                "optimal_duration_range": best_duration,
            },
            "mode_breakdown": mode_frequency,
            "location_breakdown": location_frequency,
            "duration_breakdown": duration_ranges,
        }

    # Recommendations
    def get_focus_session_recommendation(self, user_id: int) -> Dict[str, Any]:
        """Recommend optimal focus session parameters."""
        # Get recent statistics and patterns
        stats = self.get_focus_statistics(user_id, 30)
        mode_analysis = self.get_focus_mode_analysis(user_id, 30)
        flow_analysis = self.get_flow_state_analysis(user_id, 30)

        # Default recommendation
        recommendation = {
            "focus_mode": FocusMode.DEEP_WORK.value,
            "suggested_duration_minutes": 90,
            "reasons": ["Start with a focused deep work session"],
            "tips": [],
        }

        # Customize based on user's best patterns
        if flow_analysis.get("flow_triggers", {}).get("best_focus_mode"):
            best_mode = flow_analysis["flow_triggers"]["best_focus_mode"]
            recommendation["focus_mode"] = best_mode
            recommendation["reasons"].append(
                f"You achieve flow most often in {best_mode} mode"
            )

        if mode_analysis:
            # Find mode with highest flow rate
            best_flow_mode = max(
                mode_analysis.items(),
                key=lambda x: x[1].get("flow_rate", 0),
                default=(None, None),
            )
            if (
                best_flow_mode[0]
                and best_flow_mode[1]
                and best_flow_mode[1]["flow_rate"] > 20
            ):
                recommendation["focus_mode"] = best_flow_mode[0]
                recommendation["reasons"].append(
                    f'High flow rate ({best_flow_mode[1]["flow_rate"]:.1f}%) in this mode'
                )

        # Adjust duration based on recent patterns
        if stats.get("average_session_minutes"):
            avg_duration = stats["average_session_minutes"]
            if avg_duration > 120:
                recommendation["suggested_duration_minutes"] = 120
                recommendation["tips"].append("You handle long sessions well")
            elif avg_duration < 60:
                recommendation["suggested_duration_minutes"] = 60
                recommendation["tips"].append(
                    "Start with shorter sessions and build up"
                )

        # Add environmental recommendations
        if flow_analysis.get("flow_triggers", {}).get("best_location"):
            best_location = flow_analysis["flow_triggers"]["best_location"]
            recommendation["tips"].append(f"Consider working from: {best_location}")

        # Time-based recommendations
        current_hour = datetime.now().hour
        if 9 <= current_hour <= 11:
            recommendation["tips"].append("Morning sessions are often most productive")
        elif 14 <= current_hour <= 16:
            recommendation["tips"].append("Post-lunch sessions can be very effective")

        return recommendation

    # Helper Methods
    def _get_default_duration_for_mode(self, focus_mode: FocusMode) -> int:
        """Get default duration in seconds for a focus mode."""
        mode_durations = {
            FocusMode.DEEP_WORK: 5400,  # 90 minutes
            FocusMode.CREATIVE: 7200,  # 2 hours
            FocusMode.LEARNING: 3600,  # 1 hour
            FocusMode.PLANNING: 1800,  # 30 minutes
            FocusMode.REVIEW: 2700,  # 45 minutes
        }
        return mode_durations.get(focus_mode, 5400)  # Default to 90 minutes

    def _update_task_focus_time(self, task_id: int, duration_seconds: int) -> None:
        """Update task's actual focus time."""
        task = self.task_repo.get_task_by_id(task_id)
        if task:
            task.actual_focus_time = (task.actual_focus_time or 0) + duration_seconds
            self.task_repo.update_task(task)

    def suggest_break_activity(
        self, session_duration_minutes: int, energy_level: Optional[int] = None
    ) -> Dict[str, str]:
        """Suggest break activities based on session length and energy."""
        if session_duration_minutes < 60:
            activities = [
                "Quick walk around the building",
                "5-minute meditation",
                "Stretch at your desk",
                "Deep breathing exercises",
            ]
        elif session_duration_minutes < 120:
            activities = [
                "Take a walk outside",
                "Light exercise or yoga",
                "Healthy snack break",
                "Chat with a colleague",
                "Listen to music",
            ]
        else:
            activities = [
                "Go for a longer walk or light exercise",
                "Have a proper meal",
                "Take a power nap (15-20 minutes)",
                "Do something completely different",
                "Social interaction",
            ]

        # Adjust based on energy level
        if energy_level and energy_level <= 2:
            activities = [
                "Take a power nap",
                "Get some fresh air",
                "Have a healthy snack",
            ]
        elif energy_level and energy_level >= 4:
            activities = [
                "Quick exercise",
                "Energizing walk",
                "Creative break activity",
            ]

        import random

        selected_activity = random.choice(activities)

        return {
            "activity": selected_activity,
            "recommended_duration": (
                "10-15 minutes" if session_duration_minutes < 120 else "20-30 minutes"
            ),
            "benefit": "Helps restore mental energy and focus",
        }
