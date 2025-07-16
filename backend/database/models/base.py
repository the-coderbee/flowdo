from datetime import UTC, datetime
from sqlalchemy import Integer, DateTime
from sqlalchemy.orm import mapped_column, Mapped

from database.db import Base


class BaseModel(Base):
    """Base model with common fields for all tables."""

    __abstract__ = (
        True  # This marks the class as abstract, so no table will be created for it
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now(UTC), onupdate=datetime.now(UTC)
    )
