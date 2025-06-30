from pydantic import BaseModel


class GroupCreateRequest(BaseModel):
    name: str
    user_id: int


class GroupUpdateRequest(BaseModel):
    id: int
    name: str

class GroupResponse(BaseModel):
    id: int
    name: str
    user_id: int
