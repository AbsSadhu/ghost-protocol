from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    username: str
    email: Optional[str] = None
    is_active: bool = True
    created_at: datetime

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Message(BaseModel):
    id: Optional[str] = None
    user: str
    content: str
    room_id: str
    timestamp: datetime
    is_hidden: bool = False  # Whether message is steganographically hidden
    image_data: Optional[str] = None  # Base64 encoded image if hidden

class MessageCreate(BaseModel):
    content: str
    room_id: str
    is_hidden: bool = False
    image_data: Optional[str] = None

class ChatRoom(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_at: datetime
    members: List[str] = []

class SteganographyRequest(BaseModel):
    message: str
    image_data: str  # Base64 encoded image

class SteganographyResponse(BaseModel):
    success: bool
    image_data: Optional[str] = None  # Base64 encoded result image
    message: Optional[str] = None  # Extracted message
    error: Optional[str] = None

class WebSocketMessage(BaseModel):
    type: str  # "message", "join", "leave", "typing"
    user: str
    content: Optional[str] = None
    room_id: str
    timestamp: Optional[datetime] = None