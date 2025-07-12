from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid

from sqlalchemy.orm import Session
from database.repositories.pomodoro_repository import PomodoroRepository
from database.repositories.task_repository import TaskRepository
from database.repositories.user_repository import UserRepository
from database.models.pomodoro_session import PomodoroSession, PomodoroSessionType
from logger import get_logger

logger = get_logger(__name__)


class PomodoroService:
    def __init__(self, db: Session):
        self.db = db
        self.pomodoro_repo = PomodoroRepository(db)
        self.task_repo = TaskRepository(db)
        self.user_repo = UserRepository(db)

    def start_session(
        self, 
        user_id: int, 
        session_type: str, 
        duration_minutes: int,
        task_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Start a new pomodoro session"""
        try:
            # Check if user exists
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}

            # Check if there's already an active session
            active_session = self.pomodoro_repo.get_active_session(user_id)
            if active_session:
                return {
                    'success': False, 
                    'error': 'User already has an active session',
                    'active_session_id': active_session.session_id
                }

            # Validate task if provided
            if task_id:
                task = self.task_repo.get_task_by_id(task_id)
                if not task or task.user_id != user_id:
                    return {'success': False, 'error': 'Invalid task'}

            # Validate session type
            if session_type not in [e.value for e in PomodoroSessionType]:
                return {'success': False, 'error': 'Invalid session type'}

            # Create session data
            session_data = {
                'session_id': str(uuid.uuid4()),
                'user_id': user_id,
                'task_id': task_id,
                'session_type': session_type,
                'status': 'in_progress',
                'duration': duration_minutes,
                'start_time': datetime.utcnow()
            }

            # Create the session
            session = self.pomodoro_repo.create_session(session_data)
            
            logger.info(f"Started pomodoro session {session.session_id} for user {user_id}")
            
            return {
                'success': True, 
                'session': self._format_session(session)
            }

        except Exception as e:
            logger.error(f"Error starting pomodoro session: {str(e)}")
            return {'success': False, 'error': 'Failed to start session'}

    def pause_session(self, session_id: str, user_id: int) -> Dict[str, Any]:
        """Pause an active session"""
        try:
            session = self.pomodoro_repo.get_session_by_id(session_id)
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            if session.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized'}
            
            if session.status != 'in_progress':
                return {'success': False, 'error': 'Session is not active'}

            updated_session = self.pomodoro_repo.pause_session(session_id)
            
            logger.info(f"Paused pomodoro session {session_id}")
            
            return {
                'success': True, 
                'session': self._format_session(updated_session)
            }

        except Exception as e:
            logger.error(f"Error pausing session: {str(e)}")
            return {'success': False, 'error': 'Failed to pause session'}

    def resume_session(self, session_id: str, user_id: int) -> Dict[str, Any]:
        """Resume a paused session"""
        try:
            session = self.pomodoro_repo.get_session_by_id(session_id)
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            if session.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized'}
            
            if session.status != 'in_progress':
                return {'success': False, 'error': 'Session is not active'}

            updated_session = self.pomodoro_repo.resume_session(session_id)
            
            logger.info(f"Resumed pomodoro session {session_id}")
            
            return {
                'success': True, 
                'session': self._format_session(updated_session)
            }

        except Exception as e:
            logger.error(f"Error resuming session: {str(e)}")
            return {'success': False, 'error': 'Failed to resume session'}

    def complete_session(self, session_id: str, user_id: int) -> Dict[str, Any]:
        """Complete a session"""
        try:
            session = self.pomodoro_repo.get_session_by_id(session_id)
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            if session.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized'}

            updated_session = self.pomodoro_repo.complete_session(session_id)
            
            # If this was a work session, update task progress
            if session.session_type == 'work' and session.task_id:
                self._update_task_progress(session.task_id)
            
            logger.info(f"Completed pomodoro session {session_id}")
            
            return {
                'success': True, 
                'session': self._format_session(updated_session)
            }

        except Exception as e:
            logger.error(f"Error completing session: {str(e)}")
            return {'success': False, 'error': 'Failed to complete session'}

    def cancel_session(self, session_id: str, user_id: int) -> Dict[str, Any]:
        """Cancel a session"""
        try:
            session = self.pomodoro_repo.get_session_by_id(session_id)
            
            if not session:
                return {'success': False, 'error': 'Session not found'}
            
            if session.user_id != user_id:
                return {'success': False, 'error': 'Unauthorized'}

            updated_session = self.pomodoro_repo.cancel_session(session_id)
            
            logger.info(f"Cancelled pomodoro session {session_id}")
            
            return {
                'success': True, 
                'session': self._format_session(updated_session)
            }

        except Exception as e:
            logger.error(f"Error cancelling session: {str(e)}")
            return {'success': False, 'error': 'Failed to cancel session'}

    def get_user_sessions(
        self, 
        user_id: int, 
        limit: Optional[int] = 50,
        offset: Optional[int] = 0,
        status_filter: Optional[str] = None,
        session_type_filter: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get sessions for a user with filters"""
        try:
            sessions = self.pomodoro_repo.get_sessions_by_user(
                user_id=user_id,
                limit=limit,
                offset=offset,
                status_filter=status_filter,
                session_type_filter=session_type_filter,
                date_from=date_from,
                date_to=date_to
            )
            
            return {
                'success': True,
                'sessions': [self._format_session(session) for session in sessions],
                'count': len(sessions)
            }

        except Exception as e:
            logger.error(f"Error getting user sessions: {str(e)}")
            return {'success': False, 'error': 'Failed to retrieve sessions'}

    def get_active_session(self, user_id: int) -> Dict[str, Any]:
        """Get the active session for a user"""
        try:
            session = self.pomodoro_repo.get_active_session(user_id)
            
            if not session:
                return {'success': True, 'session': None}
            
            return {
                'success': True,
                'session': self._format_session(session)
            }

        except Exception as e:
            logger.error(f"Error getting active session: {str(e)}")
            return {'success': False, 'error': 'Failed to retrieve active session'}

    def get_session_stats(
        self, 
        user_id: int, 
        date_from: Optional[datetime] = None, 
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get session statistics for a user"""
        try:
            stats = self.pomodoro_repo.get_session_stats(user_id, date_from, date_to)
            
            return {
                'success': True,
                'stats': stats
            }

        except Exception as e:
            logger.error(f"Error getting session stats: {str(e)}")
            return {'success': False, 'error': 'Failed to retrieve statistics'}

    def get_daily_stats(self, user_id: int, date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get daily statistics for a user"""
        try:
            if not date:
                date = datetime.utcnow()
            
            sessions = self.pomodoro_repo.get_daily_sessions(user_id, date)
            
            # Calculate daily stats
            total_sessions = len(sessions)
            completed_sessions = len([s for s in sessions if s.status == 'completed'])
            work_sessions = len([s for s in sessions if s.session_type == 'work' and s.status == 'completed'])
            focus_time = sum([s.duration for s in sessions if s.session_type == 'work' and s.status == 'completed'])
            
            return {
                'success': True,
                'daily_stats': {
                    'date': date.strftime('%Y-%m-%d'),
                    'total_sessions': total_sessions,
                    'completed_sessions': completed_sessions,
                    'work_sessions': work_sessions,
                    'focus_time_minutes': focus_time,
                    'sessions': [self._format_session(session) for session in sessions]
                }
            }

        except Exception as e:
            logger.error(f"Error getting daily stats: {str(e)}")
            return {'success': False, 'error': 'Failed to retrieve daily statistics'}

    def get_task_sessions(self, task_id: int, user_id: int) -> Dict[str, Any]:
        """Get all sessions for a specific task"""
        try:
            # Verify task belongs to user
            task = self.task_repo.get_task_by_id(task_id)
            if not task or task.user_id != user_id:
                return {'success': False, 'error': 'Task not found or unauthorized'}
            
            sessions = self.pomodoro_repo.get_sessions_by_task(task_id)
            session_stats = self.pomodoro_repo.get_session_count_by_task(task_id)
            
            return {
                'success': True,
                'sessions': [self._format_session(session) for session in sessions],
                'stats': session_stats
            }

        except Exception as e:
            logger.error(f"Error getting task sessions: {str(e)}")
            return {'success': False, 'error': 'Failed to retrieve task sessions'}

    def _update_task_progress(self, task_id: int) -> None:
        """Update task progress after completing a work session"""
        try:
            # This would update task completion progress
            # For now, we'll just log it
            logger.info(f"Updated progress for task {task_id}")
        except Exception as e:
            logger.error(f"Error updating task progress: {str(e)}")

    def _format_session(self, session: PomodoroSession) -> Dict[str, Any]:
        """Format a session for API response"""
        return {
            'session_id': session.session_id,
            'user_id': session.user_id,
            'task_id': session.task_id,
            'session_type': session.session_type,
            'status': session.status,
            'duration': session.duration,
            'start_time': session.start_time.isoformat() if session.start_time else None,
            'paused_at': session.paused_at.isoformat() if session.paused_at else None,
            'end_time': session.end_time.isoformat() if session.end_time else None,
            'completed_at': session.completed_at.isoformat() if session.completed_at else None,
            'created_at': session.created_at.isoformat() if session.created_at else None,
            'updated_at': session.updated_at.isoformat() if session.updated_at else None
        }