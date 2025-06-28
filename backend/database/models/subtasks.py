from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from .base import BaseModel
from .tasks import Task

class Subtask(BaseModel):
    __tablename__ = "subtasks"

    title: Mapped[str] = mapped_column(String(255))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"))
    
    task: Mapped["Task"] = relationship("Task", back_populates="subtasks")
