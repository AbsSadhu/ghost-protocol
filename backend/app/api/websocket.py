"""
WebSocket handler for real-time messaging in Ghost Protocol
"""
import json
from typing import Dict, List
from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import decode_access_token
from ..models.user import User


class ConnectionManager:
    """Manages WebSocket connections for real-time messaging"""
    
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.user_connections: Dict[int, int] = {}  # user_id -> connection_id
    
    async def connect(self, websocket: WebSocket, user_id: int):
        """Accept WebSocket connection and store user mapping"""
        await websocket.accept()
        connection_id = id(websocket)
        self.active_connections[connection_id] = websocket
        self.user_connections[user_id] = connection_id
        
        # Notify user they're connected
        await self.send_personal_message({
            "type": "connection",
            "message": "Connected to Ghost Protocol",
            "user_id": user_id
        }, websocket)
    
    def disconnect(self, websocket: WebSocket, user_id: int):
        """Remove WebSocket connection"""
        connection_id = id(websocket)
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        if user_id in self.user_connections:
            del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except:
            # Connection might be closed
            pass
    
    async def send_message_to_user(self, message: dict, user_id: int):
        """Send message to specific user if they're connected"""
        if user_id in self.user_connections:
            connection_id = self.user_connections[user_id]
            if connection_id in self.active_connections:
                websocket = self.active_connections[connection_id]
                await self.send_personal_message(message, websocket)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected users"""
        for websocket in self.active_connections.values():
            await self.send_personal_message(message, websocket)


manager = ConnectionManager()


async def get_current_user_ws(token: str, db: Session):
    """Get current user from WebSocket token"""
    if not token:
        return None
    
    token_data = decode_access_token(token)
    if not token_data:
        return None
    
    username = token_data.get("sub")
    if not username:
        return None
    
    user = db.query(User).filter(User.username == username).first()
    return user


async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time messaging"""
    # Authenticate user
    current_user = await get_current_user_ws(token, db)
    if not current_user:
        await websocket.close(code=4001, reason="Authentication failed")
        return
    
    # Connect user
    await manager.connect(websocket, current_user.id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            message_type = message_data.get("type")
            
            if message_type == "chat_message":
                # Handle regular chat message
                recipient_id = message_data.get("recipient_id")
                content = message_data.get("content")
                
                if recipient_id and content:
                    # Send message to recipient if they're online
                    await manager.send_message_to_user({
                        "type": "new_message",
                        "sender_id": current_user.id,
                        "sender_username": current_user.username,
                        "recipient_id": recipient_id,
                        "content": content,
                        "is_steganographic": False,
                        "timestamp": message_data.get("timestamp")
                    }, recipient_id)
            
            elif message_type == "steganographic_message":
                # Handle steganographic message notification
                recipient_id = message_data.get("recipient_id")
                image_filename = message_data.get("image_filename")
                
                if recipient_id and image_filename:
                    # Notify recipient of new steganographic message
                    await manager.send_message_to_user({
                        "type": "new_steganographic_message",
                        "sender_id": current_user.id,
                        "sender_username": current_user.username,
                        "recipient_id": recipient_id,
                        "image_filename": image_filename,
                        "is_steganographic": True,
                        "timestamp": message_data.get("timestamp")
                    }, recipient_id)
            
            elif message_type == "typing":
                # Handle typing indicator
                recipient_id = message_data.get("recipient_id")
                is_typing = message_data.get("is_typing", False)
                
                if recipient_id is not None:
                    await manager.send_message_to_user({
                        "type": "typing",
                        "sender_id": current_user.id,
                        "sender_username": current_user.username,
                        "is_typing": is_typing
                    }, recipient_id)
            
            elif message_type == "ping":
                # Handle ping/keepalive
                await manager.send_personal_message({
                    "type": "pong",
                    "timestamp": message_data.get("timestamp")
                }, websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, current_user.id)
    except Exception as e:
        print(f"WebSocket error for user {current_user.id}: {str(e)}")
        manager.disconnect(websocket, current_user.id)