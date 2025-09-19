from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict
import json
import asyncio
from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
import uvicorn

from models import User, Message, ChatRoom
from steganography import SteganographyService
from database import get_db, SessionLocal
from auth import AuthService

app = FastAPI(title="Ghost Protocol API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
auth_service = AuthService()
stego_service = SteganographyService()
security = HTTPBearer()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_room(self, message: str, room_id: str):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_text(message)
                except:
                    # Connection is broken, remove it
                    self.active_connections[room_id].remove(connection)

manager = ConnectionManager()

# Authentication dependency
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, auth_service.secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Routes
@app.post("/auth/register")
async def register(user_data: dict):
    try:
        user = await auth_service.create_user(user_data["username"], user_data["password"])
        return {"message": "User created successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login")
async def login(user_data: dict):
    user = await auth_service.authenticate_user(user_data["username"], user_data["password"])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = auth_service.create_access_token(data={"sub": user_data["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/steganography/hide")
async def hide_message(
    image_file: bytes,
    message: str,
    current_user: str = Depends(get_current_user)
):
    try:
        result_image = stego_service.hide_message(image_file, message)
        return {"success": True, "image": result_image}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/steganography/extract")
async def extract_message(
    image_file: bytes,
    current_user: str = Depends(get_current_user)
):
    try:
        message = stego_service.extract_message(image_file)
        return {"success": True, "message": message}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/rooms")
async def get_rooms(current_user: str = Depends(get_current_user)):
    # Return available chat rooms
    return {"rooms": ["general", "secure", "anonymous"]}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast message to room
            broadcast_message = {
                "type": "message",
                "user": message_data.get("user", "anonymous"),
                "message": message_data.get("message", ""),
                "timestamp": datetime.now().isoformat(),
                "room": room_id
            }
            
            await manager.broadcast_to_room(
                json.dumps(broadcast_message), 
                room_id
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)

@app.get("/")
async def root():
    return {"message": "Ghost Protocol API - Steganographic Messenger"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)