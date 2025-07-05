from flask import Blueprint, jsonify, request
from app.services.group_service import GroupService
from app.schemas.group import GroupResponse, GroupCreateRequest, GroupUpdateRequest
from database.db import db_session

group_bp = Blueprint('group', __name__, url_prefix='/api/groups')

@group_bp.route('/<int:user_id>', methods=['GET'])
def get_groups(user_id: int):
    group_service = GroupService(db_session)
    success, message, data = group_service.get_all_groups_for_user(user_id)
    if not success:
        return jsonify({'error': message}), 400
    out = [GroupResponse.model_validate(group).model_dump() for group in data]
    return jsonify(out), 200

@group_bp.route('', methods=['POST'])
def create_group():
    try:
        data = request.get_json()
        group_create_request = GroupCreateRequest(**data)
        group_service = GroupService(db_session)
        success, message, group = group_service.create_group(group_create_request)
        if not success:
            return jsonify({'error': message}), 400
        return jsonify(GroupResponse.model_validate(group).model_dump()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:group_id>', methods=['PUT'])
def update_group(group_id: int):
    try:
        data = request.get_json()
        data['id'] = group_id
        group_update_request = GroupUpdateRequest(**data)
        group_service = GroupService(db_session)
        success, message, group = group_service.update_group(group_update_request)
        if not success:
            return jsonify({'error': message}), 400
        return jsonify(GroupResponse.model_validate(group).model_dump()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@group_bp.route('/<int:group_id>', methods=['DELETE'])
def delete_group(group_id: int):
    try:
        group_service = GroupService(db_session)
        success, message = group_service.delete_group(group_id)
        if not success:
            return jsonify({'error': message}), 400
        return jsonify({'message': message}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400