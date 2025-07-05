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
task_bp = Blueprint('task', __name__, url_prefix='/api/tasks')

@task_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_tasks(user_id: int):
    task_service = TaskService(db_session)
    success, message, data = task_service.get_all_tasks_for_user(user_id)
    if not success:
        return jsonify({'error': message}), 400
    out = [TaskResponse.model_validate(task).model_dump() for task in data]
    return jsonify(out), 200

@task_bp.route('/create', methods=['POST'])
@jwt_required()
def create_task():
    try:
        task_service = TaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({'error': 'Invalid request'}), 400
        task_payload = TaskCreateRequest(**payload)
        success, message, data = task_service.create_task(task_payload)
        if not success:
            return jsonify({'error': message}), 400
    except Exception as e:
        logger.exception("Error creating task")
        return jsonify({'error': str(e)}), 400
    return jsonify(data), 201


@task_bp.route('/<int:task_id>', methods=['PATCH'])
@jwt_required()
def update_task(task_id: int):
    try:
        user_id = get_jwt_identity()
        task_service = TaskService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({'error': 'Invalid request'}), 400
        task_payload = TaskUpdateRequest(**payload)
        success, message, data = task_service.update_task(task_id, int(user_id), task_payload)
        if not success:
            return jsonify({'error': message}), 400
    except Exception as e:
        logger.exception("Error updating task")
        return jsonify({'error': str(e)}), 400
    return jsonify(data), 200


@task_bp.route('/<int:task_id>/toggle', methods=['PATCH'])
@jwt_required()
def toggle_task_completion(task_id: int):
    try:
        user_id = get_jwt_identity()
        task_service = TaskService(db_session)
        success, message, data = task_service.toggle_task_completion(task_id, int(user_id))
        if not success:
            return jsonify({'error': message}), 400
    except Exception as e:
        logger.exception("Error toggling task completion")
        return jsonify({'error': str(e)}), 400
    return jsonify(data), 200


@task_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id: int):
    try:
        user_id = get_jwt_identity()
        task_service = TaskService(db_session)
        success, message = task_service.delete_task(task_id, int(user_id))
        if not success:
            return jsonify({'error': message}), 400
    except Exception as e:
        logger.exception("Error deleting task")
        return jsonify({'error': str(e)}), 400
    return jsonify({'message': message}), 200