from typing import List
from sqlalchemy import String, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped
from .base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(30), index=True)
    psw_hash: Mapped[str] = mapped_column(String(255))
    # pomodoro settings
    work_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    short_break_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    long_break_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    session_count: Mapped[int] = mapped_column(Integer, nullable=True)
    sessions_until_long_break: Mapped[int] = mapped_column(Integer, nullable=True)

    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user")
    groups: Mapped[List["Group"]] = relationship("Group", back_populates="user")
    pomodoro_sessions: Mapped[List["PomodoroSession"]] = relationship("PomodoroSession", back_populates="user")

    tokens: Mapped[List["UserToken"]] = relationship("UserToken", back_populates="user")
    
    def __repr__(self) -> str:
        return f"<User {self.email}>"
