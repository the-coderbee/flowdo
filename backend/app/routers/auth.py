"""
Authentication API endpoints.

This module contains routes for user authentication and token management.
"""

from typing import Dict, Any
from logger import get_logger
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, current_app, make_response
from pydantic import ValidationError
from functools import wraps
from flask_jwt_extended import (
    get_jwt,
    get_jwt_identity,
    jwt_required,
    set_access_cookies,
    set_refresh_cookies,
    unset_jwt_cookies,
)
from app.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    AuthResponse,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    RefreshTokenRequest,
)
from app.services import AuthService
from database.models.user import User
from database.db import db_session

# Set up logging
logger = get_logger(__name__)

# Create Blueprint
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new user and issue tokens."""
    try:
        auth_service = AuthService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        register_data = UserRegisterRequest(**payload)

        success, message, data = auth_service.register_user(
            email=register_data.email,
            password=register_data.password,
            display_name=register_data.display_name,
        )

        if not success:
            logger.warning(f"Failed to register user: {message}")
            return jsonify({"error": message}), 400

        user: User = data["user"]
        user_dto = UserResponse.model_validate(user)

        # Create response without tokens in JSON
        auth_response = AuthResponse(
            user=user_dto,
            token=TokenResponse(
                access_token="",
                refresh_token="",
                token_type="bearer",
                expires_in=current_app.config[
                    "JWT_ACCESS_TOKEN_EXPIRES"
                ].total_seconds(),
            ),
        )

        response = make_response(jsonify(auth_response.model_dump()), 201)

        # Set cookies
        set_access_cookies(response, data["access_token"])

        # Set refresh cookie based on remember_me preference
        if register_data.remember_me:
            logger.info(f"Setting persistent refresh cookie for user: {user.email}")
            set_refresh_cookies(response, data["refresh_token"])
        else:
            logger.info(f"Setting session refresh cookie for user: {user.email}")
            session_duration = current_app.config.get(
                "JWT_SESSION_REFRESH_TOKEN_EXPIRES", timedelta(hours=4)
            )

            response.set_cookie(
                current_app.config["JWT_REFRESH_COOKIE_NAME"],
                value=data["refresh_token"],
                max_age=int(session_duration.total_seconds()),
                httponly=True,
                secure=current_app.config.get("JWT_COOKIE_SECURE", False),
                samesite=current_app.config.get("JWT_COOKIE_SAMESITE", "Strict"),
                path=current_app.config.get("JWT_REFRESH_COOKIE_PATH", "/"),
            )

        logger.info(
            f"Registration successful for user: {user.email} (remember_me: {register_data.remember_me})"
        )
        return response

    except ValidationError as e:
        logger.warning(f"Validation error during registration: {str(e)}")
        return jsonify({"error": e.errors()}), 400
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login a user."""
    try:
        auth_service = AuthService(db_session)
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Invalid request"}), 400

        login_data = UserLoginRequest(**payload)

        success, message, data = auth_service.login_user(
            email=login_data.email, password=login_data.password
        )

        if not success:
            logger.warning(f"Failed to login user: {message}")
            return jsonify({"error": message}), 400

        user: User = data["user"]
        user_dto = UserResponse.model_validate(user)

        # Create response without tokens in JSON
        auth_response = AuthResponse(
            user=user_dto,
            token=TokenResponse(
                access_token="",
                refresh_token="",
                token_type="bearer",
                expires_in=current_app.config[
                    "JWT_ACCESS_TOKEN_EXPIRES"
                ].total_seconds(),
            ),
        )

        response = make_response(jsonify(auth_response.model_dump()), 200)

        # set access token cookie
        set_access_cookies(response, data["access_token"])

        # handle refresh token on remember me preference
        if login_data.remember_me:
            logger.info(f"Setting persistent refresh cookie for user: {user.email}")
            set_access_cookies(response, data["access_token"])
            set_refresh_cookies(response, data["refresh_token"])
        else:
            logger.info(f"Setting session refresh cookie for user: {user.email}")

            access_expires = current_app.config["JWT_ACCESS_TOKEN_EXPIRES"]
            session_refresh_expires = current_app.config.get(
                "JWT_SESSION_REFRESH_TOKEN_EXPIRES", timedelta(hours=4)
            )

            # set access token cookie
            response.set_cookie(
                current_app.config["JWT_ACCESS_COOKIE_NAME"],
                value=data["access_token"],
                max_age=int(access_expires.total_seconds()),
                httponly=current_app.config.get("JWT_COOKIE_HTTPONLY", True),
                secure=current_app.config.get("JWT_COOKIE_SECURE", False),
                samesite=current_app.config.get("JWT_COOKIE_SAMESITE", "Lax"),
                path=current_app.config.get("JWT_REFRESH_COOKIE_PATH", "/"),
            )

            # set refresh token cookie
            response.set_cookie(
                current_app.config["JWT_REFRESH_COOKIE_NAME"],
                value=data["refresh_token"],
                max_age=int(session_refresh_expires.total_seconds()),
                httponly=current_app.config.get("JWT_COOKIE_HTTPONLY", True),
                secure=current_app.config.get("JWT_COOKIE_SECURE", False),
                samesite=current_app.config.get("JWT_COOKIE_SAMESITE", "Lax"),
                path=current_app.config.get("JWT_REFRESH_COOKIE_PATH", "/"),
            )

            # Set CSRF tokens if CSRF protection is enabled
            if current_app.config.get("JWT_COOKIE_CSRF_PROTECT", False):
                import jwt as jwt_lib

                # Decode tokens to get CSRF values
                access_payload = jwt_lib.decode(
                    data["access_token"], options={"verify_signature": False}
                )
                refresh_payload = jwt_lib.decode(
                    data["refresh_token"], options={"verify_signature": False}
                )

                # Set CSRF cookies
                response.set_cookie(
                    current_app.config["JWT_ACCESS_CSRF_COOKIE_NAME"],
                    value=access_payload.get("csrf"),
                    max_age=int(access_expires.total_seconds()),  # Match access token
                    secure=current_app.config.get("JWT_COOKIE_SECURE", False),
                    samesite=current_app.config.get("JWT_COOKIE_SAMESITE", "Lax"),
                    path=current_app.config.get("JWT_ACCESS_CSRF_COOKIE_PATH", "/"),
                )

                response.set_cookie(
                    current_app.config["JWT_REFRESH_CSRF_COOKIE_NAME"],
                    value=refresh_payload.get("csrf"),
                    max_age=int(
                        session_refresh_expires.total_seconds()
                    ),  # Match refresh token
                    secure=current_app.config.get("JWT_COOKIE_SECURE", False),
                    samesite=current_app.config.get("JWT_COOKIE_SAMESITE", "Lax"),
                    path=current_app.config.get("JWT_REFRESH_CSRF_COOKIE_PATH", "/"),
                )

        logger.info(
            f"Login successful for user: {user.email} (remember_me: {login_data.remember_me})"
        )
        return response

    except ValidationError as e:
        logger.warning(f"Validation error during login: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during login: {str(e)}")
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    """Log out a user."""
    try:
        auth_service = AuthService(db_session)
        user_id = get_jwt_identity()
        jti = get_jwt()["jti"]

        success, message = auth_service.logout_user(int(user_id), jti)

        if not success:
            logger.warning(f"Failed to logout user: {message}")

        response = make_response(jsonify({"message": "Successfully logged out"}), 200)

        unset_jwt_cookies(response)

        logger.info(f"User {user_id} logged out successfully")
        return response

    except Exception as e:
        logger.error(f"Unexpected error during logout: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/password-reset/request", methods=["POST"])
