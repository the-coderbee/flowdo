from datetime import datetime, UTC
from typing import List
from .base_repository import BaseRepository

from sqlalchemy.orm import Session

from database.models.tag import Tag

from logger import get_logger

logger = get_logger(__name__)


class TagRepository(BaseRepository[Tag]):
    def __init__(self, session: Session):
        super().__init__(Tag, session)

    def create_tag(self, tag: Tag) -> Tag:
        self.session.add(tag)
        self.session.flush()
        self.session.refresh(tag)
        return tag

    def update_tag(self, tag: Tag) -> Tag:
        tag.updated_at = datetime.now(UTC)
        self.session.flush()
        self.session.refresh(tag)
        return tag

    def get_all_tags_for_user(self, user_id: int) -> List[Tag]:
        return self.session.query(Tag).filter(Tag.user_id == user_id).all()

    def delete_tag(self, tag: Tag) -> None:
        self.session.delete(tag)
