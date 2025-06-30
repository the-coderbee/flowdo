from typing import List
from .base_repository import BaseRepository

from sqlalchemy.orm import Session

from database.models.tag import Tag

import logging

logger = logging.getLogger(__name__)


class TagRepository(BaseRepository[Tag]):
    def __init__(self, db_session: Session):
        super().__init__()
        self.db = db_session

    def get_all_tags_for_user(self, user_id: int) -> List[Tag]:
        return self.db.query(Tag).filter(Tag.user_id == user_id).all()
    
    def create_tag(self, tag: Tag) -> Tag:
        try:
            self.db.add(tag)
            self.db.commit()
            self.db.refresh(tag)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating tag: {e}")
            raise e
        return tag
    
    def update_tag(self, tag: Tag) -> Tag:
        try:
            self.db.commit()
            self.db.refresh(tag)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating tag: {e}")
            raise e
        return tag
    
    def delete_tag(self, tag: Tag) -> None:
        try:
            self.db.delete(tag)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting tag: {e}")
            raise e