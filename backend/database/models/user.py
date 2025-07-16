from typing import List
from sqlalchemy import Boolean, String, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped

from .base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    display_name: Mapped[str] = mapped_column(String(30), index=True)
    psw_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # pomodoro settings
    work_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    short_break_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    long_break_duration: Mapped[int] = mapped_column(Integer, nullable=True)
    sessions_until_long_break: Mapped[int] = mapped_column(Integer, nullable=True)

    # focus preferences
    default_focu_mode: Mapped[str] = mapped_column(String(30), default="deep_work")
    auto_start_breaks: Mapped[bool] = mapped_column(Boolean, default=True)
    distraction_blocking_enabled: Mapped[bool] = mapped_column(Boolean, default=False)

    # daily goals
    daily_pomodoro_goal: Mapped[int] = mapped_column(Integer, default=0)
    daily_focus_time_goal: Mapped[int] = mapped_column(Integer, default=0)

    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user")  # type: ignore
    groups: Mapped[List["Group"]] = relationship("Group", back_populates="user")  # type: ignore
    pomodoro_sessions: Mapped[List["PomodoroSession"]] = relationship(  # type: ignore
        "PomodoroSession", back_populates="user"
    )
    pomodoro_stats: Mapped[List["PomodoroStats"]] = relationship(  # type: ignore
        "PomodoroStats", back_populates="user"
    )
    focus_sessions: Mapped[List["FocusSession"]] = relationship(  # type: ignore
        "FocusSession", back_populates="user"
    )

    tokens: Mapped[List["UserToken"]] = relationship("UserToken", back_populates="user")  # type: ignore

    def __repr__(self) -> str:
        return f"<User {self.email}>"
