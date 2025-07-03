from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Boolean
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql.schema import ForeignKey
from sqlalchemy.orm import relationship

from database.models.user import User
from .base import BaseModel


class UserToken(BaseModel):
    __tablename__ = "user_tokens"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    jti: Mapped[str] = mapped_column(String(36), unique=True, index=True)
    
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    token_type: Mapped[str] = mapped_column(String(50), default="refresh")
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="tokens")

    def __repr__(self) -> str:
        return f"<UserToken {self.id}>"
    
    @property
    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        return not self.is_expired and not self.revoked
    