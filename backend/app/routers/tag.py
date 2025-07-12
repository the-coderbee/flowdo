from flask import Blueprint, jsonify, request
from app.services.tag_service import TagService
from app.schemas.tag import TagResponse, TagCreateRequest, TagUpdateRequest
from database.db import db_session
from flask_jwt_extended import jwt_required, get_jwt_identity

tag_bp = Blueprint("tag", __name__, url_prefix="/api/tags")


@tag_bp.route("/", methods=["GET"])
@tag_bp.route("", methods=["GET"])
@jwt_required()
def get_tags():
    user_id = int(get_jwt_identity())
    tag_service = TagService(db_session)
    success, message, data = tag_service.get_all_tags_for_user(user_id)
    if not success:
        return jsonify({"error": message}), 400
    out = [TagResponse.model_validate(tag).model_dump() for tag in data]
    return jsonify(out), 200


@tag_bp.route("/create", methods=["POST"])
@jwt_required()
def create_tag():
    try:
        data = request.get_json()
        tag_create_request = TagCreateRequest(**data)
        tag_service = TagService(db_session)
        success, message, tag = tag_service.create_tag(tag_create_request)
        if not success:
            return jsonify({"error": message}), 400
        return jsonify(TagResponse.model_validate(tag).model_dump()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@tag_bp.route("/<int:tag_id>", methods=["PUT"])
@jwt_required()
def update_tag(tag_id: int):
    try:
        data = request.get_json()
        data["id"] = tag_id
        tag_update_request = TagUpdateRequest(**data)
        tag_service = TagService(db_session)
        success, message, tag = tag_service.update_tag(tag_update_request)
        if not success:
            return jsonify({"error": message}), 400
        return jsonify(TagResponse.model_validate(tag).model_dump()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@tag_bp.route("/<int:tag_id>", methods=["DELETE"])
@jwt_required()
def delete_tag(tag_id: int):
    try:
        tag_service = TagService(db_session)
        success, message = tag_service.delete_tag(tag_id)
        if not success:
            return jsonify({"error": message}), 400
        return jsonify({"message": message}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
