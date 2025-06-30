from typing import List, Tuple
from sqlalchemy.orm import Session

from database.repositories.tag_repository import TagRepository
from database.models.tag import Tag

from app.schemas.tag import TagCreateRequest, TagUpdateRequest


class TagService:
    def __init__(self, db_session: Session):
        self.tag_repository = TagRepository(db_session)

    def get_all_tags_for_user(self, user_id: int) -> Tuple[bool, str, List[Tag]]:
        try:
            tags = self.tag_repository.get_all_tags_for_user(user_id)
            return True, "Tags fetched successfully", tags
        except Exception as e:
            return False, f"Error fetching tags: {e}", []
        
    def create_tag(self, tag_create_request: TagCreateRequest) -> Tuple[bool, str, Tag]:
        try:
            tag_data = tag_create_request.model_dump(exclude_unset=True)
            tag_data["user_id"] = tag_create_request.user_id
            tag = self.tag_repository.create_tag(tag_data)
            return True, "Tag created successfully", tag
        except Exception as e:
            return False, f"Error creating tag: {e}", None
        
    def update_tag(self, tag_update_request: TagUpdateRequest) -> Tuple[bool, str, Tag]:
        try:
            tag_data = tag_update_request.model_dump(exclude_unset=True)
            tag_data["user_id"] = tag_update_request.user_id
            tag = self.tag_repository.update_tag(tag_data)
            return True, "Tag updated successfully", tag
        except Exception as e:
            return False, f"Error updating tag: {e}", None
    
    def delete_tag(self, tag_id: int) -> Tuple[bool, str]:
        try:
            self.tag_repository.delete_tag(tag_id)
            return True, "Tag deleted successfully"
        except Exception as e:
            return False, f"Error deleting tag: {e}"
