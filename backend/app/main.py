"""
Main FastAPI application for Ghost Protocol
"""
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from .core.config import settings
from .core.database import create_tables
from .api import auth, messages, steganography
from .api.websocket import websocket_endpoint

# Create uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Create database tables
create_tables()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["authentication"])
app.include_router(messages.router, prefix=f"{settings.API_V1_STR}/messages", tags=["messages"])
app.include_router(steganography.router, prefix=f"{settings.API_V1_STR}/steganography", tags=["steganography"])

# WebSocket endpoint
app.websocket("/ws/{token}")(websocket_endpoint)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Ghost Protocol",
        "description": "Steganographic messenger with DCT-based JPEG hiding",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Ghost Protocol Backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )