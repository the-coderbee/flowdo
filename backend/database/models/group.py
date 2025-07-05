from typing import List, Optional
from sqlalchemy import String, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from .base import BaseModel
from .user import User  # Import User for type hints


class Group(BaseModel):
    __tablename__ = "groups"

    # Base class already defines id
    name: Mapped[str] = mapped_column(String(255))
    color: Mapped[Optional[str]] = mapped_column(String(7), default="#3b82f6", nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="group")
    user: Mapped["User"] = relationship("User", back_populates="groups")
