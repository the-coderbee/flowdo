from sqlalchemy import String, Integer
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from .base import BaseModel
from .task import Task
from .tag import Tag

class TaskTag(BaseModel):
    __tablename__ = "task_tags"

    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id"))
    tag_id: Mapped[int] = mapped_column(Integer, ForeignKey("tags.id"))

    task: Mapped["Task"] = relationship("Task", back_populates="tags")
    tag: Mapped["Tag"] = relationship("Tag", back_populates="tasks")
