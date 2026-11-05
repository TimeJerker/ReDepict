from pydantic import BaseModel, EmailStr, Field, ConfigDict
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
    user_id: int
    filename: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class GeminiAnalysisResult(BaseModel):
    score: int = Field(
        ...,
        ge=1,
        le=10,
        description="Итоговая оценка рисунка по шкале от 1 до 10",
    )

    detailed_analysis: str = Field(
        ...,
        description=(
            "Полный, красивый, развернутый и дружелюбный разбор рисунка для пользователя. "
            "Используй Markdown-разметку: выдели разделы (Сюжет, Цвета и атмосфера, "
            "Что получилось круто, Совет для роста)."
        ),
    )

class AnalysisResponse(BaseModel):
    id: int
    drawing_id: int
    model: str
    score: int
    summary: str
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
