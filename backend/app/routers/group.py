from flask import Blueprint, jsonify, request
from app.services.group_service import GroupService
from app.schemas.group import GroupResponse, GroupCreateRequest, GroupUpdateRequest
from database.db import get_db_session
from flask_jwt_extended import get_jwt_identity, jwt_required

group_bp = Blueprint("group", __name__, url_prefix="/api/groups")


@group_bp.route("/", methods=["GET"])
@group_bp.route("", methods=["GET"])
@jwt_required()
def get_groups():
    user_id = int(get_jwt_identity())

    with get_db_session() as session:
        group_service = GroupService(session)
        success, message, data = group_service.get_all_groups_for_user(user_id)
        if not success:
            return jsonify({"error": message}), 400
        out = [GroupResponse.model_validate(group).model_dump() for group in data]
        return jsonify(out), 200


@group_bp.route("/create", methods=["POST"])
@jwt_required()
def create_group():
    try:
        data = request.get_json()
        group_create_request = GroupCreateRequest(**data)
        with get_db_session() as session:
            group_service = GroupService(session)
            success, message, group = group_service.create_group(group_create_request)
            if not success:
                return jsonify({"error": message}), 400
            return jsonify(GroupResponse.model_validate(group).model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@group_bp.route("/update", methods=["PUT"])
@jwt_required()
def update_group(group_id: int):
    try:
        data = request.get_json()
        data["id"] = group_id
        group_update_request = GroupUpdateRequest(**data)
        with get_db_session() as session:
            group_service = GroupService(session)
            success, message, group = group_service.update_group(group_update_request)
            if not success:
                return jsonify({"error": message}), 400
            return jsonify(GroupResponse.model_validate(group).model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@group_bp.route("/<int:group_id>", methods=["DELETE"])
def delete_group(group_id: int):
    try:
        with get_db_session() as session:
            group_service = GroupService(session)
            success, message = group_service.delete_group(group_id)
            if not success:
                return jsonify({"error": message}), 400
            return jsonify({"message": message}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
