from pydantic import BaseModel


class GroupCreateRequest(BaseModel):
    name: str
    user_id: int


class GroupUpdateRequest(BaseModel):
    id: int
    name: str
    user_id: int

class GroupResponse(BaseModel):
    
    id: int
    name: str
    color: str | None
    user_id: int

    model_config = {
        "from_attributes": True,
    }