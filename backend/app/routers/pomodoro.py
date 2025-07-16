# backend/app/routers/pomodoro.py - Pomodoro Session API endpoints

import logging
from datetime import date, datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import ValidationError

from app.schemas.pomodoro import (
    PomodoroSessionCreateRequest,
    PomodoroSessionUpdateRequest,
    PomodoroSessionResponse,
    InterruptionLogRequest,
    SessionFilterRequest,
)
from app.services.pomodoro_service import PomodoroService
from database.db import get_db_session
from database.models.pomodoro_session import PomodoroSessionType, PomodoroSessionStatus

# Set up logging
logger = logging.getLogger(__name__)

# Create Blueprint
pomodoro_bp = Blueprint("pomodoro", __name__, url_prefix="/api/pomodoro")


@pomodoro_bp.route("/sessions", methods=["POST"])
@jwt_required()
def start_session():
    """Start a new Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is required"}), 400

        # Validate request data
        session_request = PomodoroSessionCreateRequest(**data)

        # Create service and start session
        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            success, message, pomo_session = pomodoro_service.start_session(
                user_id=user_id,
                session_type=session_request.session_type,
                task_id=session_request.task_id,
                planned_duration=session_request.planned_duration,
                location=session_request.location,
                ambient_sound_used=session_request.ambient_sound_used,
            )

            if not success:
                return jsonify({"error": message}), 400

            # Return session response - convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                201,
            )

    except ValidationError as e:
        logger.warning(f"Validation error starting session: {e}")
        return jsonify({"error": "Invalid request data", "details": e.errors()}), 400
    except Exception as e:
        logger.exception("Error starting Pomodoro session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/<session_id>/pause", methods=["POST"])
@jwt_required()
def pause_session(session_id: str):
    """Pause an active Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)

            success, message, pomo_session = pomodoro_service.pause_session(
                user_id, session_id
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error pausing Pomodoro session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/<session_id>/resume", methods=["POST"])
@jwt_required()
def resume_session(session_id: str):
    """Resume a paused Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)

            success, message, pomo_session = pomodoro_service.resume_session(
                user_id, session_id
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error resuming Pomodoro session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/<session_id>/complete", methods=["POST"])
@jwt_required()
def complete_session(session_id: str):
    """Complete a Pomodoro session with optional feedback."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}

        session_update = PomodoroSessionUpdateRequest(**data)

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            success, message, pomo_session = pomodoro_service.complete_session(
                user_id=user_id,
                session_id=session_id,
                focus_quality_rating=session_update.focus_quality_rating,
                productivity_rating=session_update.productivity_rating,
                energy_after=session_update.energy_after,
                session_notes=session_update.session_notes,
                accomplishments=session_update.accomplishments,
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except ValidationError as e:
        logger.warning(f"Validation error completing session: {e}")
        return jsonify({"error": "Invalid feedback data", "details": e.errors()}), 400
    except Exception as e:
        logger.exception("Error completing Pomodoro session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/<session_id>/abandon", methods=["POST"])
@jwt_required()
def abandon_session(session_id: str):
    """Abandon an active Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json() or {}
        reason = data.get("reason")

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            success, message, pomo_session = pomodoro_service.abandon_session(
                user_id, session_id, reason
            )

            if not success:
                return jsonify({"error": message}), 400

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return (
                jsonify({"message": message, "session": session_response.model_dump()}),
                200,
            )

    except Exception as e:
        logger.exception("Error abandoning Pomodoro session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/<session_id>/interruption", methods=["POST"])
@jwt_required()
def log_interruption(session_id: str):
    """Log an interruption during a Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({"error": "Interruption data is required"}), 400

        interruption_request = InterruptionLogRequest(**data)

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            success, message = pomodoro_service.log_interruption(
                user_id=user_id,
                session_id=session_id,
                interruption_type=interruption_request.interruption_type,
                interruption_duration=interruption_request.interruption_duration,
                description=interruption_request.description,
            )

            if not success:
                return jsonify({"error": message}), 400

            return jsonify({"message": message}), 200

    except ValidationError as e:
        logger.warning(f"Validation error logging interruption: {e}")
        return (
            jsonify({"error": "Invalid interruption data", "details": e.errors()}),
            400,
        )
    except Exception as e:
        logger.exception("Error logging interruption")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/active", methods=["GET"])
@jwt_required()
def get_active_session():
    """Get the user's currently active Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as db_session:
            pomodoro_service = PomodoroService(db_session)

            active_session = pomodoro_service.get_active_session(user_id)

            if not active_session:
                return jsonify({"session": None}), 200

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(active_session)
            return jsonify({"session": session_response.model_dump()}), 200

    except Exception as e:
        logger.exception("Error getting active session")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions", methods=["GET"])
@jwt_required()
def get_sessions():
    """Get user's Pomodoro sessions with optional filtering."""
    try:
        user_id = int(get_jwt_identity())
        request_params = request.args.to_dict()
        filter_params = {
            "user_id": user_id,
            **request_params,
        }
        filter_request = SessionFilterRequest(**filter_params)

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            pomo_sessions = pomodoro_service.get_user_sessions(
                user_id=user_id,
                start_date=filter_request.start_date,
                end_date=filter_request.end_date,
                limit=filter_request.limit,
            )

            # Convert while session is active
            session_responses = [
                PomodoroSessionResponse.model_validate(s).model_dump()
                for s in pomo_sessions
            ]
            return (
                jsonify(
                    {"sessions": session_responses, "count": len(session_responses)}
                ),
                200,
            )

    except ValidationError as e:
        logger.warning(f"Validation error getting sessions: {e}")
        return (
            jsonify({"error": "Invalid filter parameters", "details": e.errors()}),
            400,
        )
    except Exception as e:
        logger.exception("Error getting sessions")
        return jsonify({"error": "Internal server error"}), 500


@pomodoro_bp.route("/sessions/<session_id>", methods=["GET"])
@jwt_required()
def get_session_by_id(session_id: str):
    """Get a specific Pomodoro session by ID."""
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)

            # Get session by session_id (UUID)
            pomo_session = pomodoro_service.pomodoro_repo.get(session_id)

            if not pomo_session:
                return jsonify({"error": "Session not found"}), 404

            if pomo_session.user_id != user_id:
                return jsonify({"error": "Access denied"}), 403

            # Convert while session is active
            session_response = PomodoroSessionResponse.model_validate(pomo_session)
            return jsonify({"session": session_response.model_dump()}), 200

    except Exception as e:
        logger.exception("Error getting session by ID")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/summary/daily", methods=["GET"])
@jwt_required()
def get_daily_summary():
    """Get daily Pomodoro summary for a specific date."""
    try:
        user_id = int(get_jwt_identity())
        date_str = request.args.get("date")

        if not date_str:
            target_date = date.today()
        else:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            summary = pomodoro_service.get_daily_summary(user_id, target_date)

            if "error" in summary:
                return jsonify({"error": summary["error"]}), 500

            return jsonify(summary), 200

    except Exception as e:
        logger.exception("Error getting daily summary")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/recommendations/next-session", methods=["GET"])
@jwt_required()
def get_next_session_recommendation():
    """Get recommendation for the next Pomodoro session."""
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)

            recommendation = pomodoro_service.get_next_session_recommendation(user_id)

            if "error" in recommendation:
                return jsonify({"error": recommendation["error"]}), 500

            return jsonify(recommendation), 200

    except Exception as e:
        logger.exception("Error getting session recommendation")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/statistics", methods=["GET"])
