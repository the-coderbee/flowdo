# backend/app/routers/focus.py - Focus Session API endpoints

import logging
from datetime import date, datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError

from app.schemas.pomodoro import (
    FocusSessionCreateRequest,
    FocusSessionUpdateRequest,
    FocusSessionResponse,
    FocusInterruptionRequest,
    FocusFilterRequest,
)
from app.services.focus_service import FocusService
from database.db import get_db_session
from database.models.focus_session import (
    FocusMode,
    FocusSessionStatus,
)

# Set up logging
logger = logging.getLogger(__name__)

# Create Blueprint
focus_bp = Blueprint("focus", __name__, url_prefix="/api/focus")


@focus_bp.route("/sessions", methods=["POST"])
@jwt_required()
def start_focus_session():
    """Start a new Focus session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        # Validate request data
        session_request = FocusSessionCreateRequest(**data)

        with get_db_session() as session:
            focus_service = FocusService(session)
            success, message, focus_session = focus_service.start_focus_session(
                user_id=user_id,
                focus_mode=session_request.focus_mode,
                task_id=session_request.task_id,
                planned_duration=session_request.planned_duration,
                minimum_duration=session_request.minimum_duration,
                maximum_duration=session_request.maximum_duration,
                objectives=session_request.objectives,
                location=session_request.location,
                environment_settings=session_request.environment_settings,
            )

            if not success:
                return jsonify({"error": message}), 400

            # Return session response - convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                201,
            )

    except ValidationError as e:
        logger.warning(f"Validation error starting focus session: {e}")
        return jsonify({"error": "Invalid request data", "details": e.errors()}), 400
    except Exception as e:
        logger.exception("Error starting Focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/<session_id>/pause", methods=["POST"])
@jwt_required()
def pause_focus_session(session_id: str):
    """Pause an active Focus session."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            focus_service = FocusService(session)

            success, message, focus_session = focus_service.pause_focus_session(
                user_id, session_id
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error pausing Focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/<session_id>/resume", methods=["POST"])
@jwt_required()
def resume_focus_session(session_id: str):
    """Resume a paused Focus session."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            focus_service = FocusService(session)

            success, message, focus_session = focus_service.resume_focus_session(
                user_id, session_id
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error resuming Focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_focus_session(session_id: str):
    """Complete a Focus session with comprehensive feedback."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        # Validate feedback data
        session_update = FocusSessionUpdateRequest(**data)

        with get_db_session() as session:
            focus_service = FocusService(session)
            success, message, focus_session = focus_service.complete_focus_session(
                user_id=user_id,
                session_id=session_id,
                objectives_achieved=session_update.objectives_achieved,
                session_notes=session_update.session_notes,
                focus_intensity=session_update.focus_intensity,
                overall_satisfaction=session_update.overall_satisfaction,
                flow_state_achieved=session_update.flow_state_achieved,
                flow_state_duration=session_update.flow_state_duration,
                distraction_level=session_update.distraction_level,
                tasks_completed=session_update.tasks_completed,
                insights_gained=session_update.insights_gained,
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except ValidationError as e:
        logger.warning(f"Validation error completing focus session: {e}")
        return jsonify({"error": "Invalid feedback data", "details": e.errors()}), 400
    except Exception as e:
        logger.exception("Error completing Focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/<session_id>/abandon", methods=["POST"])
@jwt_required()
def abandon_focus_session(session_id: str):
    """Abandon an active Focus session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        reason = data.get("reason")

        with get_db_session() as session:
            focus_service = FocusService(session)
            success, message, focus_session = focus_service.abandon_focus_session(
                user_id, session_id, reason
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error abandoning Focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/<session_id>/interruption", methods=["POST"])
@jwt_required()
def log_focus_interruption(session_id: str):
    """Log an interruption during a Focus session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"error": "Interruption data is required"}), 400

        interruption_request = FocusInterruptionRequest(**data)

        with get_db_session() as session:
            focus_service = FocusService(session)
            success, message = focus_service.log_interruption(
                user_id=user_id,
                session_id=session_id,
                is_self_interruption=interruption_request.is_self_interruption,
                interruption_note=interruption_request.interruption_note,
            )

            if not success:
                return jsonify({"error": message}), 400

            return jsonify({"message": message}), 200

    except ValidationError as e:
        logger.warning(f"Validation error logging focus interruption: {e}")
        return (
            jsonify({"error": "Invalid interruption data", "details": e.errors()}),
            400,
        )
    except Exception as e:
        logger.exception("Error logging focus interruption")
        return jsonify({"error": str(e)}), 500