def request_password_reset():
    """Request a password reset."""
    try:
        auth_service = AuthService(db_session)
        # Validate request
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Invalid request"}), 400

        reset_data = PasswordResetRequest(**request_data)

        return jsonify(
            {
                "message": "If the email is registered, a password reset link will be sent"
            }
        )

    except ValidationError as e:
        logger.warning(f"Validation error during password reset request: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during password reset request: {str(e)}")
        # Return the same message even if there's an error to prevent email enumeration
        return jsonify(
            {
                "message": "If the email is registered, a password reset link will be sent"
            }
        )


@auth_bp.route("/password-reset/confirm", methods=["POST"])
def confirm_password_reset():
    """Confirm a password reset."""
    try:
        # Validate request
        request_data = request.get_json()
        if not request_data:
            return jsonify({"error": "Invalid request"}), 400

        confirm_data = PasswordResetConfirmRequest(**request_data)

        return jsonify({"message": "Password has been reset"})

    except ValidationError as e:
        logger.warning(f"Validation error during password reset confirmation: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during password reset confirmation: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during password reset confirmation: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get the current authenticated user."""
    try:
        auth_service = AuthService(db_session)
        user_id = get_jwt_identity()

        is_valid, user = auth_service.verify_user_session(int(user_id))

        if not is_valid or not user:
            logger.warning(f"Invalid session for user: {user_id}")
            return jsonify({"error": "Invalid session"}), 401

        user_dto = UserResponse.model_validate(user)
        return jsonify(user_dto.model_dump()), 200

    except Exception as e:
        logger.error(f"Unexpected error getting current user: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500


@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Refresh a user's access token."""
    try:
        auth_service = AuthService(db_session)

        # Get the refresh token from the JWT identity
        current_user_id = get_jwt_identity()
        current_jwt = get_jwt()
        jti = current_jwt["jti"]

        # Get the new access token
        new_access_token = auth_service.refresh_access_token(current_user_id, jti)

        if not new_access_token:
            logger.warning(f"Invalid refresh token for user: {current_user_id}")
            return jsonify({"error": "Invalid refresh token"}), 401

        # Create response without tokens in JSON
        token_response = TokenResponse(
            access_token="",
            refresh_token="",
            token_type="bearer",
            expires_in=current_app.config["JWT_ACCESS_TOKEN_EXPIRES"].total_seconds(),
        )

        response = make_response(jsonify(token_response.model_dump()), 200)

        # Set new access token cookie (refresh token stays the same)
        set_access_cookies(response, new_access_token)

        return response

    except ValidationError as e:
        logger.warning(f"Validation error during refresh: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during refresh: {str(e)}")
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        logger.error(f"Unexpected error during refresh: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
