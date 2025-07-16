"""
Task API endpoints.

This module contains routes for task management.
"""

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from app.schemas.task import (
    TaskCreateRequest,
    TaskFilterRequest,
    TaskResponse,
    TaskUpdateRequest,
)
from app.services.task_service import TaskService
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import get_db_session
from logger import get_logger

# Set up logging
logger = get_logger(__name__)

# Create Blueprint
task_bp = Blueprint("task", __name__, url_prefix="/api/tasks")


@task_bp.route("/", methods=["GET"])
@task_bp.route("", methods=["GET"])
@jwt_required()
def get_tasks():
    """Get user's tasks with filtering, sorting, and pagination."""
    try:
        user_id = int(get_jwt_identity())
        request_params = request.args.to_dict()
        filter_params = {
            "user_id": user_id,
            **request_params,
        }
        filter_request = TaskFilterRequest(**filter_params)

        with get_db_session() as session:
            task_service = TaskService(session)

            # Get tasks with validated filters
            result = task_service.get_all_tasks_for_user(
                user_id=user_id,
                filters=filter_request.to_service_filters(),
                sort_by=filter_request.sort_by,
                sort_order=filter_request.sort_order,
                page=filter_request.page,
                page_size=filter_request.page_size,
            )

            return (
                jsonify(
                    {
                        "tasks": [task.to_dict() for task in result["tasks"]],
                        "pagination": {
                            "total_count": result["total_count"],
                            "page": result["page"],
                            "page_size": result["page_size"],
                            "total_pages": result["total_pages"],
                            "has_next": result["has_next"],
                            "has_prev": result["has_prev"],
                        },
                        "filters_applied": filter_request.to_service_filters(),
                        "sort": {
                            "sort_by": filter_request.sort_by,
                            "sort_order": filter_request.sort_order,
                        },
                    }
                ),
                200,
            )

    except ValidationError as e:
        logger.warning(f"Validation error getting tasks: {e}")
        return (
            jsonify({"error": "Invalid filter parameters", "details": e.errors()}),
            400,
        )
    except Exception as e:
        logger.exception("Error getting tasks")
        return jsonify({"error": "Internal server error"}), 500


@task_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_tasks():
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            task_service = TaskService(session)
            tasks = task_service.get_today_tasks(user_id)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting today's tasks: {str(e)}")
        return jsonify({"error": "Failed to retrieve today's tasks"}), 500


@task_bp.route("/overdue", methods=["GET"])
@jwt_required()
def get_overdue_tasks():
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            task_service = TaskService(session)
            tasks = task_service.get_overdue_tasks(user_id)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting overdue tasks: {str(e)}")
        return jsonify({"error": "Failed to retrieve overdue tasks"}), 500


@task_bp.route("/starred", methods=["GET"])
@jwt_required()
def get_starred_tasks():
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            task_service = TaskService(session)

            tasks = task_service.get_starred_tasks(user_id)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting starred tasks: {str(e)}")
        return jsonify({"error": "Failed to retrieve starred tasks"}), 500


@task_bp.route("/search", methods=["GET"])
@jwt_required()
def search_tasks():
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            task_service = TaskService(session)

            search_query = request.args.get("q", "").strip()
            if not search_query:
                return jsonify({"error": "Search query is required"}), 400

            tasks = task_service.search_tasks(user_id, search_query)

            return (
                jsonify(
                    {
                        "tasks": [task.to_dict() for task in tasks],
                        "count": len(tasks),
                        "query": search_query,
                    }
                ),
                200,
            )

    except Exception as e:
        logger.warning(f"Error searching tasks: {str(e)}")
        return jsonify({"error": "Failed to search tasks"}), 500


@task_bp.route("/by-priorities", methods=["GET"])
@jwt_required()
def get_tasks_by_priorities():
    try:
        user_id = int(get_jwt_identity())
        priority_params = request.args.get("priority")
        if not priority_params:
            return jsonify({"error": "Priority list cannot be empty"}), 400

        priority_list = [p.strip() for p in priority_params.split(",")]

        with get_db_session() as session:
            task_service = TaskService(session)
            tasks = task_service.get_tasks_by_priorities(user_id, priority_list)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting tasks by priority: {str(e)}")
        return jsonify({"error": "Failed to get tasks by priority"}), 500