@jwt_required()
def get_statistics():
    """Get comprehensive Pomodoro statistics."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            statistics = pomodoro_service.get_statistics(user_id, days)

            if "error" in statistics:
                return jsonify({"error": statistics["error"]}), 500

            return jsonify(statistics), 200

    except Exception as e:
        logger.exception("Error getting statistics")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/patterns/productivity", methods=["GET"])
@jwt_required()
def get_productivity_patterns():
    """Get productivity patterns analysis."""
    try:
        user_id = int(get_jwt_identity())
        days = request.args.get("days", 30, type=int)

        if days < 1 or days > 365:
            return jsonify({"error": "Days must be between 1 and 365"}), 400

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            patterns = pomodoro_service.get_productivity_patterns(user_id, days)

            if "error" in patterns:
                return jsonify({"error": patterns["error"]}), 500

            return jsonify(patterns), 200

    except Exception as e:
        logger.exception("Error getting productivity patterns")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/week", methods=["GET"])
@jwt_required()
def get_weekly_sessions():
    """Get Pomodoro sessions for the current week."""
    try:
        user_id = int(get_jwt_identity())

        # Calculate start of current week (Monday)
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            sessions = pomodoro_service.get_user_sessions(
                user_id=user_id,
                start_date=start_of_week,
                end_date=end_of_week,
                limit=200,
            )

            # Convert while session is active
            session_responses = [
                PomodoroSessionResponse.model_validate(s).model_dump() for s in sessions
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
        logger.exception("Error getting weekly sessions")
        return jsonify({"error": str(e)}), 500


@pomodoro_bp.route("/sessions/today", methods=["GET"])
@jwt_required()
def get_today_sessions():
    """Get today's Pomodoro sessions."""
    try:
        user_id = int(get_jwt_identity())
        today = date.today()

        with get_db_session() as session:
            pomodoro_service = PomodoroService(session)
            sessions = pomodoro_service.get_user_sessions(
                user_id=user_id, start_date=today, end_date=today, limit=50
            )

            # Convert while session is active
            session_responses = [
                PomodoroSessionResponse.model_validate(s).model_dump() for s in sessions
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
        logger.exception("Error getting today's sessions")
        return jsonify({"error": str(e)}), 500
