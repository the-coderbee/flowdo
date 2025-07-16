from pydantic import BaseModel


class TagCreateRequest(BaseModel):
    name: str
    color: str
    user_id: int


class TagUpdateRequest(BaseModel):
    id: int
    name: str
    color: str
    user_id: int


class TagResponse(BaseModel):

    id: int
    name: str
    color: str
    user_id: int

    model_config = {
        "from_attributes": True,
    }
