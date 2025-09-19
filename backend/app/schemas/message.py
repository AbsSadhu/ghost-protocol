"""
Message schemas for Ghost Protocol
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageBase(BaseModel):
    content: Optional[str] = None
    recipient_id: int
    is_steganographic: bool = False


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    id: int
    sender_id: int
    image_filename: Optional[str] = None
    created_at: datetime
    sender_username: Optional[str] = None
    recipient_username: Optional[str] = None
    
    class Config:
        from_attributes = True


class SteganographyRequest(BaseModel):
    message: str
    recipient_id: int


class SteganographyResponse(BaseModel):
    success: bool
    message: str
    image_filename: Optional[str] = None