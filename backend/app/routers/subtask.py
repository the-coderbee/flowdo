from flask import Blueprint, jsonify, request
from app.schemas.subtask import (
    SubtaskBulkToggleRequest,
    SubtaskCompletionStatsResponse,
    SubtaskCreateRequest,
    SubtaskDeleteRequest,
    SubtaskReorderRequest,
    SubtaskResponse,
    SubtaskUpdateRequest,
)
from app.services.subtask_service import SubtaskService
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.db import db_session
from logger import get_logger

subtask_bp = Blueprint("subtask", __name__, url_prefix="/api/subtasks")

logger = get_logger(__name__)


@subtask_bp.route("/task/<int:task_id>", methods=["GET"])
@jwt_required()
def get_subtasks_by_task_id(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        success, message, subtasks = subtask_service.get_subtasks_by_task_id(
            task_id, user_id
        )
        if not success:
            return jsonify({"error": message}), 400
        subtask_responses = [SubtaskResponse.model_validate(subtask) for subtask in subtasks]
        return jsonify([response.model_dump() for response in subtask_responses]), 200
    except Exception as e:
        logger.error(f"Error getting subtasks by task id: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/<int:subtask_id>", methods=["GET"])
@jwt_required()
def get_subtask_by_id(subtask_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        success, message, subtask = subtask_service.get_subtask_by_id(
            subtask_id, user_id
        )
        if not success:
            return jsonify({"error": message}), 400
        subtask_response = SubtaskResponse.model_validate(subtask)
        return jsonify(subtask_response.model_dump()), 200
    except Exception as e:
        logger.error(f"Error getting subtask by id: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("", methods=["POST"])
@jwt_required()
def create_subtask():
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)

        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        subtask_data = SubtaskCreateRequest(**payload)
        
        # Convert Pydantic schema to SQLAlchemy model
        from database.models.subtask import Subtask
        subtask_model = Subtask(
            title=subtask_data.title,
            description=subtask_data.description,
            position=subtask_data.position,
            task_id=subtask_data.task_id
        )
        
        success, message, data = subtask_service.create_subtask(subtask_model, user_id)
        if not success:
            return jsonify({"error": message}), 400
        subtask_response = SubtaskResponse.model_validate(data)
        return jsonify(subtask_response.model_dump()), 201

    except Exception as e:
        logger.error(f"Error creating subtask: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/<int:subtask_id>", methods=["PATCH"])
@jwt_required()
def update_subtask(subtask_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400
        
        subtask_data = SubtaskUpdateRequest(**payload)
        
        # Get existing subtask to update
        existing_subtask = subtask_service.get_subtask_by_id(subtask_id, user_id)
        if not existing_subtask:
            return jsonify({"error": "Subtask not found"}), 404
            
        # Update only provided fields
        if subtask_data.title is not None:
            existing_subtask.title = subtask_data.title
        if subtask_data.description is not None:
            existing_subtask.description = subtask_data.description
        if subtask_data.position is not None:
            existing_subtask.position = subtask_data.position
        if subtask_data.is_completed is not None:
            existing_subtask.is_completed = subtask_data.is_completed
            
        success, message, data = subtask_service.update_subtask(existing_subtask, user_id)
        if not success:
            return jsonify({"error": message}), 400

        subtask_response = SubtaskResponse.model_validate(data)
        return jsonify(subtask_response.model_dump()), 200

    except Exception as e:
        logger.error(f"Error updating subtask: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/<int:subtask_id>", methods=["DELETE"])
@jwt_required()
def delete_subtask(subtask_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)

        # Get existing subtask to delete
        existing_subtask = subtask_service.get_subtask_by_id(subtask_id, user_id)
        if not existing_subtask:
            return jsonify({"error": "Subtask not found"}), 404
            
        success, message, data = subtask_service.delete_subtask(existing_subtask, user_id)
        if not success:
            return jsonify({"error": message}), 400
        return jsonify({"message": "Subtask deleted successfully"}), 200

    except Exception as e:
        logger.error(f"Error deleting subtask: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/tasks/<int:task_id>/reorder", methods=["PUT"])
@jwt_required()
def reorder_subtasks(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        subtask_data = SubtaskReorderRequest(**payload)
        success, message, data = subtask_service.reorder_subtasks(
            user_id, task_id, subtask_data.subtask_positions
        )
        if not success:
            return jsonify({"error": message}), 400

        return jsonify({"message": "Subtasks reordered successfully"}), 200

    except Exception as e:
        logger.error(f"Error reordering subtasks: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/tasks/<int:task_id>/bulk-toggle", methods=["PATCH"])
@jwt_required()
def bulk_toggle_completion(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        subtask_data = SubtaskBulkToggleRequest(**payload)
        success, message, data = subtask_service.bulk_toggle_completed(
            subtask_data.subtask_ids,
            task_id,
            subtask_data.completed,
            user_id,
        )
        if not success:
            return jsonify({"error": message}), 400
        return jsonify({"message": "Subtasks bulk toggled completed successfully"}), 200

    except Exception as e:
        logger.error(f"Error bulk toggling subtasks: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/tasks/<int:task_id>/delete", methods=["DELETE"])
@jwt_required()
def bulk_delete_subtasks(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        subtask_data = SubtaskDeleteRequest(**payload)
        success, message, data = subtask_service.delete_subtasks_by_ids(
            subtask_data.subtask_ids, task_id, user_id
        )
        if not success:
            return jsonify({"error": message}), 400
        return jsonify({"message": "Subtasks deleted successfully"}), 200

    except Exception as e:
        logger.error(f"Error deleting subtasks: {e}")
        return jsonify({"error": str(e)}), 500


@subtask_bp.route("/tasks/<int:task_id>/completion-count", methods=["GET"])
@jwt_required()
def get_completion_stats(task_id: int):
    try:
        user_id = int(get_jwt_identity())
        subtask_service = SubtaskService(db_session)

        success, message, data = subtask_service.get_completion_count(task_id, user_id)
        if not success:
            return jsonify({"error": message}), 400

        subtask_response = SubtaskCompletionStatsResponse(
            total=data["total"],
            completed=data["completed"],
            completion_percentage=data["completion_percentage"],
            task_id=task_id,
        )

        return jsonify(subtask_response.model_dump()), 200

    except Exception as e:
        logger.error(f"Error getting completion stats: {e}")
        return jsonify({"error": str(e)}), 500
