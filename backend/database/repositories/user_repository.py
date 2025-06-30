"""
User repository for database operations on the User model.
"""
from typing import List, Optional, Tuple
import bcrypt

from sqlalchemy.orm import Session

from database.repositories.base_repository import BaseRepository
from database.models.user import User


class UserRepository(BaseRepository[User]):
    """Repository for User model operations."""
    
    def __init__(self, db_session: Session):
        """Initialize the repository with the User model."""
        super().__init__(User)
        self.db_session = db_session
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return self.db_session.query(User).filter(User.email == email).first()
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        return self.db_session.query(User).filter(User.id == user_id).first()

    def create_user(self, email: str, display_name: str, password_hash: str) -> Tuple[bool, User]:
        """Create a new user."""
        try:
            user = User(email=email, display_name=display_name, psw_hash=password_hash)
            self.db_session.add(user)
            self.db_session.commit()
            self.db_session.refresh(user)
            return True, user
        except Exception as e:
            self.db_session.rollback()
            print(f"Failed to create user: {str(e)}")
            return False, None

    def verify_password(self, email: str, password: str) -> bool:
        """Verify a password."""
        user = self.get_user_by_email(email)
        if not user:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8'))
