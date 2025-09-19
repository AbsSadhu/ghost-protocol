"""
Messages API endpoints for Ghost Protocol
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from ..core.database import get_db
from ..models.user import User
from ..models.message import Message
from ..schemas.message import MessageCreate, MessageResponse
from ..api.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=MessageResponse)
async def create_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new message"""
    # Verify recipient exists
    recipient = db.query(User).filter(User.id == message_data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Create message
    db_message = Message(
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id,
        content=message_data.content,
        is_steganographic=1 if message_data.is_steganographic else 0
    )
    
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Add sender and recipient usernames for response
    response_message = MessageResponse.from_orm(db_message)
    response_message.sender_username = current_user.username
    response_message.recipient_username = recipient.username
    
    return response_message


@router.get("/", response_model=list[MessageResponse])
async def get_messages(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all messages for current user (sent or received)"""
    messages = db.query(Message).filter(
        or_(
            Message.sender_id == current_user.id,
            Message.recipient_id == current_user.id
        )
    ).order_by(Message.created_at.desc()).all()
    
    # Add usernames to responses
    response_messages = []
    for message in messages:
        sender = db.query(User).filter(User.id == message.sender_id).first()
        recipient = db.query(User).filter(User.id == message.recipient_id).first()
        
        response_message = MessageResponse.from_orm(message)
        response_message.sender_username = sender.username if sender else None
        response_message.recipient_username = recipient.username if recipient else None
        
        response_messages.append(response_message)
    
    return response_messages


@router.get("/conversation/{user_id}", response_model=list[MessageResponse])
async def get_conversation(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation between current user and specified user"""
    # Verify other user exists
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get messages between the two users
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
            and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
        )
    ).order_by(Message.created_at.asc()).all()
    
    # Add usernames to responses
    response_messages = []
    for message in messages:
        response_message = MessageResponse.from_orm(message)
        response_message.sender_username = current_user.username if message.sender_id == current_user.id else other_user.username
        response_message.recipient_username = other_user.username if message.sender_id == current_user.id else current_user.username
        
        response_messages.append(response_message)
    
    return response_messages