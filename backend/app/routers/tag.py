from flask import Blueprint, jsonify
from app.services.tag_service import TagService
from app.schemas.tag import TagResponse
from database.db import db_session

tag_bp = Blueprint('tag', __name__, url_prefix='/api/tags')

@tag_bp.route('/<int:user_id>', methods=['GET'])
def get_tags(user_id: int):
    tag_service = TagService(db_session)
    success, message, data = tag_service.get_all_tags_for_user(user_id)
    if not success:
        return jsonify({'error': message}), 400
    out = [TagResponse.model_validate(tag).model_dump() for tag in data]
    return jsonify(out), 200