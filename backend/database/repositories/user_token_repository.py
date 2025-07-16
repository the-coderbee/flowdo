"""
Token repository for database operations on the UserToken model.
"""

from typing import Optional, List
from datetime import datetime, UTC, timedelta
from sqlalchemy.orm import Session
from flask_jwt_extended import (
    create_access_token as jwt_create_access_token,
    create_refresh_token as jwt_create_refresh_token,
    get_jti,
)

from database.repositories.base_repository import BaseRepository
from database.models.user_token import UserToken


class UserTokenRepository(BaseRepository[UserToken]):
    """Repository for UserToken model operations."""

    def __init__(self, session: Session):
        """Initialize the repository with the UserToken model."""
        super().__init__(UserToken, session)

    def create_access_token(self, user_id: int, expires_delta: int) -> str:
        """Create an access token."""
        # delete any existing token for user
        self.delete_token_by_user_id(user_id)
        token = jwt_create_access_token(
            identity=str(user_id), expires_delta=timedelta(minutes=expires_delta)
        )

        jti = get_jti(token)

        expires_at = datetime.now(UTC) + timedelta(minutes=expires_delta)

        new_user_token = UserToken(
            user_id=user_id, jti=jti, token_type="access", expires_at=expires_at
        )
        self.session.add(new_user_token)
        self.session.flush()
        self.session.refresh(new_user_token)

        return token

    def create_refresh_token(self, user_id: int, expires_delta: int) -> str:
        """Create a refresh token."""
        token = jwt_create_refresh_token(
            identity=str(user_id), expires_delta=timedelta(minutes=expires_delta)
        )

        jti = get_jti(token)

        expires_at = datetime.now(UTC) + timedelta(minutes=expires_delta)

        new_user_token = UserToken(
            user_id=user_id, jti=jti, token_type="refresh", expires_at=expires_at
        )
        self.session.add(new_user_token)
        self.session.flush()
        self.session.refresh(new_user_token)

        return token

    def revoke_token(self, token_value: str) -> bool:
        """Revoke a token by its JTI."""
        jti = get_jti(token_value)
        user_token = (
            self.session.query(UserToken).filter(UserToken.jti == jti).one_or_none()
        )
        if user_token:
            user_token.revoked = True
            self.session.flush()
            return True
        return False

    def revoke_all_tokens(self, user_id: int, token_type: str) -> int:
        """Revoke all tokens for a user. Returns count of revoked tokens."""
        user_tokens = (
            self.session.query(UserToken).filter(UserToken.user_id == user_id).all()
        )
        revoked_count = 0
        for user_token in user_tokens:
            if user_token.token_type == token_type:
                user_token.revoked = True
                revoked_count += 1
        self.session.flush()
        return revoked_count

    def is_token_revoked(self, jti: str) -> bool:
        """Check if a token is revoked."""
        user_token = (
            self.session.query(UserToken).filter(UserToken.jti == jti).one_or_none()
        )

        return bool(user_token and getattr(user_token, "revoked", False))

    def get_all_user_tokens(self, user_id: int) -> List[UserToken]:
        """Find all tokens for a user."""
        return self.session.query(UserToken).filter(UserToken.user_id == user_id).all()

    def get_refresh_token(self, token_value: str) -> Optional[UserToken]:
        """Get a refresh token by its value."""
        jti = get_jti(token_value)
        return (
            self.session.query(UserToken)
            .filter(UserToken.jti == jti, UserToken.token_type == "refresh")
            .one_or_none()
        )

    def get_access_token(self, token_value: str) -> Optional[UserToken]:
        """Get an access token by its value."""
        jti = get_jti(token_value)
        return (
            self.session.query(UserToken)
            .filter(UserToken.jti == jti, UserToken.token_type == "access")
            .one_or_none()
        )

    def get_user_token(self, token_value: str) -> Optional[UserToken]:
        """Get a token by its value."""
        jti = get_jti(token_value)
        return self.session.query(UserToken).filter(UserToken.jti == jti).one_or_none()

    def delete_token_by_user_id(self, user_id: int) -> None:
        """Delete a token by user ID."""
        self.session.query(UserToken).filter(UserToken.user_id == user_id).delete()
        self.session.flush()
