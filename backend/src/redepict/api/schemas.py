from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class SubmissionResponse(BaseModel):
    id: int
    filename: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class DrawingResponse(BaseModel):
    id: int
    user_id: int
    bucket: str
    object_key: str
    image_url: Optional[str]
    original_name: str
    mime_type: str
    size_bytes: int
    technique: Optional[str]
    level: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True