from typing import List, Tuple
from sqlalchemy.orm import Session

from database.repositories.group_repository import GroupRepository
from database.models.group import Group

from app.schemas.group import GroupCreateRequest, GroupUpdateRequest


class GroupService:
    def __init__(self, db_session: Session):
        self.group_repository = GroupRepository(db_session)

    def get_all_groups_for_user(self, user_id: int) -> Tuple[bool, str, List[Group]]:
        try:
            groups = self.group_repository.get_all_groups_for_user(user_id)
            return True, "Groups fetched successfully", groups
        except Exception as e:
            return False, f"Error fetching groups: {e}", []
        
    def create_group(self, group_create_request: GroupCreateRequest) -> Tuple[bool, str, Group]:
        try:
            group_data = group_create_request.model_dump(exclude_unset=True)
            group_data["user_id"] = group_create_request.user_id
            group = self.group_repository.create_group(group_data)
            return True, "Group created successfully", group
        except Exception as e:
            return False, f"Error creating group: {e}", None
        
    def update_group(self, group_update_request: GroupUpdateRequest) -> Tuple[bool, str, Group]:
        try:
            group_data = group_update_request.model_dump(exclude_unset=True)
            group_data["user_id"] = group_update_request.user_id
            group = self.group_repository.update_group(group_data)
            return True, "Group updated successfully", group
        except Exception as e:
            return False, f"Error updating group: {e}", None
        
    def delete_group(self, group_id: int) -> Tuple[bool, str]:
        try:
            self.group_repository.delete_group(group_id)
            return True, "Group deleted successfully"
        except Exception as e:
            return False, f"Error deleting group: {e}"