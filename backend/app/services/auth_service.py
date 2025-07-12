from database.models.user import User
from typing import Tuple, Optional, Dict
import bcrypt
from sqlalchemy.orm import Session
from logger import get_logger
from database.repositories.user_repository import UserRepository
from database.repositories.user_token_repository import UserTokenRepository
# Set up logging
logger = get_logger(__name__)


class AuthService:
    # Class constants
    access_token_expire_minutes = 30
    refresh_token_expire_minutes = 60

    def __init__(self, db_session: Session):
        self.db = db_session
        self.user_repo = UserRepository(self.db)
        self.token_repo = UserTokenRepository(self.db)

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
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    

    def register_user(self, email: str, password: str, display_name: str) -> Tuple[bool, str, Optional[Dict]]:
        """Register a user."""
        try:
            if not self.validate_email(email):
                return False, "Invalid email address", None
            
            is_valid_password, password_message = self.validate_password(password)
            
            if not is_valid_password:
                return False, password_message, None
            
            if (len(display_name) < 2 or len(display_name) > 20):
                return False, "Display name must be between 2 and 20 characters", None
            
            existing_user = self.user_repo.get_user_by_email(email)
            if existing_user:
                return False, "User already exists", None
            
            password_hash = self.hash_password(password)
            user_created, user = self.user_repo.create_user(email, display_name, password_hash)
            if not user_created:
                return False, "Failed to create user", None
            
            access_token = self.token_repo.create_access_token(user.id, 30)
            refresh_token = self.token_repo.create_refresh_token(user.id, 60)
            
            # Explicitly commit the transaction
            self.db.commit()
            
            return True, "User created successfully", {
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            # Ensure rollback on error
            self.db.rollback()
            return False, f"Failed to create user: {str(e)}", None
    
    def login_user(self, email: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
        """Login a user."""
        try:
            # TODO: add rate limiting
            user = self.user_repo.get_user_by_email(email)
            if not user:
                logger.warning(f"Login attempt with non-existent email: {email}")
                return False, "Invalid email or password", None
            
            # verifying password
            if not bcrypt.checkpw(password.encode('utf-8'), user.psw_hash.encode('utf-8')):
                logger.warning(f"Login failed for user: {email}")
                return False, "Invalid email or password", None
            
            # cleanup existing tokens (single session)
            try:
                self.token_repo.revoke_all_tokens(user.id, "access")
                self.token_repo.revoke_all_tokens(user.id, "refresh")
            except Exception as e:
                logger.warning(f"Failed to revoke tokens for user: {email}: {str(e)}")
            
            # create new tokens
            access_token = self.token_repo.create_access_token(user.id, 30)
            refresh_token = self.token_repo.create_refresh_token(user.id, 60)
            
            # Explicitly commit the transaction
            self.db.commit()
            
            logger.info(f"User {email} logged in successfully")

            return True, "Login successful", {
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            # Ensure rollback on error
            self.db.rollback()
            logger.error(f"Login failed for user: {email}: {str(e)}")
            return False, f"Login failed: {str(e)}", None

    def logout_user(self, user_id: int, token_jti: str) -> Tuple[bool, str]:
        """Logout user and revoke all tokens."""
        try:
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                logger.warning(f"User not found during logout: {user_id}")
                return False, "User not found"
            
            # revoke all tokens
            revoked_access = self.token_repo.revoke_all_tokens(user_id, "access")
            revoked_refresh = self.token_repo.revoke_all_tokens(user_id, "refresh")

            # Explicitly commit the transaction
            self.db.commit()

            logger.info(f"User {user_id} logged out successfully (revoked {revoked_access} access, and {revoked_refresh} refresh tokens)")
            return True, "Logout successful"
        
        except Exception as e:
            # Ensure rollback on error
            self.db.rollback()
            logger.error(f"Logout failed for user: {user_id}: {str(e)}")
            return False, f"Logout failed: {str(e)}"

    def refresh_access_token(self, user_id: int, refresh_jti: str) -> Optional[str]:
        """Refresh access token using refresh token JTI."""
        try:
            # Check if refresh token is valid
            if self.token_repo.is_token_revoked(refresh_jti):
                logger.warning(f"Refresh token is revoked: {refresh_jti}")
                return None
            
            # get user
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                logger.warning(f"User not found during token refresh: {user_id}")
                return None
            
            # Create new access token
            new_access_token = self.token_repo.create_access_token(user.id, AuthService.access_token_expire_minutes)
            
            # Explicitly commit the transaction
            self.db.commit()
            
            logger.info(f"Access token refreshed successfully for user: {user.id}")
            
            return new_access_token
        except Exception as e:
            # Ensure rollback on error
            self.db.rollback()
            logger.error(f"Failed to refresh access token for user: {user_id}: {str(e)}")
            return None
        
    def verify_user_session(self, user_id: int) -> Tuple[bool, Optional[User]]:
        """Verify user session."""
        try:
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                logger.warning(f"User not found during session verification: {user_id}")
                return False, None

            return True, user

        except Exception as e:
            logger.error(f"Failed to verify user session for user: {user_id}: {str(e)}")
            return False, None
