from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from database.db import get_db_session

from datetime import date, timedelta
from app.services.pomodoro_service import PomodoroService
from app.services.focus_service import FocusService

from typing import List, Dict, Any

from logger import get_logger

logger = get_logger(__name__)

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


def _calculate_productive_days(user_id: int, days: int) -> int:
    """Calculate number of days with productive sessions."""
    # This would require querying daily sessions - simplified implementation
    return days // 2  # Placeholder


def _get_daily_trends(user_id: int, days: int) -> List[Dict[str, Any]]:
    """Get daily productivity trends."""
    # This would require daily aggregation queries - simplified implementation
    trends = []
    for i in range(days):
        day = date.today() - timedelta(days=i)
        trends.append(
            {
                "date": day.isoformat(),
                "pomodoro_sessions": 0,  # Would be actual data
                "focus_hours": 0,  # Would be actual data
                "productivity_score": 0,  # Would be calculated
            }
        )
    return trends[::-1]  # Reverse to chronological order


def _get_weekly_trends(user_id: int, days: int) -> List[Dict[str, Any]]:
    """Get weekly productivity trends."""
    # This would require weekly aggregation queries - simplified implementation
    weeks = days // 7
    trends = []
    for i in range(weeks):
        week_start = date.today() - timedelta(weeks=(i + 1))
        trends.append(
            {
                "week_start": week_start.isoformat(),
                "pomodoro_sessions": 0,  # Would be actual data
                "focus_hours": 0,  # Would be actual data
                "productivity_score": 0,  # Would be calculated
            }
        )
    return trends[::-1]  # Reverse to chronological order


