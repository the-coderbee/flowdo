from typing import List
from sqlalchemy import String, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from .base import BaseModel


class Tag(BaseModel):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(255))
    color: Mapped[str] = mapped_column(String(7), default="#3b82f6")  # Hex color code
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))

    tasks: Mapped[List["TaskTag"]] = relationship("TaskTag", back_populates="tag")