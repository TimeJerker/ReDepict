"""CRUD-операции для ReDepict."""
from typing import Any, Sequence

import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.redepict.models import models

# ---------- Хэширование паролей ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))

# ---------- Пользователи ----------
def create_user(db: Session, username: str, email: str, password: str, role: str = "user") -> models.User:
    user = models.User(
        username=username, email=email,
        password_hash=hash_password(password), role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str) -> models.User | None:
    stmt = select(models.User).where(email == models.User.email)
    return db.scalar(stmt)

def login_user(db: Session, email: str, password: str) -> models.User:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise ValueError("Неверный email или пароль")
    return user

# ---------- Рисунки (Drawings) ----------
def create_drawing(db: Session, user_id: int, object_key: str, original_name: str,
                   mime_type: str, size_bytes: int, technique: str = None, level: str = None) -> models.Drawing:
    drawing = models.Drawing(
        user_id=user_id, object_key=object_key, original_name=original_name,
        mime_type=mime_type, size_bytes=size_bytes, technique=technique, level=level
    )
    db.add(drawing)
    db.commit()
    db.refresh(drawing)
    return drawing

def get_user_drawings(db: Session, user_id: int, limit: int = 20) -> Sequence[models.Drawing] | None:
    stmt = select(models.Drawing).where(
        user_id == models.Drawing.user_id).order_by(models.Drawing.created_at.desc()).limit(limit)
    return db.scalars(stmt).all()

def update_drawing_status(db: Session, drawing_id: int, status: str, result_object_key: str = None) -> models.Drawing | None:
    drawing = db.get(models.Drawing, drawing_id)
    if drawing:
        drawing.status = status
        if result_object_key:
            drawing.result_object_key = result_object_key
        db.commit()
        db.refresh(drawing)
    return drawing

def delete_drawing(db: Session, drawing_id: int) -> bool:
    drawing = db.get(models.Drawing, drawing_id)
    if not drawing:
        return False
    db.delete(drawing)
    file_obj = db.get(models.MinioObject, (drawing.bucket, drawing.object_key))
    if file_obj:
        db.delete(file_obj)
    db.commit()
    return True


# ---------- Анализы (Analyses) ----------
def create_analysis(db: Session, drawing_id: int, model_name: str, score: int, summary: str, details: dict) -> models.Analysis:
    analysis = models.Analysis(
        drawing_id=drawing_id, model=model_name, score=score, summary=summary, details=details
    )
    db.add(analysis)
    # Обновляем статус рисунка на "analyzed"
    drawing = db.get(models.Drawing, drawing_id)
    if drawing:
        drawing.status = "analyzed"
    db.commit()
    db.refresh(analysis)
    return analysis

def get_drawing_analysis(db: Session, drawing_id: int) -> models.Analysis | None:
    stmt = select(models.Analysis).where(drawing_id == models.Analysis.drawing_id)
    return db.scalar(stmt)

# ---------- Чат (ChatMessages) ----------
def add_chat_message(db: Session, drawing_id: int, user_id: int, role: str, content: str) -> models.ChatMessage:
    msg = models.ChatMessage(
        drawing_id=drawing_id, user_id=user_id, role=role, content=content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_drawing_chat(db: Session, drawing_id: int) -> Sequence[models.ChatMessage] | None:
    stmt = select(models.ChatMessage).where(
        drawing_id == models.ChatMessage.drawing_id).order_by(models.ChatMessage.created_at.asc())
    return db.scalars(stmt).all()

# ---------- ФАЙЛЫ (MinioObject) ----------
def save_file_to_db(db: Session, bucket: str, object_key: str, content: bytes) -> models.MinioObject:
    file_obj = db.get(models.MinioObject, (bucket, object_key))
    if file_obj:
        file_obj.content = content
    else:
        file_obj = models.MinioObject(bucket=bucket, object_key=object_key, content=content)
        db.add(file_obj)
    db.commit(); db.refresh(file_obj)
    return file_obj

def get_file_from_db(db: Session, bucket: str, object_key: str) -> models.MinioObject | None:
    return db.get(models.MinioObject, (bucket, object_key))

def delete_file_from_db(db: Session, bucket: str, object_key: str) -> bool:
    file_obj = db.get(models.MinioObject, (bucket, object_key))
    if not file_obj:
        return False
    db.delete(file_obj); db.commit()
    return True