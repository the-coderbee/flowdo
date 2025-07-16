"""
User repository for database operations on the User model.
"""

from datetime import UTC, datetime
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from database.repositories.base_repository import BaseRepository
from database.models.user import User


class UserRepository(BaseRepository[User]):
    """Repository for User model operations."""

    def __init__(self, session: Session):
        """Initialize the repository with the User model."""
        super().__init__(User, session)

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        return self.session.query(User).filter(User.email == email).first()

    def create_user(self, user: User) -> User:
        """Create a new user."""
        self.session.add(user)
        self.session.flush()
        self.session.refresh(user)
        return user

    def update_user(self, user: User) -> User:
        """Update an existing user."""
        user.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(user)
        return user

    def activate_user(self, user: User) -> User:
        """Activate a user."""
        user.is_active = True
        self.update_user(user)
        return user

    def deactivate_user(self, user: User) -> User:
        """Deactivate a user."""
        user.is_active = False
        self.update_user(user)
        return user
