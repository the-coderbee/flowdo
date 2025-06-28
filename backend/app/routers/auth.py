"""
Authentication API endpoints.

This module contains routes for user authentication and token management.
"""
from typing import Dict, Any
import logging
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, current_app, g
from pydantic import ValidationError
from functools import wraps
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from app.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    AuthResponse,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    RefreshTokenRequest
)
from app.services import AuthService
from database.models.user import User
from database.db import db_session

# Set up logging
logger = logging.getLogger(__name__)

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user and issue tokens."""
    try:
        auth_service = AuthService(db_session)
        payload = request.get_json()
        if not payload:
            return jsonify({'error': 'Invalid request'}), 400
        
        register_data = UserRegisterRequest(**payload)

        success, message, data = auth_service.register_user(
            email=register_data.email,
            password=register_data.password,
            display_name=register_data.display_name
        )
        
        if not success:
            return jsonify({'error': message}), 400


        token_dto = TokenResponse(
            access_token=data['access_token'],
            refresh_token=data['refresh_token'],
            token_type="bearer",
            expires_in=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 60) * 60  # Convert minutes to seconds
        )

        user: User = data['user']

        user_dto = UserResponse.model_validate(user)

        return jsonify(AuthResponse(user=user_dto, token=token_dto).model_dump()), 201

    except ValidationError as e:
        logger.warning(f"Validation error during registration: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user."""
    try:
        auth_service = AuthService(db_session)
        payload = request.get_json()
        if not payload:
            return jsonify({'error': 'Invalid request'}), 400
        
        login_data = UserLoginRequest(**payload)
        
        success, message, data = auth_service.login_user(
            email=login_data.email,
            password=login_data.password
        )

        if not success:
            return jsonify({'error': message}), 400
        
        token_dto = TokenResponse(
            access_token=data['access_token'],
            refresh_token=data['refresh_token'],
            token_type="bearer",
            expires_in=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 60) * 60  # Convert minutes to seconds
        )
        
        user: User = data['user']
        
        user_dto = UserResponse.model_validate(user)
        return jsonify(AuthResponse(user=user_dto, token=token_dto).model_dump()), 200
        
    except ValidationError as e:
        logger.warning(f"Validation error during login: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during login: {str(e)}")
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logger.error(f"Unexpected error during login: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh a user's access token."""
    try:
        auth_service = AuthService(db_session)
        payload = request.get_json()
        if not payload:
            return jsonify({'error': 'Invalid request'}), 400
        
        refresh_data = RefreshTokenRequest(**payload)
        
        new_access_token = auth_service.refresh_token(refresh_data.refresh_token)

        if not new_access_token:
            return jsonify({'error': 'Invalid refresh token'}), 401
        
        token_dto = TokenResponse(
            access_token=new_access_token,
            refresh_token=refresh_data.refresh_token,
            token_type="bearer",
            expires_in=current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', 60) * 60  # Convert minutes to seconds
        )
        return jsonify(token_dto.model_dump()), 200
    
    except ValidationError as e:
        logger.warning(f"Validation error during refresh: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during refresh: {str(e)}")
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logger.error(f"Unexpected error during refresh: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Log out a user."""
    try:
        auth_service = AuthService(db_session)
        user_id = get_jwt_identity()
        jti = get_jwt()['jti']
        
        auth_service.logout_user(user_id, jti)
        
        return jsonify({'message': 'Successfully logged out'}), 200
        
    except Exception as e:
        logger.error(f"Unexpected error during logout: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_bp.route('/password-reset/request', methods=['POST'])
def request_password_reset():
    """Request a password reset."""
    try:
        auth_service = AuthService(db_session)
        # Validate request
        request_data = request.get_json()
        if not request_data:
            return jsonify({'error': 'Invalid request'}), 400
        
        reset_data = PasswordResetRequest(**request_data)
        
        
        return jsonify({'message': 'If the email is registered, a password reset link will be sent'})
        
    except ValidationError as e:
        logger.warning(f"Validation error during password reset request: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during password reset request: {str(e)}")
        # Return the same message even if there's an error to prevent email enumeration
        return jsonify({'message': 'If the email is registered, a password reset link will be sent'})


@auth_bp.route('/password-reset/confirm', methods=['POST'])
def confirm_password_reset():
    """Confirm a password reset."""
    try:
        # Validate request
        request_data = request.get_json()
        if not request_data:
            return jsonify({'error': 'Invalid request'}), 400
        
        confirm_data = PasswordResetConfirmRequest(**request_data)
        
        return jsonify({'message': 'Password has been reset'})
        
    except ValidationError as e:
        logger.warning(f"Validation error during password reset confirmation: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except ValueError as e:
        logger.warning(f"Value error during password reset confirmation: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Unexpected error during password reset confirmation: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get the current authenticated user."""
    try:
        auth_service = AuthService(db_session)
        # Get current user
        user_id = get_jwt_identity()
        user = auth_service.user_repo.get_user_by_id(user_id)

        user_dto = UserResponse.model_validate(user)
        
        return jsonify(user_dto.model_dump()), 200
        
    except Exception as e:
        logger.error(f"Unexpected error getting current user: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred'}), 500
