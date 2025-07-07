from sqlalchemy import String, Integer, Boolean, Index
from sqlalchemy.orm import mapped_column, relationship, Mapped
from sqlalchemy.sql.schema import ForeignKey
from .base import BaseModel
from .task import Task

class Subtask(BaseModel):
    __tablename__ = "subtasks"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)

    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    task_id: Mapped[int] = mapped_column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    
    task: Mapped["Task"] = relationship("Task", back_populates="subtasks")

    __table_args__ = (
        Index('ix_subtasks_task_id', 'task_id'),
        Index('ix_subtasks_task_position', 'task_id', 'position'),
    )

    def __repr__(self):
        return f"<Subtask(id={self.id}, title={self.title}, description={self.description}, is_completed={self.is_completed}, position={self.position})>"
