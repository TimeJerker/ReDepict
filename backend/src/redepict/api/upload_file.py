import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import DrawingResponse
from .file_path import save_upload_file
from src.redepict.api.dependencies import get_current_user
from src.redepict.models.models import User
from src.redepict.storage import minio_client
from src.redepict.core.config import settings #!!!

import src.redepict.db.crud as crud

router = APIRouter(prefix="/upload-drawing", tags=["Upload-drawing"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

MAX_FILE_SIZE = 5 * 1024 * 1024

@router.post("/upload-drawing", response_model=DrawingResponse)
async def upload_drawing(
    file: UploadFile = File(...),
    technique: str | None = None,
    level: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # валидация типа ДО сохранения (константа у вас объявлена, но не используется)
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Допустимы только jpeg / png / webp",
        )

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Файл слишком большой. Максимальный размер: 5 МБ."
        )

    # Придумываем уникальный ключ и кладём файл в MinIO.
    object_key = minio_client.build_object_key(
        user_id=current_user.id,
        original_name=file.filename or "drawing.png",
    )
    minio_client.upload_bytes(object_key, content, file.content_type)

    # file_path = await save_upload_file(file)

    drawing = crud.create_drawing(
        db=db,
        user_id=current_user.id,
        bucket=settings.minio_bucket,
        object_key=object_key,
        original_name=file.filename or "unnamed",
        mime_type=file.content_type,
        size_bytes=len(content),
        technique=technique,
        level=level,
    )

    # В ответ добавляем свежую временную ссылку на картинку.
    resp = DrawingResponse.model_validate(drawing,
                                          from_attributes=True)
    resp.image_url = minio_client.get_presigned_url(
        drawing.minio_bucket, drawing.minio_object_key)
    return resp
    # return drawing