# === FOCUS SESSION RETRIEVAL ENDPOINTS ===


@focus_bp.route("/sessions/active", methods=["GET"])
@jwt_required()
def get_active_focus_session():
    """Get the user's currently active Focus session."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            focus_service = FocusService(session)

            active_session = focus_service.get_active_focus_session(user_id)

            if not active_session:
                return jsonify({"session": None}), 200

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(active_session)
            return jsonify({"session": session_response.model_dump()}), 200

    except Exception as e:
        logger.exception("Error getting active focus session")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_focus_sessions():
    """Get user's Focus sessions with optional filtering."""
    try:
        user_id = int(get_jwt_identity())
        request_params = request.args.to_dict()
        filter_params = {
            "user_id": user_id,
            **request_params,
        }

        filter_request = FocusFilterRequest(**filter_params)

        with get_db_session() as session:
            focus_service = FocusService(session)
            focus_sessions = focus_service.get_user_focus_sessions(
                user_id=filter_request.user_id,
                start_date=filter_request.start_date,
                end_date=filter_request.end_date,
                focus_mode=filter_request.focus_mode,
                limit=filter_request.limit,
            )

            # Convert while session is active
            session_responses = [
                FocusSessionResponse.model_validate(s).model_dump()
                for s in focus_sessions
            ]
            return (
                jsonify(
                    {"sessions": session_responses, "count": len(session_responses)}
                ),
                200,
            )

    except ValidationError as e:
        logger.warning(f"Validation error getting focus sessions: {e}")
        return (
            jsonify({"error": "Invalid filter parameters", "details": e.errors()}),
            400,
        )
    except Exception as e:
        logger.exception("Error getting focus sessions")
        return jsonify({"error": "Internal server error"}), 500


@focus_bp.route("/sessions/<session_id>", methods=["GET"])
@jwt_required()
def get_focus_session_by_id(session_id: str):
    """Get a specific Focus session by ID."""
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            focus_service = FocusService(session)
            focus_session = focus_service.focus_repo.get(session_id)

            if not focus_session:
                return jsonify({"error": "Focus session not found"}), 404

            if focus_session.user_id != user_id:
                return jsonify({"error": "Access denied"}), 403

            # Convert while session is active
            session_response = FocusSessionResponse.model_validate(focus_session)
            return jsonify({"session": session_response.model_dump()}), 200

    except Exception as e:
        logger.exception("Error getting focus session by ID")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/summary/daily", methods=["GET"])
@jwt_required()
def get_daily_focus_summary():
    """Get daily Focus summary for a specific date."""
    try:
        user_id = int(get_jwt_identity())
        date_str = request.args.get("date")

        if not date_str:
            target_date = date.today()
        else:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            summary = focus_service.get_daily_focus_summary(user_id, target_date)

            if "error" in summary:
                return jsonify({"error": summary["error"]}), 500

            return jsonify(summary), 200

    except Exception as e:
        logger.exception("Error getting daily focus summary")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/statistics", methods=["GET"])
@jwt_required()
def get_focus_statistics():
    """Get comprehensive Focus statistics."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            statistics = focus_service.get_focus_statistics(user_id, days)

            if "error" in statistics:
                return jsonify({"error": statistics["error"]}), 500

            return jsonify(statistics), 200

    except Exception as e:
        logger.exception("Error getting focus statistics")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/analysis/modes", methods=["GET"])
@jwt_required()
def get_focus_mode_analysis():
    """Get analysis of productivity by focus mode."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            mode_analysis = focus_service.get_focus_mode_analysis(user_id, days)

            if "error" in mode_analysis:
                return jsonify({"error": mode_analysis["error"]}), 500

            return jsonify({"mode_stats": mode_analysis}), 200

    except Exception as e:
        logger.exception("Error getting focus mode analysis")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/insights/productivity", methods=["GET"])
@jwt_required()
def get_productivity_insights():
    """Get personalized productivity insights and recommendations."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            insights = focus_service.get_productivity_insights(user_id, days)

            if "error" in insights:
                return jsonify({"error": insights["error"]}), 500

            return jsonify(insights), 200

    except Exception as e:
        logger.exception("Error getting productivity insights")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/analysis/flow-state", methods=["GET"])
@jwt_required()
def get_flow_state_analysis():
    """Analyze flow state patterns and triggers."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            flow_analysis = focus_service.get_flow_state_analysis(user_id, days)

            if "error" in flow_analysis:
                return jsonify({"error": flow_analysis["error"]}), 500

            return jsonify(flow_analysis), 200

    except Exception as e:
        logger.exception("Error getting flow state analysis")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/recommendations/session", methods=["GET"])
