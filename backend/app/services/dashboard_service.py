from typing import Dict, Any, List
from datetime import datetime, timedelta
from database.repositories.task_repository import TaskRepository

class DashboardService:
    def __init__(self, db_session):
        self.db_session = db_session
        self.task_repo = TaskRepository(db_session)

    def get_dashboard_data(self, user_id: int) -> Dict[str, Any]:
        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())

        return {
            # Quick stats (top cards)
            'stats': {
                'tasks_today': self._get_today_task_stats(user_id),
                'tasks_week': self._get_week_task_stats(user_id),
                'focus_today': self._get_today_focus_stats(user_id),
                'focus_week': self._get_week_focus_stats(user_id),
                'productivity_score': self._calculate_productivity_score(user_id),
                'current_streak': self._get_completion_streak(user_id)
            },
            
            # Charts and trends
            'trends': {
                'completion_chart': self._get_completion_trend(user_id, days=7),
                'focus_chart': self._get_focus_trend(user_id, days=7),
                'weekly_overview': self._get_weekly_overview(user_id)
            },
            
            # Recent activity (lightweight)
            'recent': {
                'completed_tasks': self._get_recent_completed_tasks(user_id, limit=5),
                'upcoming_deadlines': self._get_upcoming_deadlines(user_id, days=3),
                'active_pomodoro': self._get_active_pomodoro_session(user_id)
            },
            
            # Goals and progress
            'goals': {
                'daily_task_goal': self._get_daily_goal_progress(user_id),
                'daily_focus_goal': self._get_focus_goal_progress(user_id),
                'weekly_goals': self._get_weekly_goals_progress(user_id)
            }
        }

    def _get_today_task_stats(self, user_id: int) -> Dict[str, int]:
        """Get today's task statistics."""
        today = datetime.now().date()
        
        total = self.task_repo.count_tasks_by_date(user_id, today)
        completed = self.task_repo.count_completed_tasks_by_date(user_id, today)
        
        return {
            'total': total,
            'completed': completed,
            'pending': total - completed,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 1)
        }
    
    def _get_today_focus_stats(self, user_id: int) -> Dict[str, Any]:
        """Get today's focus/pomodoro statistics."""
        # Since we don't have pomodoro implementation yet, return default values
        return {
            'sessions_completed': 0,
            'total_minutes': 0,
            'current_session': self._get_active_pomodoro_session(user_id),
            'daily_goal_minutes': 120,  # User's daily focus goal
            'goal_progress': 0
        }
    
    def _get_completion_trend(self, user_id: int, days: int = 7) -> List[Dict[str, Any]]:
        """Get task completion trend for charts."""
        trends = []
        
        for i in range(days):
            date = datetime.now().date() - timedelta(days=i)
            
            total = self.task_repo.count_tasks_by_date(user_id, date)
            completed = self.task_repo.count_completed_tasks_by_date(user_id, date)
            
            trends.append({
                'date': date.isoformat(),
                'total': total,
                'completed': completed,
                'rate': round((completed / total * 100) if total > 0 else 0, 1)
            })
        
        return list(reversed(trends))  # Oldest to newest
    
    def _calculate_productivity_score(self, user_id: int) -> float:
        """Calculate overall productivity score (0-100)."""
        # Weighted combination of:
        # - Task completion rate (40%)
        # - Focus time achievement (30%) 
        # - Consistency/streak (20%)
        # - Goal achievement (10%)
        
        # Implementation based on your business logic
        task_score = self._get_task_completion_score(user_id)
        focus_score = self._get_focus_achievement_score(user_id)
        streak_score = self._get_streak_score(user_id)
        goal_score = self._get_goal_achievement_score(user_id)
        
        weighted_score = (
            task_score * 0.4 +
            focus_score * 0.3 + 
            streak_score * 0.2 +
            goal_score * 0.1
        )
        
        return round(weighted_score, 1)
    
    def _get_week_task_stats(self, user_id: int) -> Dict[str, int]:
        """Get this week's task statistics."""
        week_start = datetime.now().date() - timedelta(days=datetime.now().weekday())
        week_end = week_start + timedelta(days=6)
        
        total = self.task_repo.count_tasks_by_date_range(user_id, week_start, week_end)
        completed = self.task_repo.count_completed_tasks_by_date_range(user_id, week_start, week_end)
        
        return {
            'total': total,
            'completed': completed,
            'pending': total - completed,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 1)
        }
    
    def _get_week_focus_stats(self, user_id: int) -> Dict[str, Any]:
        """Get this week's focus/pomodoro statistics."""
        # Since we don't have pomodoro implementation yet, return default values
        return {
            'sessions_completed': 0,
            'total_minutes': 0,
            'weekly_goal_minutes': 600,  # 10 hours per week
            'goal_progress': 0
        }
    
    def _get_completion_streak(self, user_id: int) -> int:
        """Get current completion streak in days."""
        # Simple implementation - count consecutive days with completed tasks
        current_date = datetime.now().date()
        streak = 0
        
        for i in range(30):  # Check last 30 days
            check_date = current_date - timedelta(days=i)
            completed = self.task_repo.count_completed_tasks_by_date(user_id, check_date)
            
            if completed > 0:
                streak += 1
            else:
                break
                
        return streak
    
    def _get_focus_trend(self, user_id: int, days: int = 7) -> List[Dict[str, Any]]:
        """Get focus trend for charts."""
        trends = []
        
        for i in range(days):
            date = datetime.now().date() - timedelta(days=i)
            trends.append({
                'date': date.isoformat(),
                'minutes': 0,  # Default until pomodoro is implemented
                'sessions': 0
            })
        
        return list(reversed(trends))
    
    def _get_weekly_overview(self, user_id: int) -> Dict[str, Any]:
        """Get weekly overview summary."""
        week_start = datetime.now().date() - timedelta(days=datetime.now().weekday())
        
        return {
            'week_start': week_start.isoformat(),
            'tasks_completed': 0,
            'focus_minutes': 0,
            'productivity_score': 75.0  # Default score
        }
    
    def _get_recent_completed_tasks(self, user_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recently completed tasks."""
        tasks = self.task_repo.get_recent_completed_tasks(user_id, limit)
        return [task.to_dict() for task in tasks]
    
    def _get_upcoming_deadlines(self, user_id: int, days: int = 3) -> List[Dict[str, Any]]:
        """Get tasks with upcoming deadlines."""
        end_date = datetime.now().date() + timedelta(days=days)
        tasks = self.task_repo.get_tasks_with_deadlines(user_id, end_date)
        return [task.to_dict() for task in tasks]
    
    def _get_active_pomodoro_session(self, user_id: int) -> Dict[str, Any]:
        """Get active pomodoro session."""
        # Return None until pomodoro is implemented
        return None
    
    def _get_daily_goal_progress(self, user_id: int) -> Dict[str, Any]:
        """Get daily task goal progress."""
        today = datetime.now().date()
        completed = self.task_repo.count_completed_tasks_by_date(user_id, today)
        goal = 5  # Default daily goal
        
        return {
            'goal': goal,
            'completed': completed,
            'progress': round((completed / goal * 100) if goal > 0 else 0, 1)
        }
    
    def _get_focus_goal_progress(self, user_id: int) -> Dict[str, Any]:
        """Get daily focus goal progress."""
        return {
            'goal_minutes': 120,  # 2 hours default
            'completed_minutes': 0,  # Default until pomodoro is implemented
            'progress': 0
        }
    
    def _get_weekly_goals_progress(self, user_id: int) -> Dict[str, Any]:
        """Get weekly goals progress."""
        week_stats = self._get_week_task_stats(user_id)
        
        return {
            'task_goal': 30,  # Weekly task goal
            'task_completed': week_stats['completed'],
            'task_progress': round((week_stats['completed'] / 30 * 100) if week_stats['completed'] else 0, 1),
            'focus_goal': 600,  # 10 hours per week
            'focus_completed': 0,  # Default until pomodoro is implemented
            'focus_progress': 0
        }
    
    def _get_task_completion_score(self, user_id: int) -> float:
        """Calculate task completion score."""
        today_stats = self._get_today_task_stats(user_id)
        return today_stats['completion_rate']
    
    def _get_focus_achievement_score(self, user_id: int) -> float:
        """Calculate focus achievement score."""
        focus_stats = self._get_today_focus_stats(user_id)
        return focus_stats['goal_progress']
    
    def _get_streak_score(self, user_id: int) -> float:
        """Calculate streak score."""
        streak = self._get_completion_streak(user_id)
        return min(streak * 10, 100)  # 10 points per day, max 100
    
    def _get_goal_achievement_score(self, user_id: int) -> float:
        """Calculate goal achievement score."""
        daily_goal = self._get_daily_goal_progress(user_id)
        return daily_goal['progress']