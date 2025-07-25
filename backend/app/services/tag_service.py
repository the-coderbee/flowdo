from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from database.repositories.tag_repository import TagRepository
from database.models.tag import Tag

from app.schemas.tag import TagCreateRequest, TagUpdateRequest


class TagService:
    def __init__(self, session: Session):
        self.tag_repository = TagRepository(session)

    def get_all_tags_for_user(self, user_id: int) -> Tuple[bool, str, List[Tag]]:
        tags = self.tag_repository.get_all_tags_for_user(user_id)
        return True, "Tags fetched successfully", tags

    def create_tag(self, tag_create_request: TagCreateRequest) -> Tuple[bool, str, Tag]:
        tag_data = tag_create_request.model_dump(exclude_unset=True)
        tag_data["user_id"] = tag_create_request.user_id
        tag = Tag(**tag_data)
        created_tag = self.tag_repository.create_tag(tag)
        return True, "Tag created successfully", created_tag

    def update_tag(
        self, tag_update_request: TagUpdateRequest
    ) -> Tuple[bool, str, Optional[Tag]]:
        # First get the existing tag
        existing_tag = (
            self.tag_repository.session.query(Tag)
            .filter(Tag.id == tag_update_request.id)
            .first()
        )
        if not existing_tag:
            return False, "Tag not found", None

        # Update the fields
        tag_data = tag_update_request.model_dump(exclude_unset=True)
        for key, value in tag_data.items():
            if key != "id":  # Don't update the ID
                setattr(existing_tag, key, value)

        updated_tag = self.tag_repository.update_tag(existing_tag)
        return True, "Tag updated successfully", updated_tag

    def delete_tag(self, tag_id: int) -> Tuple[bool, str]:
        # First get the existing tag
        existing_tag = (
            self.tag_repository.session.query(Tag).filter(Tag.id == tag_id).first()
        )
        if not existing_tag:
            return False, "Tag not found"

        self.tag_repository.delete_tag(existing_tag)
        return True, "Tag deleted successfully"
