from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, HttpUrl


class EndpointCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    url: str = Field(..., min_length=1, max_length=2048)


class EndpointUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[str] = Field(None, min_length=1, max_length=2048)


class EndpointResponse(BaseModel):
    id: str
    name: str
    url: str
    status: str
    uptime: float
    lastChecked: Optional[str] = None
    latency: float

    class Config:
        from_attributes = True


class EndpointStatusResponse(BaseModel):
    id: str
    name: str
    url: str
    status: str
    uptime: float
    latency: float

    class Config:
        from_attributes = True