@task_bp.route("/by-statuses", methods=["GET"])
@jwt_required()
def get_tasks_by_statuses():
    try:
        user_id = int(get_jwt_identity())
        status_param = request.args.get("status")
        if not status_param:
            return jsonify({"error": "Status list cannot be empty"}), 400

        status_list = [s.strip() for s in status_param.split(",")]

        with get_db_session() as session:
            task_service = TaskService(session)
            tasks = task_service.get_tasks_by_statuses(user_id, status_list)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting tasks by status: {str(e)}")
        return jsonify({"error": "Failed to get tasks by status"}), 500


@task_bp.route("/by-tags", methods=["GET"])
@jwt_required()
def get_tasks_by_tags():
    try:
        user_id = int(get_jwt_identity())
        tags_param = request.args.get("tag")
        if not tags_param:
            return jsonify({"error": "Tag list cannot be empty"}), 400

        tags_list = [t.strip() for t in tags_param.split(",")]

        with get_db_session() as session:
            task_service = TaskService(session)
            tasks = task_service.get_tasks_by_tags(user_id, tags_list)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting tasks by tag: {str(e)}")
        return jsonify({"error": "Failed to get tasks by tag"}), 500


@task_bp.route("/by-group", methods=["GET"])
@jwt_required()
def get_tasks_by_group():
    try:
        user_id = int(get_jwt_identity())
        group_param = request.args.get("group_id")

        if not group_param:
            return jsonify({"error": "Group ID is required"}), 400

        with get_db_session() as session:
            task_service = TaskService(session)
            group_id = int(group_param)
            tasks = task_service.get_tasks_by_group(user_id, group_id)

            return (
                jsonify(
                    {"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}
                ),
                200,
            )
    except Exception as e:
        logger.warning(f"Error getting tasks by group: {str(e)}")
        return jsonify({"error": "Failed to get tasks by group"}), 500


@task_bp.route("/create", methods=["POST"])
@jwt_required()
def create_task():
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400
        task_payload = TaskCreateRequest(**payload)

        with get_db_session() as session:
            task_service = TaskService(session)
            success, message, data = task_service.create_task(task_payload)
            if not success:
                return jsonify({"error": message}), 400
            # Convert to dict while session is still active
            result = data.to_dict()
            return jsonify(result), 201
    except Exception as e:
        logger.exception("Error creating task")
        return jsonify({"error": str(e)}), 400


@task_bp.route("/<int:task_id>", methods=["PATCH"])
@jwt_required()
def update_task(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400
        task_payload = TaskUpdateRequest(**payload)
        with get_db_session() as session:
            task_service = TaskService(session)

            success, message, data = task_service.update_task(
                task_id, int(user_id), task_payload
            )
            if not success:
                return jsonify({"error": message}), 400
            if not data:
                return jsonify({"error": "Task not found"}), 404
            # Convert to dict while session is still active
            result = data.to_dict()
            return jsonify(result), 200
    except Exception as e:
        logger.exception("Error updating task")
        return jsonify({"error": str(e)}), 400


@task_bp.route("/<int:task_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_task_completion(task_id: int):
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            task_service = TaskService(session)
            success, message, data = task_service.toggle_task_completion(
                task_id, int(user_id)
            )
            if not success:
                return jsonify({"error": message}), 400

            if not data:
                return jsonify({"error": "Task not found"}), 404
            # Convert to dict while session is still active
            result = data.to_dict()
            return jsonify(result), 200
    except Exception as e:
        logger.exception("Error toggling task completion")
        return jsonify({"error": str(e)}), 400


@task_bp.route("/<int:task_id>/star", methods=["PATCH"])
@jwt_required()
def toggle_task_star(task_id: int):
    try:
        user_id = int(get_jwt_identity())

        with get_db_session() as session:
            task_service = TaskService(session)
            success, message, data = task_service.toggle_task_star(
                task_id, int(user_id)
            )
            if not success:
                return jsonify({"error": message}), 400

            if not data:
                return jsonify({"error": "Task not found"}), 404
            # Convert to dict while session is still active
            result = data.to_dict()
            return jsonify(result), 200

    except Exception as e:
        logger.exception("Error toggling task star")
        return jsonify({"error": str(e)}), 400


@task_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        with get_db_session() as session:
            task_service = TaskService(session)
            success, message = task_service.delete_task(task_id, int(user_id))
            if not success:
                return jsonify({"error": message}), 400
            return jsonify({"message": message}), 200
    except Exception as e:
        logger.exception("Error deleting task")
        return jsonify({"error": str(e)}), 400
