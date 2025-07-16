from datetime import UTC, date, datetime, timedelta
from typing import Any, Dict, List, Optional
from sqlalchemy import and_
from sqlalchemy.orm import Session

from database.models.pomodoro_stats import PomodoroStats, StatsTimeframe
from database.repositories.base_repository import BaseRepository

from logger import get_logger

logger = get_logger(__name__)


class PomodoroStatsRepository(BaseRepository[PomodoroStats]):
    def __init__(self, session: Session):
        super().__init__(PomodoroStats, session)

    def create_stats(self, stats: PomodoroStats) -> PomodoroStats:
        self.session.add(stats)
        self.session.flush()
        self.session.refresh(stats)
        return stats

    def update_stats(self, stats: PomodoroStats) -> PomodoroStats:
        """Update existing stats record."""
        stats.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(stats)
        return stats

    def get_stats_by_period(
        self, user_id: int, timeframe: StatsTimeframe, start_date: date, end_date: date
    ) -> Optional[PomodoroStats]:
        return (
            self.session.query(PomodoroStats)
            .filter(
                and_(
                    PomodoroStats.user_id == user_id,
                    PomodoroStats.timeframe >= timeframe,
                    PomodoroStats.start_date <= start_date,
                    PomodoroStats.end_date >= end_date,
                )
            )
            .first()
        )

    def get_daily_stats(
        self, user_id: int, target_date: date
    ) -> Optional[PomodoroStats]:
        """Get daily stats for a specific date."""
        return self.get_stats_by_period(
            user_id, StatsTimeframe.DAILY, target_date, target_date
        )

    def get_weekly_stats(
        self, user_id: int, start_of_week: date
    ) -> Optional[PomodoroStats]:
        """Get weekly stats for a specific week."""
        end_of_week = start_of_week + timedelta(days=6)
        return self.get_stats_by_period(
            user_id, StatsTimeframe.WEEKLY, start_of_week, end_of_week
        )

    def get_monthly_stats(
        self, user_id: int, year: int, month: int
    ) -> Optional[PomodoroStats]:
        """Get monthly stats for a specific month."""
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)

        return self.get_stats_by_period(
            user_id, StatsTimeframe.MONTHLY, start_date, end_date
        )

    def get_yearly_stats(self, user_id: int, year: int) -> Optional[PomodoroStats]:
        """Get yearly stats for a specific year."""
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        return self.get_stats_by_period(
            user_id, StatsTimeframe.YEARLY, start_date, end_date
        )

    def get_recent_daily_stats(
        self, user_id: int, days: int = 30
    ) -> List[PomodoroStats]:
        """Get recent daily stats for trend analysis."""
        start_date = date.today() - timedelta(days=days)
        return (
            self.session.query(PomodoroStats)
            .filter(
                and_(
                    PomodoroStats.user_id == user_id,
                    PomodoroStats.timeframe == StatsTimeframe.DAILY,
                    PomodoroStats.start_date >= start_date,
                )
            )
            .order_by(PomodoroStats.start_date)
            .all()
        )

    def get_recent_weekly_stats(
        self, user_id: int, weeks: int = 12
    ) -> List[PomodoroStats]:
        """Get recent weekly stats for trend analysis."""
        start_date = date.today() - timedelta(weeks=weeks)
        return (
            self.session.query(PomodoroStats)
            .filter(
                and_(
                    PomodoroStats.user_id == user_id,
                    PomodoroStats.timeframe == StatsTimeframe.WEEKLY,
                    PomodoroStats.start_date >= start_date,
                )
            )
            .order_by(PomodoroStats.start_date)
            .all()
        )

    def upsert_stats(self, stats_data: Dict[str, Any]) -> PomodoroStats:
        """Create or update stats record."""
        existing_stats = self.get_stats_by_period(
            stats_data["user_id"],
            StatsTimeframe(stats_data["timeframe"]),
            stats_data["start_date"],
            stats_data["end_date"],
        )

        if existing_stats:
            # Update existing record
            for key, value in stats_data.items():
                if hasattr(existing_stats, key):
                    setattr(existing_stats, key, value)
            return self.update_stats(existing_stats)
        else:
            # Create new record
            new_stats = PomodoroStats(**stats_data)
            return self.create_stats(new_stats)

    def get_productivity_trends(
        self, user_id: int, timeframe: StatsTimeframe, periods: int = 12
    ) -> Dict[str, Any]:
        """Get productivity trends over multiple periods."""
        if timeframe == StatsTimeframe.DAILY:
            stats_list = self.get_recent_daily_stats(user_id, periods)
        elif timeframe == StatsTimeframe.WEEKLY:
            stats_list = self.get_recent_weekly_stats(user_id, periods)
        else:
            # For monthly/yearly, get recent records
            start_date = date.today() - timedelta(
                days=periods * 30
            )  # Rough approximation
            stats_list = (
                self.session.query(PomodoroStats)
                .filter(
                    and_(
                        PomodoroStats.user_id == user_id,
                        PomodoroStats.timeframe == timeframe,
                        PomodoroStats.start_date >= start_date,
                    )
                )
                .order_by(PomodoroStats.start_date)
                .all()
            )

        if len(stats_list) < 2:
            return {"trend": "insufficient_data", "change_percentage": 0}

        # Calculate trends
        recent_periods = stats_list[-3:] if len(stats_list) >= 3 else stats_list[-2:]
        older_periods = (
            stats_list[: -len(recent_periods)]
            if len(stats_list) > len(recent_periods)
            else []
        )

        if not older_periods:
            return {"trend": "insufficient_data", "change_percentage": 0}

        # Calculate average metrics for comparison
        recent_avg_completion = sum(
            s.completion_rate or 0 for s in recent_periods
        ) / len(recent_periods)
        recent_avg_focus_time = sum(s.total_focus_time for s in recent_periods) / len(
            recent_periods
        )
        recent_avg_quality = sum(
            s.average_focus_quality or 0 for s in recent_periods
        ) / len(recent_periods)

        older_avg_completion = sum(s.completion_rate or 0 for s in older_periods) / len(
            older_periods
        )
        older_avg_focus_time = sum(s.total_focus_time for s in older_periods) / len(
            older_periods
        )
        older_avg_quality = sum(
            s.average_focus_quality or 0 for s in older_periods
        ) / len(older_periods)

        # Calculate overall trend score
        completion_change = (
            (
                (recent_avg_completion - older_avg_completion)
                / older_avg_completion
                * 100
            )
            if older_avg_completion > 0
            else 0
        )
        time_change = (
            (
                (recent_avg_focus_time - older_avg_focus_time)
                / older_avg_focus_time
                * 100
            )
            if older_avg_focus_time > 0
            else 0
        )
        quality_change = (
            ((recent_avg_quality - older_avg_quality) / older_avg_quality * 100)
            if older_avg_quality > 0
            else 0
        )

        # Weighted average of changes
        overall_change = (
            completion_change * 0.4 + time_change * 0.4 + quality_change * 0.2
        )

        if overall_change > 10:
            trend = "improving"
        elif overall_change < -10:
            trend = "declining"
        else:
            trend = "stable"

        return {
            "trend": trend,
            "change_percentage": round(overall_change, 2),
            "completion_change": round(completion_change, 2),
            "time_change": round(time_change, 2),
            "quality_change": round(quality_change, 2),
            "periods_analyzed": len(stats_list),
        }

    def get_best_productivity_patterns(self, user_id: int) -> Dict[str, Any]:
        """Identify best productivity patterns from historical data."""
        # Get recent daily stats to analyze patterns
        daily_stats = self.get_recent_daily_stats(user_id, 90)  # 3 months

        if not daily_stats:
            return {}

        # Find patterns in high-productivity days
        high_productivity_days = [
            s
            for s in daily_stats
            if s.productivity_index and s.productivity_index >= 75
        ]

        if not high_productivity_days:
            return {}

        # Analyze patterns
        best_hours = {}
        best_session_counts = {}
        best_locations = {}

        for stats in high_productivity_days:
            # Most productive hour
            if stats.most_productive_hour is not None:
                best_hours[stats.most_productive_hour] = (
                    best_hours.get(stats.most_productive_hour, 0) + 1
                )

            # Session count patterns
            session_range = self._get_session_range(stats.total_sessions_completed)
            best_session_counts[session_range] = (
                best_session_counts.get(session_range, 0) + 1
            )

            # Location patterns (if available in JSON data)
            if stats.location_stats:
                # Parse JSON and extract most productive location
                pass  # Implementation depends on JSON structure

        # Find most common patterns
        optimal_hour = (
            max(best_hours.items(), key=lambda x: x[1])[0] if best_hours else None
        )
        optimal_session_range = (
            max(best_session_counts.items(), key=lambda x: x[1])[0]
            if best_session_counts
            else None
        )

        return {
            "optimal_start_hour": optimal_hour,
            "optimal_session_range": optimal_session_range,
            "high_productivity_days": len(high_productivity_days),
            "patterns_confidence": len(high_productivity_days) / len(daily_stats) * 100,
        }

    def _get_session_range(self, session_count: int) -> str:
        """Categorize session count into ranges."""
        if session_count <= 2:
            return "1-2"
        elif session_count <= 4:
            return "3-4"
        elif session_count <= 6:
            return "5-6"
        elif session_count <= 8:
            return "7-8"
        else:
            return "9+"

    def delete_old_stats(self, user_id: int, older_than_days: int = 365) -> int:
        """Delete stats older than specified days (cleanup)."""
        cutoff_date = date.today() - timedelta(days=older_than_days)
        deleted_count = (
            self.session.query(PomodoroStats)
            .filter(
                and_(
                    PomodoroStats.user_id == user_id,
                    PomodoroStats.end_date < cutoff_date,
                )
            )
            .delete()
        )
        self.session.flush()
        return deleted_count
