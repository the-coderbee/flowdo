"""
Task API endpoints.

This module contains routes for task management.
"""
import logging

from flask import Blueprint, jsonify, request
from app.schemas.task import TaskCreateRequest, TaskResponse
from app.services.task_service import TaskService

from database.db import db_session

# Set up logging
logger = logging.getLogger(__name__)

# Create Blueprint
task_bp = Blueprint('task', __name__, url_prefix='/api/tasks')

@task_bp.route('/<int:user_id>', methods=['GET'])
def get_tasks(user_id: int):
    task_service = TaskService(db_session)
    success, message, data = task_service.get_all_tasks_for_user(user_id)
    if not success:
        return jsonify({'error': message}), 400
    out = [TaskResponse.model_validate(task).model_dump() for task in data]
    return jsonify(out), 200

@task_bp.route('/create', methods=['POST'])
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
