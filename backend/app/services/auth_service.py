from database.models.user import User
from typing import Tuple, Optional, Dict
import bcrypt
from sqlalchemy.orm import Session

from database.repositories.user_repository import UserRepository
from database.repositories.user_token_repository import UserTokenRepository

class AuthService:

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
            
            return True, "User created successfully", {
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            return False, f"Failed to create user: {str(e)}", None
    
    def login_user(self, email: str, password: str) -> Tuple[bool, str, Optional[Dict]]:
        """Login a user."""
        try:
            user = self.user_repo.get_user_by_email(email)
            if not user:
                return False, "Invalid email or password", None
            
            if not bcrypt.checkpw(password.encode('utf-8'), user.psw_hash.encode('utf-8')):
                return False, "Invalid email or password", None
            
            self.token_repo.revoke_all_tokens(user.id, "access")
            self.token_repo.revoke_all_tokens(user.id, "refresh")

            access_token = self.token_repo.create_access_token(user.id, 30)
            refresh_token = self.token_repo.create_refresh_token(user.id, 60)
            
            return True, "Login successful", {
                'user': user,
                'access_token': access_token,
                'refresh_token': refresh_token
            }
        except Exception as e:
            return False, f"Login failed: {str(e)}", None

    def logout_user(self, user_id: int, token: str) -> Tuple[bool, str]:
        try:
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                return False, "User not found"
            
            if not self.token_repo.revoke_token(token):
                return False, "Failed to revoke token"
            
            return True, "Logout successful"
        except Exception as e:
            return False, f"Logout failed: {str(e)}"
    
    def refresh_token(self, refresh_token: str) -> str:
        """Refresh a token."""
        try:
            token = self.token_repo.get_user_token(refresh_token)
            if not token or not token.is_valid():
                return None
            
            user = self.user_repo.get_user_by_id(token.user_id)
            
            if not user:
                return None
            
            new_access_token = self.token_repo.create_access_token(user.id, AuthService.token_expire_minutes)
            
            return new_access_token
        except Exception as e:
            return None

    def refresh_access_token(self, user_id: int, refresh_jti: str) -> str:
        """Refresh access token using refresh token JTI."""
        try:
            # Check if refresh token is valid
            if self.token_repo.is_token_revoked(refresh_jti):
                return None
            
            user = self.user_repo.get_user_by_id(user_id)
            if not user:
                return None
            
            # Create new access token
            new_access_token = self.token_repo.create_access_token(user.id, AuthService.token_expire_minutes)
            
            return new_access_token
        except Exception as e:
            return None
        
    def verify_access_token(self, token: str) -> Tuple[bool, str, Optional[User]]:
        """Verify an access token."""
        try:
            token = self.token_repo.get_access_token(token)
            if not token or not token.is_valid():
                return False, "Invalid access token", None
            
            return True, "Access token is valid", None
        except Exception as e:
            return False, f"Access token verification failed: {str(e)}", None
