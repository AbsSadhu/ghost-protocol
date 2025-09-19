from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
import os

class AuthService:
    def __init__(self):
        self.secret_key = os.getenv("SECRET_KEY", "ghost-protocol-secret-key-change-in-production")
        self.algorithm = "HS256"
        self.access_token_expire_minutes = 60 * 24  # 24 hours
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
        # In-memory user storage for demo (replace with database in production)
        self.users_db = {}
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    async def get_user(self, username: str) -> Optional[dict]:
        """Get user by username"""
        return self.users_db.get(username)
    
    async def authenticate_user(self, username: str, password: str) -> Optional[dict]:
        """Authenticate user with username and password"""
        user = await self.get_user(username)
        if not user:
            return None
        if not self.verify_password(password, user["hashed_password"]):
            return None
        return user
    
    async def create_user(self, username: str, password: str) -> dict:
        """Create a new user"""
        if username in self.users_db:
            raise ValueError("Username already exists")
        
        hashed_password = self.get_password_hash(password)
        user = {
            "username": username,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        self.users_db[username] = user
        return user
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return username"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            username: str = payload.get("sub")
            if username is None:
                return None
            return username
        except jwt.PyJWTError:
            return None