@jwt_required()
def get_focus_session_recommendation():
    """Get recommendation for optimal focus session parameters."""
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            focus_service = FocusService(session)

            recommendation = focus_service.get_focus_session_recommendation(user_id)

            if "error" in recommendation:
                return jsonify({"error": recommendation["error"]}), 500

            return jsonify(recommendation), 200

    except Exception as e:
        logger.exception("Error getting focus session recommendation")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/longest", methods=["GET"])
@jwt_required()
def get_longest_sessions():
    """Get the user's longest focus sessions."""
    try:
        user_id = int(get_jwt_identity())
        limit = request.args.get("limit", 10, type=int)

        if limit < 1 or limit > 50:
            return jsonify({"error": "Limit must be between 1 and 50"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            longest_sessions = focus_service.focus_repo.get_longest_sessions(
                user_id, limit
            )

            # Convert while session is active
            session_responses = [
                FocusSessionResponse.model_validate(s).model_dump()
                for s in longest_sessions
            ]
            return (
                jsonify(
                    {"sessions": session_responses, "count": len(session_responses)}
                ),
                200,
            )

    except Exception as e:
        logger.exception("Error getting longest sessions")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/flow-state", methods=["GET"])
@jwt_required()
def get_flow_state_sessions():
    """Get sessions where flow state was achieved."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            flow_sessions = focus_service.focus_repo.get_flow_state_sessions(
                user_id, days
            )

            # Convert while session is active
            session_responses = [
                FocusSessionResponse.model_validate(s).model_dump()
                for s in flow_sessions
            ]
            return (
                jsonify(
                    {
                        "sessions": session_responses,
                        "count": len(session_responses),
                        "days_analyzed": days,
                    }
                ),
                200,
            )

    except Exception as e:
        logger.exception("Error getting flow state sessions")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/recommendations/break-activity", methods=["GET"])
@jwt_required()
def get_break_activity_suggestion():
    """Get break activity suggestion after a focus session."""
    try:
        session_duration = request.args.get("session_duration", type=int)
        energy_level = request.args.get("energy_level", type=int)

        if session_duration and session_duration < 15:
            return (
                jsonify({"error": "Session duration must be at least 15 minutes"}),
                400,
            )

        if energy_level and (energy_level < 1 or energy_level > 5):
            return jsonify({"error": "Energy level must be between 1 and 5"}), 400

        with get_db_session() as session:
            focus_service = FocusService(session)
            suggestion = focus_service.suggest_break_activity(
                session_duration_minutes=session_duration or 90,
                energy_level=energy_level,
            )

            return jsonify(suggestion), 200

    except Exception as e:
        logger.exception("Error getting break activity suggestion")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/today", methods=["GET"])
@jwt_required()
def get_today_focus_sessions():
    """Get today's Focus sessions."""
    try:
        user_id = int(get_jwt_identity())
        today = date.today()

        with get_db_session() as session:
            focus_service = FocusService(session)
            focus_sessions = focus_service.get_user_focus_sessions(
                user_id=user_id, start_date=today, end_date=today, limit=50
            )

            # Convert while session is active
            session_responses = [
                FocusSessionResponse.model_validate(s).model_dump()
                for s in focus_sessions
            ]

            return (
                jsonify(
                    {
                        "sessions": session_responses,
                        "count": len(session_responses),
                        "date": today.isoformat(),
                    }
                ),
                200,
            )

    except Exception as e:
        logger.exception("Error getting today's focus sessions")
        return jsonify({"error": str(e)}), 500


@focus_bp.route("/sessions/week", methods=["GET"])
@jwt_required()
def get_weekly_focus_sessions():
    """Get Focus sessions for the current week."""
    try:
        user_id = int(get_jwt_identity())

        # Calculate start of current week (Monday)
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        with get_db_session() as session:
            focus_service = FocusService(session)
            sessions = focus_service.get_user_focus_sessions(
                user_id=user_id,
                start_date=start_of_week,
                end_date=end_of_week,
                limit=200,  # Higher limit for weekly view
            )

            # Convert while session is active
            session_responses = [
                FocusSessionResponse.model_validate(s).model_dump() for s in sessions
            ]

            return (
                jsonify(
                    {
                        "sessions": session_responses,
                        "count": len(session_responses),
                        "week_start": start_of_week.isoformat(),
                        "week_end": end_of_week.isoformat(),
                    }
                ),
                200,
            )

    except Exception as e:
        logger.exception("Error getting weekly focus sessions")
        return jsonify({"error": str(e)}), 500
