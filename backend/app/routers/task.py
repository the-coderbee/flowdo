"""
Task API endpoints.

This module contains routes for task management.
"""

import logging

from flask import Blueprint, jsonify, request
from app.schemas.task import TaskCreateRequest, TaskResponse, TaskUpdateRequest
from app.services.task_service import TaskService
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db_session

# Set up logging
logger = logging.getLogger(__name__)

# Create Blueprint
task_bp = Blueprint("task", __name__, url_prefix="/api/tasks")


@task_bp.route("/", methods=["GET"])
@task_bp.route("", methods=["GET"])
@jwt_required()
def get_tasks():
    try:
        user_id = int(get_jwt_identity())
        task_service = TaskService(db_session)

        # parse pagination params
        page = int(request.args.get("page", 1))
        page_size = min(int(request.args.get("page_size", 10)), 20)

        # parse sorting params
        sort_by = request.args.get("sort_by", "created_at")
        sort_order = request.args.get("sort_order", "desc")

        # filters dict
        filters = {}

        # status filter
        if request.args.get("status"):
            status_list = [s.strip() for s in request.args.get("status").split(",")]
            filters["status"] = status_list if len(status_list) > 1 else status_list[0]

        # priority filter
        if request.args.get("priority"):
            priority_list = [p.strip() for p in request.args.get("priority").split(",")]
            filters["priority"] = (
                priority_list if len(priority_list) > 1 else priority_list[0]
            )

        # boolean filters
        if request.args.get("starred"):
            filters["starred"] = request.args.get("starred").lower() == "true"

        if request.args.get("completed"):
            filters["completed"] = request.args.get("completed").lower() == "true"

        if request.args.get("overdue"):
            filters["overdue"] = request.args.get("overdue").lower() == "true"

        # search filter
        if request.args.get("search"):
            filters["search"] = request.args.get("search").strip()

        # date filters
        if request.args.get("due_date_from") or request.args.get("due_date_to"):
            due_date_filter = {}
            if request.args.get("due_date_from"):
                due_date_filter["from"] = request.args.get("due_date_from").strip()
            if request.args.get("due_date_to"):
                due_date_filter["to"] = request.args.get("due_date_to").strip()
            filters["due_date"] = due_date_filter

        # get tasks with filters
        result = task_service.get_all_tasks_for_user(
            user_id=user_id,
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order,
            page=page,
            page_size=page_size,
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
                    "filters_applied": filters,
                    "sort": {"sort_by": sort_by, "sort_order": sort_order},
                }
            ),
            200,
        )
    except Exception as e:
        logger.warning(f"Error getting tasks: {str(e)}")
        return jsonify({"error": str(e)}), 500


@task_bp.route("/today", methods=["GET"])
@jwt_required()
def get_today_tasks():
    try:
        user_id = int(get_jwt_identity())
        task_service = TaskService(db_session)

        tasks = task_service.get_today_tasks(user_id)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)

        tasks = task_service.get_overdue_tasks(user_id)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)

        tasks = task_service.get_starred_tasks(user_id)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)

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
        task_service = TaskService(db_session)
        priority_list = [p.strip() for p in request.args.get("priority").split(",")]
        tasks = task_service.get_tasks_by_priorities(user_id, priority_list)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)
        status_list = [s.strip() for s in request.args.get("status").split(",")]
        tasks = task_service.get_tasks_by_statuses(user_id, status_list)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)
        tags_list = [t.strip() for t in request.args.get("tag").split(",")]
        tasks = task_service.get_tasks_by_tags(user_id, tags_list)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
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
        task_service = TaskService(db_session)
        group_id = int(request.args.get("group_id"))
        tasks = task_service.get_tasks_by_group(user_id, group_id)

        return (
            jsonify({"tasks": [task.to_dict() for task in tasks], "count": len(tasks)}),
            200,
        )
    except Exception as e:
        logger.warning(f"Error getting tasks by group: {str(e)}")
        return jsonify({"error": "Failed to get tasks by group"}), 500


@task_bp.route("/create", methods=["POST"])
@jwt_required()
def create_task():
    try:
        task_service = TaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400
        task_payload = TaskCreateRequest(**payload)
        success, message, data = task_service.create_task(task_payload)
        if not success:
            return jsonify({"error": message}), 400
    except Exception as e:
        logger.exception("Error creating task")
        return jsonify({"error": str(e)}), 400
    return jsonify(data), 201


@task_bp.route("/<int:task_id>", methods=["PATCH"])
@jwt_required()
def update_task(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        task_service = TaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400
        task_payload = TaskUpdateRequest(**payload)
        success, message, data = task_service.update_task(
            task_id, int(user_id), task_payload
        )
        if not success:
            return jsonify({"error": message}), 400
    except Exception as e:
        logger.exception("Error updating task")
        return jsonify({"error": str(e)}), 400
    return jsonify(data), 200


@task_bp.route("/<int:task_id>/toggle", methods=["PATCH"])
@jwt_required()
def toggle_task_completion(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        task_service = TaskService(db_session)
        success, message, data = task_service.toggle_task_completion(
            task_id, int(user_id)
        )
        if not success:
            return jsonify({"error": message}), 400
    except Exception as e:
        logger.exception("Error toggling task completion")
        return jsonify({"error": str(e)}), 400
    return jsonify(data), 200


@task_bp.route("/<int:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        task_service = TaskService(db_session)
        success, message = task_service.delete_task(task_id, int(user_id))
        if not success:
            return jsonify({"error": message}), 400
    except Exception as e:
        logger.exception("Error deleting task")
        return jsonify({"error": str(e)}), 400
    return jsonify({"message": message}), 200
