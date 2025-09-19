"""
Steganography API endpoints for Ghost Protocol
"""
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..models.user import User
from ..models.message import Message
from ..schemas.message import SteganographyResponse
from ..services.steganography import create_steganography_service
from ..api.auth import get_current_user

router = APIRouter()


def save_uploaded_file(file: UploadFile) -> str:
    """Save uploaded file and return filename"""
    # Create uploads directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1].lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())
    
    return unique_filename


@router.post("/encode", response_model=SteganographyResponse)
async def encode_message(
    message: str = Form(...),
    recipient_id: int = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Encode a message into an image using DCT steganography"""
    try:
        # Validate file
        if not image.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = os.path.splitext(image.filename)[1].lower()
        if file_extension not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
            )
        
        # Check file size
        image.file.seek(0, 2)  # Seek to end
        file_size = image.file.tell()
        image.file.seek(0)  # Reset to beginning
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE} bytes"
            )
        
        # Verify recipient exists
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            raise HTTPException(status_code=404, detail="Recipient not found")
        
        # Read image bytes
        image_bytes = await image.read()
        
        # Encode message using steganography
        stego_service = create_steganography_service()
        encoded_image_bytes = stego_service.encode_message(image_bytes, message)
        
        # Save encoded image
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        unique_filename = f"stego_{uuid.uuid4()}.jpg"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as f:
            f.write(encoded_image_bytes)
        
        # Save message to database
        db_message = Message(
            sender_id=current_user.id,
            recipient_id=recipient_id,
            content=message,  # Store original message for reference
            image_filename=unique_filename,
            is_steganographic=1
        )
        
        db.add(db_message)
        db.commit()
        
        return SteganographyResponse(
            success=True,
            message="Message encoded successfully",
            image_filename=unique_filename
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to encode message: {str(e)}")


@router.post("/decode", response_model=SteganographyResponse)
async def decode_message(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Decode a message from an image using DCT steganography"""
    try:
        # Validate file
        if not image.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        file_extension = os.path.splitext(image.filename)[1].lower()
        if file_extension not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
            )
        
        # Read image bytes
        image_bytes = await image.read()
        
        # Decode message using steganography
        stego_service = create_steganography_service()
        decoded_message = stego_service.decode_message(image_bytes)
        
        return SteganographyResponse(
            success=True,
            message=decoded_message if decoded_message else "No hidden message found"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to decode message: {str(e)}")


@router.get("/image/{filename}")
async def get_image(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Get steganographic image file"""
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path, media_type="image/jpeg")