

from pydantic import BaseModel


class TagCreateRequest(BaseModel):
    name: str
    user_id: int


class TagUpdateRequest(BaseModel):
    id: int
    name: str
    user_id: int

class TagResponse(BaseModel):
    id: int
    name: str
    user_id: int
