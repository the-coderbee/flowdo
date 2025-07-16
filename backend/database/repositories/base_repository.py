"""
Base repository for all database operations.

Provides common CRUD operations for all models.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union

from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session

from database.models.base import BaseModel

# Type variable for model classes
T = TypeVar("T", bound=BaseModel)


class BaseRepository(Generic[T]):
    """Base repository for CRUD operations on models."""

    def __init__(self, model_class: Type[T], session: Session):
        """
        Initialize the repository with the model class and session.

        Args:
            model_class: The model class this repository will work with
            session: The database session to use for operations
        """
        self.model_class = model_class
        self.session = session

    def create(self, obj_in: Dict[str, Any]) -> T:
        """
        Create a new object.

        Args:
            obj_in: Dictionary with object data

        Returns:
            The created object
        """
        db_obj = self.model_class(**obj_in)
        self.session.add(db_obj)
        self.session.flush()
        self.session.refresh(db_obj)
        return db_obj

    def get(self, id: Any) -> Optional[T]:
        """
        Get object by ID.

        Args:
            id: The ID to look up

        Returns:
            The object if found, None otherwise
        """
        return self.session.get(self.model_class, id)

    def get_multi(self, skip: int = 0, limit: int = 100) -> List[T]:
        """
        Get multiple objects with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of objects
        """
        return list(
            self.session.execute(select(self.model_class).offset(skip).limit(limit))
            .scalars()
            .all()
        )

    def update(self, db_obj: T, obj_in: Union[Dict[str, Any], T]) -> T:
        """
        Update an object.

        Args:
            db_obj: The database object to update
            obj_in: The new data as a dict or object

        Returns:
            The updated object
        """
        # Convert obj_in to a dict if it's not already
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.__dict__.copy()
            # Remove SQLAlchemy-specific fields
            update_data = {
                k: v for k, v in update_data.items() if not k.startswith("_")
            }

        # Ensure we're not trying to update primary keys
        update_data.pop("id", None)

        # Apply updates
        for field, value in update_data.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self.session.flush()
        self.session.refresh(db_obj)
        return db_obj

    def update_by_id(self, id: Any, obj_in: Union[Dict[str, Any], T]) -> Optional[T]:
        """
        Update an object by ID.

        Args:
            id: The ID of the object to update
            obj_in: The new data as a dict or object

        Returns:
            The updated object if found, None otherwise
        """
        db_obj = self.get(id)
        if not db_obj:
            return None
        return self.update(db_obj, obj_in)

    def delete(self, id: Any) -> bool:
        """
        Delete an object by ID.

        Args:
            id: The ID of the object to delete

        Returns:
            True if successful, False otherwise
        """
        result = self.session.execute(
            delete(self.model_class).where(self.model_class.id == id)
        )
        return result.rowcount > 0

    def delete_obj(self, db_obj: T) -> bool:
        """
        Delete an object instance.

        Args:
            db_obj: The object to delete

        Returns:
            True if successful, False otherwise
        """
        try:
            self.session.delete(db_obj)
            self.session.flush()
            return True
        except Exception:
            return False

    def find_by(self, **kwargs) -> List[T]:
        """
        Find objects by arbitrary filters.

        Args:
            **kwargs: Filter conditions as keyword arguments

        Returns:
            List of matching objects
        """
        q = select(self.model_class)

        # Apply filters
        for key, value in kwargs.items():
            if hasattr(self.model_class, key):
                q = q.where(getattr(self.model_class, key) == value)

        return list(self.session.execute(q).scalars().all())

    def find_one_by(self, **kwargs) -> Optional[T]:
        """
        Find a single object by arbitrary filters.

        Args:
            **kwargs: Filter conditions as keyword arguments

        Returns:
            The first matching object or None
        """
        q = select(self.model_class)

        # Apply filters
        for key, value in kwargs.items():
            if hasattr(self.model_class, key):
                q = q.where(getattr(self.model_class, key) == value)

        return self.session.execute(q).scalars().first()

    def count(self, **kwargs) -> Optional[int]:
        """
        Count objects matching the given filters.

        Args:
            **kwargs: Filter conditions as keyword arguments

        Returns:
            Number of matching objects
        """
        from sqlalchemy import func

        q = select(func.count()).select_from(self.model_class)

        # Apply filters
        for key, value in kwargs.items():
            if hasattr(self.model_class, key):
                q = q.where(getattr(self.model_class, key) == value)

        return self.session.execute(q).scalar()

    def exists(self, **kwargs) -> bool:
        """
        Check if any objects exist matching the given filters.

        Args:
            **kwargs: Filter conditions as keyword arguments

        Returns:
            True if at least one matching object exists
        """
        return (self.count(**kwargs) or 0) > 0
