from typing import List
from .base_repository import BaseRepository

from sqlalchemy.orm import Session

from database.models.group import Group

from logger import get_logger

logger = get_logger(__name__)


class GroupRepository(BaseRepository[Group]):
    def __init__(self, db_session: Session):
        super().__init__(Group)
        self.db = db_session

    def get_all_groups_for_user(self, user_id: int) -> List[Group]:
        return self.db.query(Group).filter(Group.user_id == user_id).all()
    
    def create_group(self, group: Group) -> Group:
        try:
            self.db.add(group)
            self.db.commit()
            self.db.refresh(group)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error creating group: {e}")
            raise e
        return group
    
    def update_group(self, group: Group) -> Group:
        try:
            self.db.commit()
            self.db.refresh(group)
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error updating group: {e}")
            raise e
        return group
    
    def delete_group(self, group: Group) -> None:
        try:
            self.db.delete(group)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Error deleting group: {e}")
            raise e