from datetime import datetime, UTC
from typing import List
from .base_repository import BaseRepository

from sqlalchemy.orm import Session

from database.models.group import Group

from logger import get_logger

logger = get_logger(__name__)


class GroupRepository(BaseRepository[Group]):
    def __init__(self, session: Session):
        super().__init__(Group, session)

    def get_all_groups_for_user(self, user_id: int) -> List[Group]:
        return self.session.query(Group).filter(Group.user_id == user_id).all()

    def create_group(self, group: Group) -> Group:
        self.session.add(group)
        self.session.flush()
        self.session.refresh(group)
        return group

    def update_group(self, group: Group) -> Group:
        group.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(group)
        return group

    def delete_group(self, group: Group) -> None:
        self.session.delete(group)
