import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session
from src.redepict.db.base import get_db
from src.redepict.api.schemas import DrawingResponse
from .file_path import save_upload_file
from src.redepict.api.dependencies import get_current_user
from src.redepict.models.models import User
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

    file_path = await save_upload_file(file)

    drawing = crud.create_drawing(
        db=db,
        user_id=current_user.id,
        object_key=file_path,
        original_name=file.filename or "unnamed",
        mime_type=file.content_type,
        size_bytes=file.size or 0,  # size бывает None — страховка
        technique=technique,
        level=level,
        image_url=f"/{file_path}",
    )

    # 3. вернуть схему из ORM-объекта
    return drawing