def _extract_optimal_conditions(flow_analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Extract optimal conditions for flow state."""
    triggers = flow_analysis.get("flow_triggers", {})
    return {
        "best_focus_mode": triggers.get("best_focus_mode"),
        "best_location": triggers.get("best_location"),
        "optimal_duration": triggers.get("optimal_duration_range"),
    }


def _generate_pattern_insights(
    pomodoro_patterns: Dict, focus_analysis: Dict, flow_analysis: Dict
) -> List[str]:
    """Generate insights from pattern analysis."""
    insights = []

    # Analyze hourly patterns
    hourly = pomodoro_patterns.get("hourly_productivity", {})
    if hourly:
        best_hour = max(
            hourly.items(),
            key=lambda x: x[1].get("average_quality", 0),
            default=(None, None),
        )
        if best_hour[0] is not None:
            insights.append(f"Your peak productivity hour is {best_hour[0]}:00")

    # Analyze flow patterns
    flow_rate = flow_analysis.get("flow_sessions_count", 0)
    if flow_rate > 5:
        insights.append("You frequently achieve flow state - excellent focus ability!")
    elif flow_rate > 0:
        insights.append(
            "You occasionally achieve flow state - try to identify and replicate those conditions"
        )

    return insights


def _analyze_peak_performance(
    pomodoro_patterns: Dict, flow_analysis: Dict
) -> Dict[str, Any]:
    """Analyze when peak performance occurs."""
    # This would be a more sophisticated analysis in reality
    return {
        "best_time_of_day": "Morning hours (9-11 AM)",  # Would be calculated
        "best_session_type": "Deep work focus sessions",  # Would be calculated
        "optimal_session_length": "90 minutes",  # Would be calculated
    }


def _identify_improvement_areas(
    pomodoro_service, focus_service, user_id: int, days: int
) -> List[str]:
    """Identify areas for improvement."""
    improvements = []

    # Get basic stats
    pomodoro_stats = pomodoro_service.get_statistics(user_id, days)
    focus_stats = focus_service.get_focus_statistics(user_id, days)

    # Check completion rates
    if pomodoro_stats.get("completion_rate", 0) < 75:
        improvements.append(
            "Focus on completing more Pomodoro sessions without abandoning them"
        )

    if focus_stats.get("flow_rate", 0) < 30:
        improvements.append(
            "Work on creating better conditions for achieving flow state"
        )

    if pomodoro_stats.get("average_interruptions_per_session", 0) > 2:
        improvements.append("Reduce interruptions during focus sessions")

    return improvements


def _identify_success_patterns(flow_analysis: Dict) -> List[str]:
    """Identify successful patterns from flow analysis."""
    patterns = []

    triggers = flow_analysis.get("flow_triggers", {})
    if triggers.get("best_focus_mode"):
        patterns.append(
            f"You achieve flow most often in {triggers['best_focus_mode']} mode"
        )

    if triggers.get("best_location"):
        patterns.append(
            f"Location '{triggers['best_location']}' is optimal for your focus"
        )

    return patterns


def _generate_next_steps(focus_insights: Dict, flow_analysis: Dict) -> List[str]:
    """Generate actionable next steps."""
    next_steps = []

    # Use recommendations from focus insights
    recommendations = focus_insights.get("recommendations", [])
    next_steps.extend(recommendations[:3])  # Top 3 recommendations

    # Add flow-specific recommendations
    flow_sessions = flow_analysis.get("flow_sessions_count", 0)
    if flow_sessions < 5:
        next_steps.append(
            "Experiment with longer focus sessions (90+ minutes) to increase flow opportunities"
        )

    return next_steps


@dashboard_bp.route("/overview", methods=["GET"])
@jwt_required()
def get_productivity_overview():
    """Get comprehensive productivity overview combining Pomodoro and Focus data."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Get statistics from both services
            pomodoro_stats = pomodoro_service.get_statistics(user_id, days)
            focus_stats = focus_service.get_focus_statistics(user_id, days)

            # Combine the data
            overview = {
                "period": {
                    "days_analyzed": days,
                    "start_date": (date.today() - timedelta(days=days)).isoformat(),
                    "end_date": date.today().isoformat(),
                },
                "pomodoro": {
                    "total_sessions": pomodoro_stats.get("total_sessions", 0),
                    "completed_sessions": pomodoro_stats.get("completed_sessions", 0),
                    "completion_rate": pomodoro_stats.get("completion_rate", 0),
                    "total_focus_time_minutes": pomodoro_stats.get(
                        "total_focus_time_minutes", 0
                    ),
                    "average_focus_quality": pomodoro_stats.get(
                        "average_focus_quality"
                    ),
                    "average_interruptions": pomodoro_stats.get(
                        "average_interruptions_per_session"
                    ),
                },
                "focus": {
                    "total_sessions": focus_stats.get("total_sessions", 0),
                    "completed_sessions": focus_stats.get("completed_sessions", 0),
                    "completion_rate": focus_stats.get("completion_rate", 0),
                    "total_focus_time_minutes": focus_stats.get(
                        "total_focus_time_minutes", 0
                    ),
                    "flow_sessions": focus_stats.get("flow_sessions", 0),
                    "flow_rate": focus_stats.get("flow_rate", 0),
                    "average_session_minutes": focus_stats.get(
                        "average_session_minutes"
                    ),
                    "longest_session_minutes": focus_stats.get(
                        "longest_session_minutes"
                    ),
                },
                "combined": {
                    "total_focus_time_hours": (
                        pomodoro_stats.get("total_focus_time_minutes", 0)
                        + focus_stats.get("total_focus_time_minutes", 0)
                    )
                    / 60,
                    "total_sessions": (
                        pomodoro_stats.get("total_sessions", 0)
                        + focus_stats.get("total_sessions", 0)
                    ),
                    "productive_days": _calculate_productive_days(user_id, days),
                },
            }

            return jsonify(overview), 200

    except Exception as e:
        logger.exception("Error getting productivity overview")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/dashboard", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    """Get dashboard data with key metrics for today and recent trends."""
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            # Get services
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Today's data
            today = date.today()
            today_pomodoro = pomodoro_service.get_daily_summary(user_id, today)
            today_focus = focus_service.get_daily_focus_summary(user_id, today)

            # Weekly trends (last 7 days)
            weekly_pomodoro = pomodoro_service.get_statistics(user_id, 7)
            weekly_focus = focus_service.get_focus_statistics(user_id, 7)

            # Get current active sessions
            active_pomodoro = pomodoro_service.get_active_session(user_id)
            active_focus = focus_service.get_active_focus_session(user_id)

            # Get recommendations
            pomodoro_recommendation = pomodoro_service.get_next_session_recommendation(
                user_id
            )
            focus_recommendation = focus_service.get_focus_session_recommendation(
                user_id
            )

            dashboard = {
                "today": {
                    "date": today.isoformat(),
                    "pomodoro_sessions": today_pomodoro.get(
                        "completed_work_sessions", 0
                    ),
                    "focus_sessions": today_focus.get("completed_sessions", 0),
                    "total_focus_time_minutes": (
                        today_pomodoro.get("total_focus_time_minutes", 0)
                        + today_focus.get("total_focus_time_minutes", 0)
                    ),
                    "flow_sessions_today": today_focus.get("flow_sessions", 0),
                    "average_focus_quality": today_pomodoro.get(
                        "average_focus_quality"
                    ),
                },
                "week": {
                    "pomodoro_completion_rate": weekly_pomodoro.get(
                        "completion_rate", 0
                    ),
                    "focus_completion_rate": weekly_focus.get("completion_rate", 0),
                    "total_focus_hours": (
                        weekly_pomodoro.get("total_focus_time_minutes", 0)
                        + weekly_focus.get("total_focus_time_minutes", 0)
                    )
                    / 60,
                    "flow_rate": weekly_focus.get("flow_rate", 0),
                },
                "active_sessions": {
                    "pomodoro": {
                        "active": active_pomodoro is not None,
                        "session_id": (
                            active_pomodoro.session_id if active_pomodoro else None
                        ),
                        "session_type": (
                            active_pomodoro.session_type.value
                            if active_pomodoro
                            else None
                        ),
                        "start_time": (
                            active_pomodoro.start_time.isoformat()
                            if active_pomodoro and active_pomodoro.start_time
                            else None
                        ),
                    },
                    "focus": {
                        "active": active_focus is not None,
                        "session_id": active_focus.session_id if active_focus else None,
                        "focus_mode": (
                            active_focus.focus_mode.value if active_focus else None
                        ),
                        "start_time": (
                            active_focus.start_time.isoformat()
                            if active_focus and active_focus.start_time
                            else None
                        ),
                    },
                },
                "recommendations": {
                    "next_pomodoro": pomodoro_recommendation,
                    "next_focus": focus_recommendation,
                },
            }

            return jsonify(dashboard), 200

    except Exception as e:
        logger.exception("Error getting dashboard data")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/trends", methods=["GET"])
@jwt_required()
def get_productivity_trends():
    """Get productivity trends over time."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)
        granularity = request.args.get("granularity", "daily")  # daily, weekly

        if days < 7 or days > 365:
            return jsonify({"error": "Days must be between 7 and 365"}), 400

        if granularity not in ["daily", "weekly"]:
            return jsonify({"error": "Granularity must be 'daily' or 'weekly'"}), 400

        # Get trend data based on granularity
        if granularity == "daily":
            trends = _get_daily_trends(user_id, days)
        else:
            trends = _get_weekly_trends(user_id, days)

        return (
            jsonify(
                {
                    "trends": trends,
                    "granularity": granularity,
                    "period": {
                        "days": days,
                        "start_date": (date.today() - timedelta(days=days)).isoformat(),
                        "end_date": date.today().isoformat(),
                    },
                }
            ),
            200,
        )

    except Exception as e:
        logger.exception("Error getting productivity trends")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/patterns", methods=["GET"])
@jwt_required()
def get_productivity_patterns():
    """Get detailed productivity patterns analysis."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 7 or days > 365:
            return jsonify({"error": "Days must be between 7 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Get patterns from both services
            pomodoro_patterns = pomodoro_service.get_productivity_patterns(
                user_id, days
            )
            focus_mode_analysis = focus_service.get_focus_mode_analysis(user_id, days)
            flow_analysis = focus_service.get_flow_state_analysis(user_id, days)

            # Combine and analyze patterns
            patterns = {
                "hourly_productivity": pomodoro_patterns.get("hourly_productivity", {}),
                "daily_productivity": pomodoro_patterns.get("daily_productivity", {}),
                "focus_modes": focus_mode_analysis,
                "flow_patterns": {
                    "flow_sessions_count": flow_analysis.get("flow_sessions_count", 0),
                    "triggers": flow_analysis.get("flow_triggers", {}),
                    "optimal_conditions": _extract_optimal_conditions(flow_analysis),
                },
                "insights": _generate_pattern_insights(
                    pomodoro_patterns, focus_mode_analysis, flow_analysis
                ),
            }

            return jsonify(patterns), 200

    except Exception as e:
        logger.exception("Error getting productivity patterns")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/goals", methods=["GET"])
@jwt_required()
def get_goal_progress():
    """Get goal progress and achievement analysis."""
    try:
        user_id = int(get_jwt_identity())
        timeframe = request.args.get("timeframe", "week")  # day, week, month

        if timeframe not in ["day", "week", "month"]:
            return (
                jsonify({"error": "Timeframe must be 'day', 'week', or 'month'"}),
                400,
            )

        # Calculate date range based on timeframe
        end_date = date.today()
        if timeframe == "day":
            start_date = end_date
            days = 1
        elif timeframe == "week":
            start_date = end_date - timedelta(days=6)  # Last 7 days
            days = 7
        else:  # month
            start_date = end_date - timedelta(days=29)  # Last 30 days
            days = 30

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Get statistics
            pomodoro_stats = pomodoro_service.get_statistics(user_id, days)
            focus_stats = focus_service.get_focus_statistics(user_id, days)

            # Calculate goal progress (these would come from user preferences)
            daily_pomodoro_goal = 8  # This should come from user settings
            daily_focus_time_goal = 4  # hours, should come from user settings

            if timeframe == "day":
                today_summary = pomodoro_service.get_daily_summary(user_id, end_date)
                today_focus = focus_service.get_daily_focus_summary(user_id, end_date)

                goals = {
                    "timeframe": timeframe,
                    "period": {
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                    },
                    "pomodoro_goal": {
                        "target": daily_pomodoro_goal,
                        "completed": today_summary.get("completed_work_sessions", 0),
                        "progress_percentage": min(
                            100,
                            (
                                today_summary.get("completed_work_sessions", 0)
                                / daily_pomodoro_goal
                            )
                            * 100,
                        ),
                    },
                    "focus_time_goal": {
                        "target_hours": daily_focus_time_goal,
                        "completed_hours": (
                            today_summary.get("total_focus_time_minutes", 0)
                            + today_focus.get("total_focus_time_minutes", 0)
                        )
                        / 60,
                        "progress_percentage": min(
                            100,
                            (
                                (
                                    today_summary.get("total_focus_time_minutes", 0)
                                    + today_focus.get("total_focus_time_minutes", 0)
                                )
                                / 60
                                / daily_focus_time_goal
                            )
                            * 100,
                        ),
                    },
                }
            else:
                # Weekly or monthly goals
                target_pomodoros = daily_pomodoro_goal * days
                target_hours = daily_focus_time_goal * days

                actual_pomodoros = pomodoro_stats.get("completed_sessions", 0)
                actual_hours = (
                    pomodoro_stats.get("total_focus_time_minutes", 0)
                    + focus_stats.get("total_focus_time_minutes", 0)
                ) / 60

                goals = {
                    "timeframe": timeframe,
                    "period": {
                        "start_date": start_date.isoformat(),
                        "end_date": end_date.isoformat(),
                    },
                    "pomodoro_goal": {
                        "target": target_pomodoros,
                        "completed": actual_pomodoros,
                        "progress_percentage": min(
                            100, (actual_pomodoros / target_pomodoros) * 100
                        ),
                        "daily_average": actual_pomodoros / days,
                    },
                    "focus_time_goal": {
                        "target_hours": target_hours,
                        "completed_hours": actual_hours,
                        "progress_percentage": min(
                            100, (actual_hours / target_hours) * 100
                        ),
                        "daily_average_hours": actual_hours / days,
                    },
                }

            return jsonify(goals), 200

    except Exception as e:
        logger.exception("Error getting goal progress")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/insights", methods=["GET"])
@jwt_required()
def get_personalized_insights():
    """Get personalized productivity insights and recommendations."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 7 or days > 365:
            return jsonify({"error": "Days must be between 7 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Get insights from both services
            pomodoro_patterns = pomodoro_service.get_productivity_patterns(
                user_id, days
            )
            focus_insights = focus_service.get_productivity_insights(user_id, days)
            flow_analysis = focus_service.get_flow_state_analysis(user_id, days)

            # Generate comprehensive insights
            insights = {
                "productivity_insights": focus_insights.get("insights", []),
                "recommendations": focus_insights.get("recommendations", []),
                "peak_performance": _analyze_peak_performance(
                    pomodoro_patterns, flow_analysis
                ),
                "improvement_areas": _identify_improvement_areas(
                    pomodoro_service, focus_service, user_id, days
                ),
                "success_patterns": _identify_success_patterns(flow_analysis),
                "next_steps": _generate_next_steps(focus_insights, flow_analysis),
            }

            return jsonify(insights), 200

    except Exception as e:
        logger.exception("Error getting personalized insights")
        return jsonify({"error": str(e)}), 500


@dashboard_bp.route("/comparison", methods=["GET"])
@jwt_required()
def get_period_comparison():
    """Compare productivity metrics between two time periods."""
    try:
        user_id = int(get_jwt_identity())

        # Parse period parameters
        current_days = request.args.get("current_days", 30, type=int)
        comparison_days = request.args.get("comparison_days", 30, type=int)

        if current_days < 7 or current_days > 365:
            return jsonify({"error": "Current days must be between 7 and 365"}), 400

        if comparison_days < 7 or comparison_days > 365:
            return jsonify({"error": "Comparison days must be between 7 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            focus_service = FocusService(session)

            # Get current period data
            current_pomodoro = pomodoro_service.get_statistics(user_id, current_days)
            current_focus = focus_service.get_focus_statistics(user_id, current_days)

            # Get comparison period data (offset by current_days)
            # This is a simplified approach - in a real implementation, you'd want to
            # fetch data for specific date ranges
            comparison_start = date.today() - timedelta(
                days=current_days + comparison_days
            )
            comparison_end = date.today() - timedelta(days=current_days)

            # For now, return a simplified comparison structure
            comparison = {
                "current_period": {
                    "days": current_days,
                    "start_date": (
                        date.today() - timedelta(days=current_days)
                    ).isoformat(),
                    "end_date": date.today().isoformat(),
                    "pomodoro_sessions": current_pomodoro.get("completed_sessions", 0),
                    "focus_sessions": current_focus.get("completed_sessions", 0),
                    "total_focus_hours": (
                        current_pomodoro.get("total_focus_time_minutes", 0)
                        + current_focus.get("total_focus_time_minutes", 0)
                    )
                    / 60,
                    "flow_rate": current_focus.get("flow_rate", 0),
                    "completion_rate": (
                        current_pomodoro.get("completion_rate", 0)
                        + current_focus.get("completion_rate", 0)
                    )
                    / 2,
                },
                "comparison_period": {
                    "days": comparison_days,
                    "start_date": comparison_start.isoformat(),
                    "end_date": comparison_end.isoformat(),
                    "note": "Historical comparison data would require specific date range queries",
                },
                "trends": {
                    "note": "Trend calculation would be implemented with historical data access"
                },
            }

            return jsonify(comparison), 200

    except Exception as e:
        logger.exception("Error getting period comparison")
        return jsonify({"error": str(e)}), 500
