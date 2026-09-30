from pydantic import BaseModel

class AirlineBase(BaseModel):
    name: str
    code: str
    active: bool = True

class AirlineCreate(AirlineBase):
    pass

class AirlineResponse(AirlineBase):
    id: int

    class Config:
        from_attributes = True
