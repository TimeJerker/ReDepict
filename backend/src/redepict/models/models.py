"""ORM-модели ReDepict."""
from sqlalchemy import (
    BigInteger, CheckConstraint, Column, DateTime, ForeignKey,
    Index, Integer, SmallInteger, String, Text, func, LargeBinary, ForeignKeyConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from src.redepict.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    username = Column(String(50), nullable=False, unique=True)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user", server_default="user")
    skill_level = Column(String(50), nullable=True)
    drawing_tools = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    drawings = relationship("Drawing", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'admin')", name="ck_users_role"),
    )


class Drawing(Base):
    __tablename__ = "drawings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    bucket = Column(String(50), nullable=False, default="redepict-drawings")
    object_key = Column(String(255), nullable=False, unique=True)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(50), nullable=False)
    size_bytes = Column(BigInteger, nullable=False)
    technique = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)
    result_object_key = Column(String(255), nullable=True)
    status = Column(String(20), nullable=False, default="uploaded", server_default="uploaded")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="drawings")
    analysis = relationship("Analysis", back_populates="drawing", uselist=False, cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="drawing", cascade="all, delete-orphan")

    file = relationship("MinioObject", back_populates="drawing", uselist=False)

    __table_args__ = (
        CheckConstraint("status IN ('uploaded', 'analyzing', 'analyzed', 'failed')", name="ck_drawings_status"),
        ForeignKeyConstraint(
            ["bucket", "object_key"],
            ["minio_object.bucket", "minio_object.object_key"],
            name="fk_drawings_minio_object",
            ondelete="CASCADE"
        ),
    )


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    drawing_id = Column(BigInteger, ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, unique=True)
    model = Column(String(50), nullable=False)
    score = Column(SmallInteger, nullable=False)
    summary = Column(Text, nullable=False)
    details = Column(JSONB, nullable=True)  # Используем JSONB для PostgreSQL
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    drawing = relationship("Drawing", back_populates="analysis")

    __table_args__ = (
        CheckConstraint("score >= 1 AND score <= 10", name="ck_analyses_score"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    drawing_id = Column(BigInteger, ForeignKey("drawings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    drawing = relationship("Drawing", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")

    __table_args__ = (
        CheckConstraint("role IN ('user', 'assistant')", name="ck_chat_role"),
    )


class MinioObject(Base):
    """
    Схема для хранения файлов.
    В БД храним бинарные данные как LargeBinary.
    """
    __tablename__ = "minio_object"

    bucket = Column(String(50), primary_key=True)
    object_key = Column(String(255), primary_key=True)
    content = Column(LargeBinary, nullable=True)

    drawing = relationship("Drawing", back_populates="file", uselist=False)