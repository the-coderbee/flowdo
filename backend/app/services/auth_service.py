from database.models.user import User
from typing import Any, Tuple, Optional, Dict
import bcrypt
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from logger import get_logger
from database.repositories.user_repository import UserRepository
from database.repositories.user_token_repository import UserTokenRepository

# Set up logging
logger = get_logger(__name__)


class AuthService:
    def __init__(self, session: Session):
        self.session = session
        self.user_repo = UserRepository(session)
        self.token_repo = UserTokenRepository(session)

    @property
    def access_token_expire_minutes(self) -> int:
        """Get access token expiration from app config with fallback."""
        try:
            from flask import current_app

            return current_app.config.get("ACCESS_TOKEN_EXPIRE_MINUTES", 30)
        except RuntimeError:
            return 30

    @property
    def refresh_token_expire_minutes(self) -> int:
        """Get refresh token expiration from app config with fallback."""
        try:
            from flask import current_app

            return current_app.config.get("REFRESH_TOKEN_EXPIRE_MINUTES", 60)
        except RuntimeError:
            return 60

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate an email address."""
        # TODO: add email validation
        # pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        # return re.match(pattern, email) is not None

        # for testing purposes, we will allow any email address
        return True

    @staticmethod
    def validate_password(password: str) -> Tuple[bool, str]:
        """Validate a password."""
        # TODO: add password validation

        # for testing purposes, we will allow any password
        return True, "Password is valid"

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password."""
        return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

    def verify_password(self, email: str, password: str) -> bool:
        """Verify user password."""
        user = self.user_repo.get_user_by_email(email)
        if not user:
            return False

        return bcrypt.checkpw(password.encode("utf-8"), user.psw_hash.encode("utf-8"))

    def register_user(
        self, email: str, password: str, display_name: str
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """Register a user."""
        # Business validation
        if not self.validate_email(email):
            return False, "Invalid email address", None

        is_valid_password, password_message = self.validate_password(password)
        if not is_valid_password:
            return False, password_message, None

        if len(display_name) < 2 or len(display_name) > 20:
            return False, "Display name must be between 2 and 20 characters", None

        # Check if user already exists
        existing_user = self.user_repo.get_user_by_email(email)
        if existing_user:
            return False, "User already exists", None

        # Create user object
        password_hash = self.hash_password(password)
        user = User(
            email=email.lower().strip(),
            display_name=display_name.strip(),
            psw_hash=password_hash,
            is_active=True,
        )

        created_user = self.user_repo.create_user(user)

        # Create tokens
        access_token = self.token_repo.create_access_token(
            created_user.id, self.access_token_expire_minutes
        )
        refresh_token = self.token_repo.create_refresh_token(
            created_user.id, self.refresh_token_expire_minutes
        )

        return (
            True,
            "User created successfully",
            {
                "user": created_user,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
        )

    def login_user(self, email: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
        """Login a user."""
        # TODO: add rate limiting

        # Get user
        user = self.user_repo.get_user_by_email(email)
        if not user:
            logger.warning(f"Login attempt with non-existent email: {email}")
            return False, "Invalid email or password", None

        # Verify password
        if not self.verify_password(email, password):
            logger.warning(f"Login failed for user: {email}")
            return False, "Invalid email or password", None

        # Cleanup existing tokens (single session approach)
        try:
            self.token_repo.revoke_all_tokens(user.id, "access")
            self.token_repo.revoke_all_tokens(user.id, "refresh")
        except Exception as e:
            logger.warning(f"Failed to revoke tokens for user: {email}: {str(e)}")

        # Create new tokens
        access_token = self.token_repo.create_access_token(
            user.id, self.access_token_expire_minutes
        )
        refresh_token = self.token_repo.create_refresh_token(
            user.id, self.refresh_token_expire_minutes
        )

        # Update last login
        user.last_login = datetime.now(UTC)
        self.user_repo.update_user(user)

        logger.info(f"User {email} logged in successfully")

        return (
            True,
            "Login successful",
            {
                "user": user,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
        )

    def logout_user(self, user_id: int) -> Tuple[bool, str]:
        """Logout user and revoke all tokens."""
        # Get user
        user = self.user_repo.get(user_id)
        if not user:
            logger.warning(f"User not found during logout: {user_id}")
            return False, "User not found"

        # Revoke all tokens
        self.token_repo.revoke_all_tokens(user_id, "access")
        self.token_repo.revoke_all_tokens(user_id, "refresh")
        logger.info(f"User {user_id} logged out successfully")
        return True, "Logout successful"

    def refresh_access_token(self, user_id: int, refresh_jti: str) -> Optional[str]:
        """Refresh access token using refresh token JTI."""
        # Check if refresh token is valid
        if self.token_repo.is_token_revoked(refresh_jti):
            logger.warning(f"Refresh token is revoked: {refresh_jti}")
            return None

        # Get user
        user = self.user_repo.get(user_id)
        if not user:
            logger.warning(f"User not found during token refresh: {user_id}")
            return None

        # Create new access token
        new_access_token = self.token_repo.create_access_token(
            user.id, self.access_token_expire_minutes
        )

        logger.info(f"Access token refreshed successfully for user: {user.id}")
        return new_access_token

    def verify_user_session(self, user_id: int) -> Tuple[bool, Optional[User]]:
        """Verify user session."""
        user = self.user_repo.get(user_id)
        if not user:
            logger.warning(f"User not found during session verification: {user_id}")
            return False, None

        if not user.is_active:
            logger.warning(f"Inactive user attempted session verification: {user_id}")
            return False, None

        return True, user

    def change_password(
        self, user_id: int, old_password: str, new_password: str
    ) -> Tuple[bool, str]:
        """Change user password."""
        user = self.user_repo.get(user_id)
        if not user:
            return False, "User not found"

        # Verify old password
        if not bcrypt.checkpw(
            old_password.encode("utf-8"), user.psw_hash.encode("utf-8")
        ):
            return False, "Current password is incorrect"

        # Validate new password
        is_valid, message = self.validate_password(new_password)
        if not is_valid:
            return False, message

        # Update password
        user.psw_hash = self.hash_password(new_password)
        self.user_repo.update_user(user)

        # Revoke all existing tokens to force re-login
        self.token_repo.revoke_all_tokens(user_id, "access")
        self.token_repo.revoke_all_tokens(user_id, "refresh")

        logger.info(f"Password changed successfully for user: {user_id}")
        return True, "Password changed successfully"

    def request_password_reset(self, email: str) -> Tuple[bool, str]: ...
