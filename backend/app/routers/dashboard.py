from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.services.dashboard_service import DashboardService
from database.db import db_session

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")


@dashboard_bp.route("/data", methods=["GET"])
@jwt_required()
def get_dashboard_data():
    user_id = int(get_jwt_identity())
    dashboard_service = DashboardService(db_session)

    try:
        data = dashboard_service.get_dashboard_data(user_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
