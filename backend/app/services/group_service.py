from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from database.repositories.group_repository import GroupRepository
from database.models.group import Group

from app.schemas.group import GroupCreateRequest, GroupUpdateRequest


class GroupService:
    def __init__(self, session: Session):
        self.group_repository = GroupRepository(session)

    def get_all_groups_for_user(self, user_id: int) -> Tuple[bool, str, List[Group]]:
        groups = self.group_repository.get_all_groups_for_user(user_id)
        return True, "Groups fetched successfully", groups

    def create_group(
        self, group_create_request: GroupCreateRequest
    ) -> Tuple[bool, str, Optional[Group]]:
        group_data = group_create_request.model_dump(exclude_unset=True)
        group_data["user_id"] = group_create_request.user_id
        group = Group(**group_data)
        created_group = self.group_repository.create_group(group)
        return True, "Group created successfully", created_group

    def update_group(
        self, group_update_request: GroupUpdateRequest
    ) -> Tuple[bool, str, Optional[Group]]:
        # First get the existing group
        existing_group = (
            self.group_repository.session.query(Group)
            .filter(Group.id == group_update_request.id)
            .first()
        )
        if not existing_group:
            return False, "Group not found", None

        # Update the fields
        group_data = group_update_request.model_dump(exclude_unset=True)
        for key, value in group_data.items():
            if key != "id":  # Don't update the ID
                setattr(existing_group, key, value)

        updated_group = self.group_repository.update_group(existing_group)
        return True, "Group updated successfully", updated_group

    def delete_group(self, group_id: int) -> Tuple[bool, str]:
        # First get the existing group
        existing_group = (
            self.group_repository.session.query(Group)
            .filter(Group.id == group_id)
            .first()
        )
        if not existing_group:
            return False, "Group not found"

        self.group_repository.delete_group(existing_group)
        return True, "Group deleted successfully"
