"""
Base repository for all database operations.

Provides common CRUD operations for all models.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
import copy

from sqlalchemy import select, update, delete
from sqlalchemy.orm import Session

from database.db import session_scope
from database.models.base import BaseModel

# Type variable for model classes
T = TypeVar('T', bound=BaseModel)


class BaseRepository(Generic[T]):
    """Base repository for CRUD operations on models."""
    
    def __init__(self, model_class: Type[T]):
        """
        Initialize the repository with the model class.
        
        Args:
            model_class: The model class this repository will work with
        """
        self.model_class = model_class
    
    def create(self, obj_in: Dict[str, Any]) -> T:
        """
        Create a new object.
        
        Args:
            obj_in: Dictionary with object data
            
        Returns:
            The created object
        """
        with session_scope() as session:
            db_obj = self.model_class(**obj_in)
            session.add(db_obj)
            session.flush()
            
            # Create a copy of the object to prevent "detached instance" errors
            result = copy.deepcopy(db_obj.__dict__)
            # Remove SQLAlchemy internal attributes
            for key in list(result.keys()):
                if key.startswith('_'):
                    del result[key]
            
            # Create a fresh object with the data
            return self.model_class(**result)
    
    def get(self, id: Any) -> Optional[T]:
        """
        Get object by ID.
        
        Args:
            id: The ID to look up
            
        Returns:
            The object if found, None otherwise
        """
        with session_scope() as session:
            obj = session.get(self.model_class, id)
            if not obj:
                return None
            
            # Create a copy of the object to prevent "detached instance" errors
            result = copy.deepcopy(obj.__dict__)
            # Remove SQLAlchemy internal attributes
            for key in list(result.keys()):
                if key.startswith('_'):
                    del result[key]
            
            # Create a fresh object with the data
            return self.model_class(**result)
    
    def get_multi(self, skip: int = 0, limit: int = 100) -> List[T]:
        """
        Get multiple objects with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of objects
        """
        with session_scope() as session:
            objs = session.execute(
                select(self.model_class)
                .offset(skip)
                .limit(limit)
            ).scalars().all()
            
            results = []
            for obj in objs:
                # Create a copy of the object to prevent "detached instance" errors
                obj_dict = copy.deepcopy(obj.__dict__)
                # Remove SQLAlchemy internal attributes
                for key in list(obj_dict.keys()):
                    if key.startswith('_'):
                        del obj_dict[key]
                
                # Create a fresh object with the data
                results.append(self.model_class(**obj_dict))
            
            return results
    
    def update(self, db_obj: T, obj_in: Union[Dict[str, Any], T]) -> T:
        """
        Update an object.
        
        Args:
            db_obj: The database object to update
            obj_in: The new data as a dict or object
            
        Returns:
            The updated object
        """
        with session_scope() as session:
            # Convert obj_in to a dict if it's not already
            update_data = obj_in if isinstance(obj_in, dict) else obj_in.__dict__.copy()
            
            # Ensure we're not trying to update primary keys
            if 'id' in update_data:
                del update_data['id']
            
            # Remove SQLAlchemy-specific fields
            for key in list(update_data.keys()):
                if key.startswith('_'):
                    del update_data[key]
            
            # Fetch the object from the database to update
            obj = session.get(self.model_class, db_obj.id)
            if not obj:
                return None
                
            # Apply updates
            for field, value in update_data.items():
                if hasattr(obj, field):
                    setattr(obj, field, value)
            
            session.flush()
            
            # Create a copy of the object to prevent "detached instance" errors
            result = copy.deepcopy(obj.__dict__)
            # Remove SQLAlchemy internal attributes
            for key in list(result.keys()):
                if key.startswith('_'):
                    del result[key]
            
            # Create a fresh object with the data
            return self.model_class(**result)
    
    def delete(self, id: Any) -> bool:
        """
        Delete an object by ID.
        
        Args:
            id: The ID of the object to delete
            
        Returns:
            True if successful, False otherwise
        """
        with session_scope() as session:
            result = session.execute(
                delete(self.model_class)
                .where(self.model_class.id == id)
            )
            return result.rowcount > 0
    
    def find_by(self, **kwargs) -> List[T]:
        """
        Find objects by arbitrary filters.
        
        Args:
            **kwargs: Filter conditions as keyword arguments
            
        Returns:
            List of matching objects
        """
        with session_scope() as session:
            q = select(self.model_class)
            
            # Apply filters
            for key, value in kwargs.items():
                if hasattr(self.model_class, key):
                    q = q.where(getattr(self.model_class, key) == value)
            
            objs = session.execute(q).scalars().all()
            
            results = []
            for obj in objs:
                # Create a copy of the object to prevent "detached instance" errors
                obj_dict = copy.deepcopy(obj.__dict__)
                # Remove SQLAlchemy internal attributes
                for key in list(obj_dict.keys()):
                    if key.startswith('_'):
                        del obj_dict[key]
                
                # Create a fresh object with the data
                results.append(self.model_class(**obj_dict))
            
            return results 